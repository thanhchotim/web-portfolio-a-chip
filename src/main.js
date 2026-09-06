/**
 * =============================================================================
 * ALEXANDER VO — EDITORIAL STUDIO CONTROLLER
 * Architecture: SMPTE Engine • Draggable Viewports • Split Slider • Audio FX
 * =============================================================================
 */

import { siteConfig, projects } from './data/projects.js';

class StudioApp {
  constructor() {
    this.audioEnabled = false;
    this.audioCtx = null;
    this.highestZIndex = 200;
    this.activeWindows = new Set(['window-tag-01', 'window-tag-02', 'window-tag-03', 'window-tag-04']);
    this.smpteFrames = 0;
    this.smpteSeconds = 14;
    this.smpteMinutes = 23;
    this.smpteHours = 1;

    this.init();
  }

  init() {
    this.initAudio();
    this.initTimecodeEngine();
    this.initSystemClock();
    this.initDraggables();
    this.initColorGradingSlider();
    this.initVideoPlayers();
    this.initViewSwitcher();
    this.initDrawers();
    this.initFooterPlatformLinks();
    this.initIndexArchive();
    this.updateActiveWindowsBadge();
  }

  /* ---------------------------------------------------------------------------
     01. AUDIO SYNTHESIS ENGINE (TACTILE MECHANICAL CLICK)
     --------------------------------------------------------------------------- */
  initAudio() {
    const audioBtn = document.getElementById('btn-audio-toggle');
    const audioText = document.getElementById('audio-state-text');

    audioBtn?.addEventListener('click', () => {
      this.audioEnabled = !this.audioEnabled;
      if (this.audioEnabled) {
        if (!this.audioCtx) {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          this.audioCtx = new AudioContext();
        }
        if (this.audioCtx.state === 'suspended') {
          this.audioCtx.resume();
        }
        audioBtn.classList.add('is-on');
        if (audioText) audioText.textContent = 'SFX: ON';
        this.playTactileSound('high');
        this.showToast('TACTICAL SFX: ACTIVATED');
      } else {
        audioBtn.classList.remove('is-on');
        if (audioText) audioText.textContent = 'SFX: OFF';
        this.showToast('TACTICAL SFX: MUTED');
      }
    });
  }

  playTactileSound(tone = 'normal') {
    if (!this.audioEnabled || !this.audioCtx) return;
    try {
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      const freq = tone === 'high' ? 980 : tone === 'low' ? 320 : 540;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.04);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.045);
    } catch {
      // Audio context policy fallback
    }
  }

  /* ---------------------------------------------------------------------------
     02. SMPTE 24FPS TIMECODE & LOCAL SYSTEM CLOCK
     --------------------------------------------------------------------------- */
  initTimecodeEngine() {
    const globalSmpteEl = document.getElementById('global-smpte-clock');
    const tc1 = document.querySelector('.tc-live-01');
    const tc2 = document.querySelector('.tc-live-02');
    const tc3 = document.querySelector('.tc-live-03');
    const tc4 = document.querySelector('.tc-live-04');

    // 24 frames per second clock ticker
    setInterval(() => {
      this.smpteFrames++;
      if (this.smpteFrames >= 24) {
        this.smpteFrames = 0;
        this.smpteSeconds++;
        if (this.smpteSeconds >= 60) {
          this.smpteSeconds = 0;
          this.smpteMinutes++;
          if (this.smpteMinutes >= 60) {
            this.smpteMinutes = 0;
            this.smpteHours = (this.smpteHours + 1) % 24;
          }
        }
      }

      const f = String(this.smpteFrames).padStart(2, '0');
      const s = String(this.smpteSeconds).padStart(2, '0');
      const m = String(this.smpteMinutes).padStart(2, '0');
      const h = String(this.smpteHours).padStart(2, '0');
      const timecodeStr = `${h}:${m}:${s}:${f}`;

      if (globalSmpteEl) globalSmpteEl.textContent = timecodeStr;
      if (tc1) tc1.textContent = `01:${m}:${s}:${f}`;
      if (tc2) tc2.textContent = `00:${String((this.smpteMinutes + 12) % 60).padStart(2, '0')}:${s}:${f}`;
      if (tc3) tc3.textContent = `03:${String((this.smpteMinutes + 25) % 60).padStart(2, '0')}:${s}:${f}`;
      if (tc4) tc4.textContent = `04:${String((this.smpteMinutes + 40) % 60).padStart(2, '0')}:${s}:${f}`;
    }, 1000 / 24);
  }

  initSystemClock() {
    const clockEl = document.getElementById('live-system-time');
    const updateTime = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      if (clockEl) clockEl.textContent = `${h}:${m}:${s} LOC`;
    };
    updateTime();
    setInterval(updateTime, 1000);
  }

  /* ---------------------------------------------------------------------------
     03. HIGH-PRECISION DRAGGABLE DESKTOP ITEMS & MORPHING SYSTEM
     --------------------------------------------------------------------------- */
  initDraggables() {
    this.activeWindows = new Set();
    const items = document.querySelectorAll('.desktop-item');

    items.forEach(item => {
      const iconFace = item.querySelector('.item-icon-face');
      const windowChrome = item.querySelector('.window-chrome');

      // Dragging in Icon Mode
      if (iconFace) {
        this.makeElementDraggable(item, iconFace, 'icon');
      }

      // Dragging in Window Mode
      if (windowChrome) {
        this.makeElementDraggable(item, windowChrome, 'window');
      }

      // Clicking icon face expands the item into the 720px popup window
      iconFace?.addEventListener('click', (e) => {
        if (item.dataset.wasDragged === 'true') {
          item.dataset.wasDragged = 'false';
          return;
        }
        this.expandItem(item);
      });

      // Window Chrome controls
      const closeBtn = item.querySelector('.win-btn-close');
      const minBtn = item.querySelector('.win-btn-minimize');
      const maxBtn = item.querySelector('.win-btn-maximize');

      closeBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.collapseItem(item);
      });

      minBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.collapseItem(item);
      });

      maxBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.playTactileSound('normal');
        item.classList.toggle('is-maximized');
      });

      windowChrome?.addEventListener('dblclick', (e) => {
        if (e.target.closest('button')) return;
        item.classList.toggle('is-maximized');
        this.playTactileSound('high');
      });

      item.addEventListener('pointerdown', () => this.bringToFront(item));
    });
  }

  makeElementDraggable(element, handle, mode = 'icon') {
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let initialLeft = 0;
    let initialTop = 0;

    const onPointerDown = (e) => {
      if (e.target.closest('button') || e.target.closest('a')) return;
      if (e.button !== undefined && e.button !== 0) return;

      isDragging = true;
      element.dataset.wasDragged = 'false';
      this.bringToFront(element);
      this.playTactileSound('low');

      startX = e.clientX;
      startY = e.clientY;

      const rect = element.getBoundingClientRect();
      const parentRect = element.offsetParent ? element.offsetParent.getBoundingClientRect() : { left: 0, top: 0 };
      
      initialLeft = rect.left - parentRect.left;
      initialTop = rect.top - parentRect.top;

      element.classList.add('is-dragging');
      try {
        handle.setPointerCapture(e.pointerId);
      } catch {
        // Fallback
      }

      handle.addEventListener('pointermove', onPointerMove);
      handle.addEventListener('pointerup', onPointerUp);
      handle.addEventListener('pointercancel', onPointerUp);

      e.preventDefault();
    };

    const onPointerMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        element.dataset.wasDragged = 'true';
      }

      const stage = document.getElementById('canvas-stage');
      const stageWidth = stage ? stage.clientWidth : window.innerWidth;
      const stageHeight = stage ? stage.clientHeight : window.innerHeight;

      let newLeft = initialLeft + dx;
      let newTop = initialTop + dy;

      const elemWidth = element.offsetWidth;
      newLeft = Math.max(10, Math.min(stageWidth - elemWidth - 10, newLeft));
      newTop = Math.max(10, Math.min(stageHeight - 60, newTop));

      element.style.left = `${newLeft}px`;
      element.style.top = `${newTop}px`;
    };

    const onPointerUp = (e) => {
      if (!isDragging) return;
      isDragging = false;
      element.classList.remove('is-dragging');
      try {
        handle.releasePointerCapture(e.pointerId);
      } catch {
        // Fallback
      }
      handle.removeEventListener('pointermove', onPointerMove);
      handle.removeEventListener('pointerup', onPointerUp);
      handle.removeEventListener('pointercancel', onPointerUp);
    };

    handle.addEventListener('pointerdown', onPointerDown);
  }

  bringToFront(element) {
    this.highestZIndex += 1;
    element.style.zIndex = this.highestZIndex;

    document.querySelectorAll('.desktop-item').forEach(el => el.classList.remove('is-focused'));
    element.classList.add('is-focused');
  }

  /* ---------------------------------------------------------------------------
     04. MORPHING CONTROLS (EXPAND ICON TO 720PX WINDOW / COLLAPSE TO ICON)
     --------------------------------------------------------------------------- */
  expandItem(item) {
    if (!item) return;
    if (item.classList.contains('is-expanded')) {
      this.bringToFront(item);
      return;
    }

    // Save exact position before expanding so collapsing returns to the exact same spot
    item.dataset.savedLeft = item.style.left || '';
    item.dataset.savedTop = item.style.top || '';
    item.dataset.savedRight = item.style.right || '';
    item.dataset.savedBottom = item.style.bottom || '';

    // Auto-adjust position so the 720px window stays gracefully on screen
    const stage = document.getElementById('canvas-stage');
    const stageWidth = stage ? stage.clientWidth : window.innerWidth;
    const stageHeight = stage ? stage.clientHeight : window.innerHeight;
    const targetWidth = Math.min(720, stageWidth - 24);
    const targetHeight = Math.min(560, stageHeight - 40);

    const rect = item.getBoundingClientRect();
    const parentRect = item.offsetParent ? item.offsetParent.getBoundingClientRect() : { left: 0, top: 0 };
    let currentLeft = rect.left - parentRect.left;
    let currentTop = rect.top - parentRect.top;

    if (currentLeft + targetWidth > stageWidth - 20) {
      currentLeft = Math.max(20, stageWidth - targetWidth - 20);
    }
    if (currentLeft < 20) {
      currentLeft = 20;
    }

    if (currentTop + targetHeight > stageHeight - 20) {
      currentTop = Math.max(20, stageHeight - targetHeight - 20);
    }
    if (currentTop < 10) {
      currentTop = 10;
    }

    item.style.left = `${currentLeft}px`;
    item.style.top = `${currentTop}px`;
    item.style.right = 'auto';
    item.style.bottom = 'auto';

    item.classList.add('is-expanded');
    item.classList.remove('is-minimized');
    this.bringToFront(item);

    this.activeWindows.add(item.id);
    this.updateActiveWindowsBadge();
    this.playTactileSound('high');

    const tagTitle = item.querySelector('.chrome-tag')?.textContent || item.id;
    this.showToast(`EXPANDED VIEWPORT: ${tagTitle}`);
  }

  collapseItem(item) {
    if (!item) return;
    item.classList.remove('is-expanded');
    item.classList.remove('is-minimized');
    item.classList.remove('is-maximized');

    // Restore exact position before opening
    if (item.dataset.savedLeft !== undefined) {
      item.style.left = item.dataset.savedLeft;
      item.style.top = item.dataset.savedTop;
      item.style.right = item.dataset.savedRight;
      item.style.bottom = item.dataset.savedBottom;
    }

    this.activeWindows.delete(item.id);
    this.updateActiveWindowsBadge();
    this.playTactileSound('low');
    this.showToast('COLLAPSED TO DESKTOP ICON');
  }

  updateActiveWindowsBadge() {
    const counter = document.getElementById('active-count-value');
    if (counter) {
      counter.textContent = String(this.activeWindows.size);
    }
  }

  /* ---------------------------------------------------------------------------
     05. COLOR GRADING REEL: INTERACTIVE BEFORE / AFTER SLIDER (TAG 04)
     --------------------------------------------------------------------------- */
  initColorGradingSlider() {
    const container = document.getElementById('grading-slider-box');
    const beforeMask = document.getElementById('grading-before-mask');
    const handle = document.getElementById('grading-slider-handle');

    if (!container || !beforeMask || !handle) return;

    let isSliding = false;

    const updateSlider = (clientX) => {
      const rect = container.getBoundingClientRect();
      const x = clientX - rect.left;
      let percentage = (x / rect.width) * 100;
      percentage = Math.max(0, Math.min(100, percentage));

      beforeMask.style.clipPath = `polygon(0 0, ${percentage}% 0, ${percentage}% 100%, 0 100%)`;
      handle.style.left = `${percentage}%`;
    };

    container.addEventListener('pointerdown', (e) => {
      isSliding = true;
      container.setPointerCapture(e.pointerId);
      updateSlider(e.clientX);
      this.playTactileSound('normal');
    });

    container.addEventListener('pointermove', (e) => {
      if (!isSliding) return;
      updateSlider(e.clientX);
    });

    const stopSliding = (e) => {
      if (!isSliding) return;
      isSliding = false;
      try {
        container.releasePointerCapture(e.pointerId);
      } catch {
        // Fallback
      }
    };

    container.addEventListener('pointerup', stopSliding);
    container.addEventListener('pointercancel', stopSliding);
  }

  /* ---------------------------------------------------------------------------
     06. VIDEO PLAYER QUICK CONTROLS & FULLSCREEN
     --------------------------------------------------------------------------- */
  initVideoPlayers() {
    const videoWrappers = document.querySelectorAll('.player-wrapper');

    videoWrappers.forEach(wrapper => {
      const video = wrapper.querySelector('video');
      const playBtn = wrapper.querySelector('.v-btn-play');
      const muteBtn = wrapper.querySelector('.v-btn-mute');
      const fsBtn = wrapper.querySelector('.v-btn-fullscreen');

      if (!video) return;

      playBtn?.addEventListener('click', () => {
        if (video.paused) {
          video.play();
          playBtn.textContent = '❚❚';
        } else {
          video.pause();
          playBtn.textContent = '▶';
        }
        this.playTactileSound('normal');
      });

      muteBtn?.addEventListener('click', () => {
        video.muted = !video.muted;
        muteBtn.textContent = video.muted ? 'UNMUTE' : 'MUTE';
        this.playTactileSound('normal');
      });

      fsBtn?.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          wrapper.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
        this.playTactileSound('high');
      });

      // Double-click video to toggle fullscreen
      video.addEventListener('dblclick', () => {
        if (!document.fullscreenElement) {
          wrapper.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      });
    });
  }

  /* ---------------------------------------------------------------------------
     07. VIEW SWITCHER (CANVAS FREE VIEW VS INDEX ARCHIVE)
     --------------------------------------------------------------------------- */
  initViewSwitcher() {
    const canvasBtn = document.getElementById('view-mode-canvas');
    const indexBtn = document.getElementById('view-mode-index');
    const desktopLayer = document.getElementById('desktop-canvas-layer');
    const indexView = document.getElementById('index-archive-view');

    canvasBtn?.addEventListener('click', () => {
      canvasBtn.classList.add('is-active');
      indexBtn?.classList.remove('is-active');
      indexView?.classList.add('is-hidden');
      if (desktopLayer) desktopLayer.style.display = 'block';
      this.playTactileSound('high');
    });

    indexBtn?.addEventListener('click', () => {
      indexBtn.classList.add('is-active');
      canvasBtn?.classList.remove('is-active');
      indexView?.classList.remove('is-hidden');
      if (desktopLayer) desktopLayer.style.display = 'none';
      this.playTactileSound('high');
    });
  }

  /* ---------------------------------------------------------------------------
     08. EDITORIAL DRAWERS (INFO / ABOUT & CONTACT)
     --------------------------------------------------------------------------- */
  initDrawers() {
    const aboutModal = document.getElementById('modal-about');
    const contactModal = document.getElementById('modal-contact');

    const openAboutBtn = document.getElementById('btn-open-about');
    const closeAboutBtn = document.getElementById('btn-close-about');

    const openContactBtn = document.getElementById('btn-open-contact');
    const closeContactBtn = document.getElementById('btn-close-contact');

    const copyEmailBtn = document.getElementById('btn-copy-email');

    // About Modal
    openAboutBtn?.addEventListener('click', () => {
      aboutModal?.classList.remove('is-hidden');
      contactModal?.classList.add('is-hidden');
      this.playTactileSound('high');
    });

    closeAboutBtn?.addEventListener('click', () => {
      aboutModal?.classList.add('is-hidden');
      this.playTactileSound('low');
    });

    // Contact Modal
    openContactBtn?.addEventListener('click', () => {
      contactModal?.classList.remove('is-hidden');
      aboutModal?.classList.add('is-hidden');
      this.playTactileSound('high');
    });

    closeContactBtn?.addEventListener('click', () => {
      contactModal?.classList.add('is-hidden');
      this.playTactileSound('low');
    });

    // Copy Email
    copyEmailBtn?.addEventListener('click', () => {
      const email = siteConfig.creator.email;
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(email).then(() => {
          this.showToast(`COPIED DISPATCH: ${email}`);
          this.playTactileSound('high');
        }).catch(() => {
          this.fallbackCopyText(email);
        });
      } else {
        this.fallbackCopyText(email);
      }
    });

    // Contact form submit simulation
    const form = document.getElementById('contact-form');
    form?.addEventListener('submit', () => {
      this.showToast('DISPATCH TRANSMITTED TO DIRECTORS DESK');
      this.playTactileSound('high');
      contactModal?.classList.add('is-hidden');
      form.reset();
    });

    // Close drawers on Escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        aboutModal?.classList.add('is-hidden');
        contactModal?.classList.add('is-hidden');
      }
    });
  }

  /* ---------------------------------------------------------------------------
     08B. DIRECT APP & WEB PLATFORM CHANNELS IN FOOTER
     --------------------------------------------------------------------------- */
  initFooterPlatformLinks() {
    const platformLinks = document.querySelectorAll('.footer-platform-strip .platform-btn');
    const emailBtn = document.getElementById('btn-footer-email');

    // Wire URLs dynamically from siteConfig
    platformLinks.forEach(link => {
      const platform = link.dataset.platform;
      if (!platform) return;

      const lower = platform.toLowerCase();
      if (siteConfig.creator.socials && siteConfig.creator.socials[lower]) {
        link.href = siteConfig.creator.socials[lower];
      }

      link.addEventListener('click', (e) => {
        if (lower === 'email') {
          // Handled by emailBtn
          return;
        }
        this.playTactileSound('high');
        this.showToast(`CONNECTING TO ${platform.toUpperCase()} ↗`);
      });
    });

    emailBtn?.addEventListener('click', () => {
      const email = siteConfig.creator.email || 'contact@alexandervo.studio';
      this.playTactileSound('high');
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(email).then(() => {
          this.showToast(`COPIED DISPATCH: ${email}`);
        }).catch(() => {
          this.fallbackCopyText(email);
        });
      } else {
        this.fallbackCopyText(email);
      }
    });
  }

  fallbackCopyText(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      this.showToast(`COPIED DISPATCH: ${text}`);
      this.playTactileSound('high');
    } catch {
      this.showToast(`DISPATCH: ${text}`);
    }
    document.body.removeChild(textArea);
  }

  /* ---------------------------------------------------------------------------
     09. STRUCTURED INDEX ARCHIVE POPULATION
     --------------------------------------------------------------------------- */
  initIndexArchive() {
    const tableBody = document.getElementById('index-table-rows');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    projects.forEach(project => {
      const row = document.createElement('div');
      row.className = 'index-table-row';
      row.innerHTML = `
        <span class="row-tag">${project.tagNumber}</span>
        <div class="row-title-block">
          <div class="row-title">${project.title}</div>
          <div class="row-specs" style="color: #666; font-size: 9px;">${project.client} // ${project.year}</div>
        </div>
        <span class="row-role">${project.role}</span>
        <span class="row-specs">${project.metadata.sensor || project.metadata.colorScience || '4K DCI'}</span>
        <button class="row-btn" type="button">[LAUNCH ↗]</button>
      `;

      row.addEventListener('click', () => {
        const canvasBtn = document.getElementById('view-mode-canvas');
        canvasBtn?.click();
        const tagNum = project.tagNumber.replace('TAG ', '').trim();
        const targetItem = document.getElementById(`desktop-item-${tagNum}`);
        if (targetItem) {
          this.expandItem(targetItem);
        }
      });

      tableBody.appendChild(row);
    });
  }

  /* ---------------------------------------------------------------------------
     10. NOTIFICATION TOAST
     --------------------------------------------------------------------------- */
  showToast(message) {
    const toast = document.getElementById('hud-toast');
    if (!toast) return;

    toast.textContent = message;
    toast.classList.remove('is-hidden');

    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      toast.classList.add('is-hidden');
    }, 2400);
  }
}

// Instantiate on DOM load or immediate if ready
if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', () => {
    window.studioApp = new StudioApp();
  });
} else {
  window.studioApp = new StudioApp();
}
