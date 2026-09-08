/**
 * =============================================================================
 * ALEXANDER VO — EDITORIAL STUDIO CONTROLLER
 * Architecture: 11 Project Pop-ups • Custom 4-Column Layouts • Uncropped Media
 * =============================================================================
 */

import { siteConfig, projects } from './data/projects.js';

class StudioApp {
  constructor() {
    this.highestZIndex = 200;
    this.activeWindows = new Set();
    this.audioEnabled = true;
    this.audioCtx = null;

    this.init();
  }

  init() {
    this.initAudio();
    this.renderDesktopItems();
    this.initSystemClock();
    this.initDraggables();
    this.initLightbox();
    this.initFooterPlatformLinks();
    this.initContactDrawer();
    this.initWindowResizeListener();
  }

  /* ---------------------------------------------------------------------------
     TÍNH TOÁN BỐ CỤC TRẢI ĐỀU 4 CỘT TRÊN CANVAS (KHÔNG ĐỂ TRỐNG BÊN PHẢI)
     --------------------------------------------------------------------------- */
  computeResponsivePositions() {
    const stage = document.getElementById('canvas-stage');
    const stageWidth = stage ? stage.clientWidth : window.innerWidth;
    const stageHeight = stage ? stage.clientHeight : window.innerHeight;

    let numCols = 4;
    if (stageWidth >= 1200) {
      numCols = 4;
    } else if (stageWidth >= 880) {
      numCols = 3;
    } else if (stageWidth >= 580) {
      numCols = 2;
    } else {
      numCols = 1;
    }

    const itemWidth = 215; // Chiều rộng tag desktop
    const itemHeight = 195; // Chiều cao ước tính tag desktop

    // Tính toán khoảng cách cột sao cho dàn trải đều từ trái sang phải màn hình
    const totalItemWidth = numCols * itemWidth;
    let colGap = 40;
    let sideMargin = 50;

    if (stageWidth > totalItemWidth + 60) {
      sideMargin = Math.max(30, Math.min(90, Math.floor((stageWidth - totalItemWidth) / (numCols + 1))));
      const remainingWidth = stageWidth - totalItemWidth - (sideMargin * 2);
      colGap = Math.floor(remainingWidth / Math.max(1, numCols - 1));
    }

    const topMargin = 25;
    const numRows = Math.ceil(projects.length / numCols);
    const availHeight = stageHeight - topMargin - 30;
    const rowGap = Math.max(15, Math.min(36, Math.floor((availHeight - (numRows * itemHeight)) / Math.max(1, numRows - 1))));

    const positions = {};
    projects.forEach((p, idx) => {
      const col = idx % numCols;
      const row = Math.floor(idx / numCols);
      const x = Math.round(sideMargin + col * (itemWidth + colGap));
      const y = Math.round(topMargin + row * (itemHeight + rowGap));
      positions[p.id] = { x, y };
    });
    return positions;
  }

  /* ---------------------------------------------------------------------------
     00. DYNAMIC DESKTOP ITEMS RENDERER (11 DỰ ÁN VỚI BỐ CỤC CHUYÊN BIỆT)
     --------------------------------------------------------------------------- */
  renderDesktopItems() {
    const container = document.getElementById('desktop-canvas-layer');
    if (!container) return;

    const responsivePositions = this.computeResponsivePositions();

    container.innerHTML = projects.map(p => {
      const num = p.id.replace('tag-', '');
      const contentHtml = this.buildProjectContent(p);
      const pos = responsivePositions[p.id] || p.initialPosition;

      return `
        <article class="desktop-item" id="desktop-item-${num}" data-project-id="${p.id}" style="top: ${pos.y}px; left: ${pos.x}px;">
          <!-- ICON FACE (COLLAPSED DESKTOP ICON) -->
          <div class="item-icon-face" title="Nhấp để mở pop-up [${p.folderName}]">
            <div class="icon-window-tile">
              <div class="icon-top-bar">
                <span class="icon-tag-id">[${p.tagNumber}]</span>
                <span class="icon-drag-dots" title="Kéo thả icon">:::</span>
              </div>
              <div class="icon-preview-box">
                <img src="${p.thumbnail}" alt="${p.folderName}" class="icon-img-thumb" draggable="false" loading="lazy" />
                <div class="icon-crosshair">+</div>
                <span class="icon-format-pill">${p.gifs.length > 0 ? 'LOOP & STILLS' : 'STILLS'}</span>
              </div>
            </div>
            <div class="desktop-icon-external-label">
              <span class="desktop-icon-external-title">${p.folderName}</span>
            </div>
          </div>

          <!-- WINDOW FACE (EXPANDED POPUP) -->
          <div class="item-window-face">
            <div class="window-chrome" title="Kéo để di chuyển cửa sổ">
              <div class="chrome-left">
                <span class="chrome-tag">[POP-UP // ${p.folderName}]</span>
              </div>
              <div class="chrome-controls">
                <button class="win-btn win-btn-minimize" type="button" title="Thu nhỏ về icon" aria-label="Minimize">_</button>
                <button class="win-btn win-btn-maximize" type="button" title="Phóng to toàn màn hình" aria-label="Maximize">□</button>
                <button class="win-btn win-btn-close" type="button" title="Đóng cửa sổ" aria-label="Close">[X]</button>
              </div>
            </div>

            <div class="window-content">
              ${contentHtml}
            </div>
          </div>
        </article>
      `;
    }).join('\n');
  }

  /* ---------------------------------------------------------------------------
     BUILD CONTENT CHO TỪNG DỰ ÁN (TIÊU ĐỀ MỤC & BADGE CHUẨN, KHÔNG NOTE NGOẶC ĐƠN)
     --------------------------------------------------------------------------- */
  buildProjectContent(p) {
    const folder = p.folderName;

    // Helper tạo intro text box nếu dự án có file text
    const makeIntroBox = (text) => text ? `
      <div class="popup-intro-block col-span-4">
        <div class="popup-intro-badge">[THÔNG TIN DỰ ÁN // ${folder}]</div>
        <p class="popup-intro-text">${text}</p>
      </div>
    ` : '';

    // Helper tạo grid item ảnh uncropped (không bị xén kích thước, có fallback)
    const makeImageItem = (img, spanClass = 'col-span-2') => `
      <div class="popup-grid-item ${spanClass}" data-full-src="${img.src}" title="Nhấp để xem ảnh đầy đủ">
        <img src="${img.src}" alt="${img.name}" loading="lazy" decoding="async" onerror="if(this.src!=='${img.originalSrc}')this.src='${img.originalSrc}';" />
        <div class="item-zoom-hover"><span>⛶ PHÓNG TO</span></div>
      </div>
    `;

    // Helper tạo grid item GIF uncropped kèm badge pill
    const makeGifItem = (gif, spanClass = 'col-span-2') => `
      <div class="popup-grid-item ${spanClass} gif-item" data-full-src="${gif.webpSrc || gif.gifSrc}" title="Nhấp để phóng to loop">
        <picture>
          <source srcset="${gif.webpSrc}" type="image/webp" />
          <img src="${gif.webpSrc || gif.gifSrc}" alt="${gif.name}" class="loop-media-el" loading="lazy" decoding="async" />
        </picture>
        <span class="item-badge-pill">● LOOP</span>
        <div class="item-zoom-hover"><span>⛶ PHÓNG TO</span></div>
      </div>
    `;

    // -------------------------------------------------------------------------
    // 1. YEON
    // -------------------------------------------------------------------------
    if (folder === 'yeon') {
      const introImg = p.images.find(i => i.name.includes('giới thiệu'));
      const storyboardImg = p.images.find(i => i.name.includes('storyboard'));
      const loopGif = p.gifs.find(g => g.name.includes('cut scenes')) || p.gifs[0];
      const otherImages = p.images.filter(i => !i.name.includes('giới thiệu') && !i.name.includes('storyboard') && !i.name.includes('thumb'));

      return `
        <div class="popup-4col-grid">
          <!-- Nhúng MV chính thức lên đầu chiếm 4 ô -->
          <div class="col-span-4 popup-video-feature">
            <div class="popup-section-label"><span class="dot-rec">●</span> OFFICIAL MUSIC VIDEO [YEON 연 - VCC LEFT HAND ft. HAZEL]</div>
            <div class="responsive-video-16-9">
              <iframe data-src="https://www.youtube.com/embed/brOVkbMMoDY" title="Yeon 연 - VCC LEFT HAND ft. HAZEL (Official Music Video)" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen loading="lazy"></iframe>
            </div>
          </div>

          <!-- Video Teaser Clip (YouTube Embed) -->
          <div class="col-span-4 popup-video-feature">
            <div class="popup-section-label"><span class="dot-rec">●</span> OFFICIAL TEASER CLIP [YEON 연]</div>
            <div class="responsive-video-16-9">
              <iframe data-src="https://www.youtube.com/embed/gcAJK9RjQeY?enablejsapi=1" title="Teaser- Yeon" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen loading="lazy"></iframe>
            </div>
          </div>

          <!-- Set designer giới thiệu chiếm 4 ô -->
          ${introImg ? `
            <div class="hero-4col-item popup-grid-item col-span-4" data-full-src="${introImg.src}">
              <img src="${introImg.src}" alt="${introImg.name}" loading="lazy" />
              <div class="item-zoom-hover"><span>⛶ PHÓNG TO</span></div>
            </div>
          ` : ''}

          <!-- Storyboard to ra 4 ô và để ngay dưới phần giới thiệu -->
          ${storyboardImg ? `
            <div class="hero-4col-item popup-grid-item col-span-4" data-full-src="${storyboardImg.src}">
              <img src="${storyboardImg.src}" alt="${storyboardImg.name}" loading="lazy" />
              <div class="item-zoom-hover"><span>⛶ PHÓNG TO</span></div>
            </div>
          ` : ''}

          <!-- GIF loop to lên chiếm 4 ô -->
          ${loopGif ? `
            <div class="hero-4col-item popup-grid-item col-span-4 gif-item" data-full-src="${loopGif.webpSrc || loopGif.gifSrc}">
              <picture>
                <source srcset="${loopGif.webpSrc}" type="image/webp" />
                <img src="${loopGif.webpSrc || loopGif.gifSrc}" alt="${loopGif.name}" class="loop-media-el" loading="lazy" />
              </picture>
              <span class="item-badge-pill">● EXCLUSIVE LOOP SCENE</span>
              <div class="item-zoom-hover"><span>⛶ PHÓNG TO</span></div>
            </div>
          ` : ''}

          <!-- Stills uncropped (hiển thị đầy đủ kích thước, không bị xén) -->
          <div class="col-span-4 popup-section-label">PRODUCTION STILLS & FRAMES</div>
          ${otherImages.map(img => makeImageItem(img, 'col-span-2')).join('')}
        </div>
      `;
    }

    // -------------------------------------------------------------------------
    // 2. TME (Trong Mắt Em)
    // -------------------------------------------------------------------------
    if (folder === 'TME') {
      const cutSceneGif = p.gifs.find(g => g.name.toLowerCase().includes('cut scene'));
      const btsGif = p.gifs.find(g => g.name.toLowerCase().includes('bts'));
      const stills = p.images.filter(i => !i.name.includes('thumb'));

      return `
        <div class="popup-4col-grid">
          ${makeIntroBox(p.introText)}

          <!-- Nhúng MV chính thức chiếm 4 ô -->
          <div class="col-span-4 popup-video-feature">
            <div class="popup-section-label"><span class="dot-rec">●</span> OFFICIAL MUSIC VIDEO [TRONG MẮT EM / cùng iMAZE]</div>
            <div class="responsive-video-16-9">
              <iframe data-src="https://www.youtube.com/embed/38A3A6PbBa8" title="TRONG MẮT EM / cùng iMAZE (thước phim âm nhạc do Vinh Thoòng đạo diễn)" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen loading="lazy"></iframe>
            </div>
          </div>

          <!-- GIF loop cut scene để lên phía dưới MV chính thức và trên phần ảnh -->
          ${cutSceneGif ? `
            <div class="hero-4col-item popup-grid-item col-span-4 gif-item" data-full-src="${cutSceneGif.webpSrc || cutSceneGif.gifSrc}">
              <picture>
                <source srcset="${cutSceneGif.webpSrc}" type="image/webp" />
                <img src="${cutSceneGif.webpSrc || cutSceneGif.gifSrc}" alt="${cutSceneGif.name}" class="loop-media-el" loading="lazy" />
              </picture>
              <span class="item-badge-pill">● CUT SCENE LOOP</span>
              <div class="item-zoom-hover"><span>⛶ PHÓNG TO</span></div>
            </div>
          ` : ''}

          <!-- Phần hình ảnh hiển thị đầy đủ không bị xén -->
          <div class="col-span-4 popup-section-label">PROJECT STILL FRAMES</div>
          ${stills.map(img => makeImageItem(img, 'col-span-2')).join('')}

          <!-- GIF loop BTS để ở DƯỚI CÙNG -->
          ${btsGif ? `
            <div class="col-span-4 popup-section-label"><span class="dot-rec">●</span> BTS ON-SET LOOP</div>
            <div class="hero-4col-item popup-grid-item col-span-4 gif-item" data-full-src="${btsGif.webpSrc || btsGif.gifSrc}">
              <picture>
                <source srcset="${btsGif.webpSrc}" type="image/webp" />
                <img src="${btsGif.webpSrc || btsGif.gifSrc}" alt="${btsGif.name}" class="loop-media-el" loading="lazy" />
              </picture>
              <span class="item-badge-pill">● BTS LOOP</span>
              <div class="item-zoom-hover"><span>⛶ PHÓNG TO</span></div>
            </div>
          ` : ''}
        </div>
      `;
    }

    // -------------------------------------------------------------------------
    // 3. BLENDER
    // -------------------------------------------------------------------------
    if (folder === 'BLENDER') {
      // Loại bỏ logo.jpg sau khi mở pop up
      const renders = p.images.filter(i => !i.name.toLowerCase().includes('logo'));

      return `
        <div class="popup-4col-grid">
          <!-- Video Showcase chiếm 4 ô phía trên cùng -->
          <div class="col-span-4 popup-video-feature">
            <div class="popup-section-label"><span class="dot-rec">●</span> [01 // VIDEO SHOWCASE ROBOT & LAB]</div>
            <div class="responsive-video-16-9">
              <iframe data-src="https://www.youtube.com/embed/XAGAUDqIIwE?enablejsapi=1" title="Showcase Robot Video" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen loading="lazy"></iframe>
            </div>
          </div>

          <!-- Video Animation 3D chiếm 4 ô phía trên cùng -->
          <div class="col-span-4 popup-video-feature">
            <div class="popup-section-label"><span class="dot-rec">●</span> [02 // 3D ANIMATION CLIP]</div>
            <div class="responsive-video-16-9">
              <iframe data-src="https://www.youtube.com/embed/IgKtUs8jymY?enablejsapi=1" title="Backroom Rule NO.1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen loading="lazy"></iframe>
            </div>
          </div>

          <!-- Các Cut Scene để 1 ô như bình thường (4 video cut scene xếp 1 hàng 4 ô) -->
          <div class="col-span-4 popup-section-label"><span class="dot-rec">●</span> ANIMATION CUT SCENES</div>
          <div class="popup-grid-item col-span-1 cutscene-video-box">
            <iframe data-src="https://www.youtube.com/embed/BB_kma-dvnA?enablejsapi=1" title="scene 1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen loading="lazy"></iframe>
            <span class="item-badge-pill">SCENE 1</span>
          </div>
          <div class="popup-grid-item col-span-1 cutscene-video-box">
            <iframe data-src="https://www.youtube.com/embed/jRNmXGCwUPI?enablejsapi=1" title="scene 2" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen loading="lazy"></iframe>
            <span class="item-badge-pill">SCENE 2</span>
          </div>
          <div class="popup-grid-item col-span-1 cutscene-video-box">
            <iframe data-src="https://www.youtube.com/embed/6TTl0D9HqyQ?enablejsapi=1" title="scene 3" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen loading="lazy"></iframe>
            <span class="item-badge-pill">SCENE 3</span>
          </div>
          <div class="popup-grid-item col-span-1 cutscene-video-box">
            <iframe data-src="https://www.youtube.com/embed/oBxai85ekJ4?enablejsapi=1" title="scene 4" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen loading="lazy"></iframe>
            <span class="item-badge-pill">SCENE 4</span>
          </div>

          <!-- Các render 3D hiển thị đầy đủ không bị xén -->
          <div class="col-span-4 popup-section-label">3D RENDERS & LAB VIEWS</div>
          ${renders.map(img => makeImageItem(img, 'col-span-2')).join('')}
        </div>
      `;
    }

    // -------------------------------------------------------------------------
    // 4. THEEND
    // -------------------------------------------------------------------------
    if (folder === 'THEEND') {
      const stills = p.images.filter(i => !i.name.includes('thumb'));

      return `
        <div class="popup-4col-grid">
          ${makeIntroBox(p.introText)}

          <!-- Mood film đầu tiên chiếm 4 ô -->
          <div class="col-span-4 popup-video-feature">
            <div class="popup-section-label"><span class="dot-rec">●</span> [01 // MOOD FILM - THEEND]</div>
            <div class="responsive-video-16-9">
              <iframe data-src="https://www.youtube.com/embed/v7DXsi1BqEU?enablejsapi=1" title="The End Of The Beggining - Fasshion mood film" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen loading="lazy"></iframe>
            </div>
          </div>

          <!-- Teaser video 1 & video 2 -->
          <div class="col-span-2 popup-video-feature">
            <div class="popup-section-label"><span class="dot-rec">●</span> [02 // TEASER CLIP 01]</div>
            <div class="responsive-video-16-9">
              <video controls loop muted playsinline preload="none">
                <source data-src="/assets/THEEND/video1.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
          <div class="col-span-2 popup-video-feature">
            <div class="popup-section-label"><span class="dot-rec">●</span> [03 // TEASER CLIP 02]</div>
            <div class="responsive-video-16-9">
              <video controls loop muted playsinline preload="none">
                <source data-src="/assets/THEEND/video%202.mp4" type="video/mp4" />
              </video>
            </div>
          </div>

          <!-- BTS Video Clips (BTS 1, BTS 2, BTS clip, pic8) -->
          <div class="col-span-4 popup-section-label"><span class="dot-rec">●</span> ON-SET PRODUCTION BTS ARCHIVE</div>
          <div class="popup-grid-item col-span-1 cutscene-video-box">
            <video controls playsinline loop muted preload="none">
              <source data-src="/assets/THEEND/BTS%201.mp4" type="video/mp4" />
            </video>
            <span class="item-badge-pill">BTS 01</span>
          </div>
          <div class="popup-grid-item col-span-1 cutscene-video-box">
            <video controls playsinline loop muted preload="none">
              <source data-src="/assets/THEEND/BTS%202.mp4" type="video/mp4" />
            </video>
            <span class="item-badge-pill">BTS 02</span>
          </div>
          <div class="popup-grid-item col-span-1 cutscene-video-box">
            <video controls playsinline loop muted preload="none">
              <source data-src="/assets/THEEND/BTS%20clip.mp4" type="video/mp4" />
            </video>
            <span class="item-badge-pill">BTS CLIP</span>
          </div>
          <div class="popup-grid-item col-span-1 cutscene-video-box">
            <video controls playsinline loop muted preload="none">
              <source data-src="/assets/THEEND/pic8.mp4" type="video/mp4" />
            </video>
            <span class="item-badge-pill">SHORT CUT</span>
          </div>

          <!-- Các hình JPG uncropped -->
          <div class="col-span-4 popup-section-label">PROJECT STILL FRAMES</div>
          ${stills.map(img => makeImageItem(img, 'col-span-2')).join('')}
        </div>
      `;
    }

    // -------------------------------------------------------------------------
    // 5. LONG CHÂU
    // -------------------------------------------------------------------------
    if (folder === 'LONG CHÂU') {
      const stills = p.images.filter(i => !i.name.includes('thumb'));

      return `
        <div class="popup-4col-grid">
          ${makeIntroBox(p.introText)}

          <!-- 4 GIF loops lên trước -->
          <div class="col-span-4 popup-section-label"><span class="dot-rec">●</span> ANIMATED CUT SCENES & BTS LOOPS</div>
          ${p.gifs.map(g => makeGifItem(g, 'col-span-2')).join('')}

          <!-- Video Voice Talent -->
          <div class="col-span-4 popup-video-feature">
            <div class="popup-section-label"><span class="dot-rec">●</span> [VOICE TALENT RECORDING]</div>
            <div class="responsive-video-16-9">
              <video controls playsinline loop muted preload="none">
                <source data-src="/assets/LONG%20CH%C3%82U/Voice%20Talent.mp4" type="video/mp4" />
              </video>
            </div>
          </div>

          <!-- Toàn bộ ảnh kể cả BTS 1 & BTS 2 hiển thị đầy đủ size, không bị xén preview -->
          <div class="col-span-4 popup-section-label">CAMPAIGN STILLS & BTS PHOTOS</div>
          ${stills.map(img => makeImageItem(img, 'col-span-2')).join('')}
        </div>
      `;
    }

    // -------------------------------------------------------------------------
    // 6. ART (mauvaart)
    // -------------------------------------------------------------------------
    if (folder === 'mauvaart') {
      const introImg = p.images.find(i => i.name.includes('14'));
      const paintings = p.images.filter(i => !i.name.includes('14') && !i.name.includes('thumb'));

      return `
        <div class="popup-4col-grid">
          <!-- Phần giới thiệu to ra 4 ô (14.webp) -->
          ${introImg ? `
            <div class="hero-4col-item popup-grid-item col-span-4" data-full-src="${introImg.src}">
              <img src="${introImg.src}" alt="${introImg.name}" loading="lazy" />
              <div class="item-zoom-hover"><span>⛶ PHÓNG TO</span></div>
            </div>
          ` : ''}

          <!-- Các bức tranh hội họa uncropped -->
          <div class="col-span-4 popup-section-label">ARTWORKS & LANDSCAPES</div>
          ${paintings.map(img => makeImageItem(img, 'col-span-2')).join('')}
        </div>
      `;
    }

    // -------------------------------------------------------------------------
    // 7. FEIN
    // -------------------------------------------------------------------------
    if (folder === 'FEIN') {
      const introImg = p.images.find(i => i.name.includes('giới thiệu'));
      const boardImg = p.images.find(i => i.name.includes('board'));
      const stills = p.images.filter(i => !i.name.includes('giới thiệu') && !i.name.includes('board') && !i.name.includes('thumb'));

      return `
        <div class="popup-4col-grid">
          <!-- Phần giới thiệu to ra 4 ô -->
          ${introImg ? `
            <div class="hero-4col-item popup-grid-item col-span-4" data-full-src="${introImg.src}">
              <img src="${introImg.src}" alt="${introImg.name}" loading="lazy" />
              <div class="item-zoom-hover"><span>⛶ PHÓNG TO</span></div>
            </div>
          ` : ''}

          <!-- Phần storyboard to ra 4 ô -->
          ${boardImg ? `
            <div class="hero-4col-item popup-grid-item col-span-4" data-full-src="${boardImg.src}">
              <img src="${boardImg.src}" alt="${boardImg.name}" loading="lazy" />
              <div class="item-zoom-hover"><span>⛶ PHÓNG TO</span></div>
            </div>
          ` : ''}

          <!-- Video MV Remake FE!N chiếm 4 ô -->
          <div class="col-span-4 popup-video-feature">
            <div class="popup-section-label"><span class="dot-rec">●</span> MV REMAKE [FE!N - TRAVIS SCOTT]</div>
            <div class="responsive-video-16-9">
              <iframe data-src="https://www.youtube.com/embed/nNZQQpEvqwM?enablejsapi=1" title="Fein - Travis Scott ( unofficial lyrics video - fanmade )" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen loading="lazy"></iframe>
            </div>
          </div>

          <!-- Các ảnh stills uncropped -->
          <div class="col-span-4 popup-section-label">PROJECT STILLS</div>
          ${stills.map(img => makeImageItem(img, 'col-span-2')).join('')}
        </div>
      `;
    }

    // -------------------------------------------------------------------------
    // 8. TH TRUE FOOD
    // -------------------------------------------------------------------------
    if (folder === 'TH TRUE FOOD') {
      const stills = p.images.filter(i => !i.name.includes('thumb'));

      return `
        <div class="popup-4col-grid">
          ${makeIntroBox(p.introText)}

          <!-- Loop GIF BTS lên trước -->
          ${p.gifs.map(g => makeGifItem(g, 'col-span-4')).join('')}

          <!-- TVC video BTS 1 chiếm 4 ô -->
          <div class="col-span-4 popup-video-feature">
            <div class="popup-section-label"><span class="dot-rec">●</span> COMMERCIAL TVC BTS [MASTER]</div>
            <div class="responsive-video-16-9">
              <video controls playsinline loop muted preload="none">
                <source data-src="/assets/TH%20TRUE%20FOOD/BTS%201.mp4" type="video/mp4" />
              </video>
            </div>
          </div>

          <!-- Các video BTS on-set từ 3 đến 7 xếp theo hàng -->
          <div class="col-span-4 popup-section-label"><span class="dot-rec">●</span> ON-SET PRODUCTION BTS CLIPS</div>
          <div class="popup-grid-item col-span-2 cutscene-video-box">
            <video controls playsinline loop muted preload="none">
              <source data-src="/assets/TH%20TRUE%20FOOD/BTS%203.mp4" type="video/mp4" />
            </video>
            <span class="item-badge-pill">BTS 03</span>
          </div>
          <div class="popup-grid-item col-span-2 cutscene-video-box">
            <video controls playsinline loop muted preload="none">
              <source data-src="/assets/TH%20TRUE%20FOOD/BTS%204.mp4" type="video/mp4" />
            </video>
            <span class="item-badge-pill">BTS 04</span>
          </div>
          <div class="popup-grid-item col-span-2 cutscene-video-box">
            <video controls playsinline loop muted preload="none">
              <source data-src="/assets/TH%20TRUE%20FOOD/BTS%205.mp4" type="video/mp4" />
            </video>
            <span class="item-badge-pill">BTS 05</span>
          </div>
          <div class="popup-grid-item col-span-2 cutscene-video-box">
            <video controls playsinline loop muted preload="none">
              <source data-src="/assets/TH%20TRUE%20FOOD/BTS%206.mp4" type="video/mp4" />
            </video>
            <span class="item-badge-pill">BTS 06</span>
          </div>
          <div class="popup-grid-item col-span-4 cutscene-video-box">
            <video controls playsinline loop muted preload="none">
              <source data-src="/assets/TH%20TRUE%20FOOD/BTS%207.mp4" type="video/mp4" />
            </video>
            <span class="item-badge-pill">BTS 07</span>
          </div>

          <!-- Các hình dọc đã xoay chuẩn 100%, hiện trọn vẹn preview -->
          <div class="col-span-4 popup-section-label">ON-SET SET DESIGN STILLS</div>
          ${stills.map(img => makeImageItem(img, 'col-span-2')).join('')}
        </div>
      `;
    }

    // -------------------------------------------------------------------------
    // 9. UNI PROJECT
    // -------------------------------------------------------------------------
    if (folder === 'uni project') {
      const introImg = p.images.find(i => i.name.includes('12'));
      const otherPosters = p.images.filter(i => !i.name.includes('12') && !i.name.includes('thumb'));

      return `
        <div class="popup-4col-grid">
          <!-- Phần giới thiệu to ra 4 ô -->
          ${introImg ? `
            <div class="hero-4col-item popup-grid-item col-span-4" data-full-src="${introImg.src}">
              <img src="${introImg.src}" alt="${introImg.name}" loading="lazy" />
              <div class="item-zoom-hover"><span>⛶ PHÓNG TO</span></div>
            </div>
          ` : ''}

          <!-- Các tấm hình đồ án giữ đầy đủ size và hiện đầy đủ không bị xén -->
          <div class="col-span-4 popup-section-label">POSTERS & EXHIBITION SHOTS</div>
          ${otherPosters.map(img => makeImageItem(img, 'col-span-2')).join('')}
        </div>
      `;
    }

    // -------------------------------------------------------------------------
    // 10. NO ALCOHOL
    // -------------------------------------------------------------------------
    if (folder === 'NO ALCOHOL') {
      const stills = p.images.filter(i => !i.name.includes('thumb'));

      return `
        <div class="popup-4col-grid">
          <div class="col-span-4">
            ${makeIntroBox(p.introText)}
          </div>

          <!-- Các GIF loop lên trước -->
          <div class="col-span-4 popup-section-label"><span class="dot-rec">●</span> MUSIC VIDEO CUT SCENE LOOPS</div>
          ${p.gifs.map(g => makeGifItem(g, 'col-span-2')).join('')}

          <!-- Video BTS 1 -->
          <div class="col-span-4 popup-video-feature">
            <div class="popup-section-label"><span class="dot-rec">●</span> ON-SET BTS VIDEO</div>
            <div class="responsive-video-16-9">
              <video controls playsinline loop muted preload="none">
                <source data-src="/assets/NO%20ALCOHOL/BTS%201.mp4" type="video/mp4" />
              </video>
            </div>
          </div>

          <!-- Các tấm hình BTS JPG mới hiển thị đầy đủ hình ảnh WebP/JPG -->
          <div class="col-span-4 popup-section-label">BTS & PRODUCTION STILLS</div>
          ${stills.map(img => makeImageItem(img, 'col-span-2')).join('')}
        </div>
      `;
    }

    // -------------------------------------------------------------------------
    // 11. GẠCH ĐÔNG DƯƠNG
    // -------------------------------------------------------------------------
    if (folder === 'GẠCH ĐÔNG DƯƠNG') {
      const p1 = p.images.find(i => i.name.includes('pic 1'));
      const p2 = p.images.find(i => i.name.includes('pic 2'));
      const p3 = p.images.find(i => i.name.includes('pic 3'));
      const p4 = p.images.find(i => i.name.includes('pic 4'));
      const p5 = p.images.find(i => i.name.includes('pic 5'));
      const p6 = p.images.find(i => i.name.includes('pic 6'));
      const p7 = p.images.find(i => i.name.includes('pic 7'));
      const p8 = p.images.find(i => i.name.includes('pic 8'));

      return `
        <div class="popup-4col-grid">
          ${makeIntroBox(p.introText)}

          <!-- Các ảnh lẻ hiện đầy đủ kích thước -->
          <div class="col-span-4 popup-section-label">CONCEPT STILLS</div>
          ${p1 ? makeImageItem(p1, 'col-span-2') : ''}
          ${p2 ? makeImageItem(p2, 'col-span-2') : ''}
          ${p3 ? makeImageItem(p3, 'col-span-2') : ''}
          ${p4 ? makeImageItem(p4, 'col-span-2') : ''}

          <!-- 2 ảnh pic6 và pic7 ghép liền kề ngang tạo ảnh dài -->
          <div class="col-span-4 popup-section-label"><span class="dot-rec">●</span> PANORAMA VIEW</div>
          ${p6 && p7 ? `
            <div class="panorama-strip-horizontal col-span-4">
              <div class="panorama-half" data-full-src="${p6.src}">
                <img src="${p6.src}" alt="${p6.name}" loading="lazy" />
                <div class="item-zoom-hover"><span>⛶ PHÓNG TO</span></div>
              </div>
              <div class="panorama-half" data-full-src="${p7.src}">
                <img src="${p7.src}" alt="${p7.name}" loading="lazy" />
                <div class="item-zoom-hover"><span>⛶ PHÓNG TO</span></div>
              </div>
            </div>
          ` : ''}

          <!-- pic5 và pic8: 1 hình dọc dài, pic5 ở trên và pic8 ở dưới, ĐẶT Ở CUỐI POP-UP -->
          <div class="col-span-4 popup-section-label"><span class="dot-rec">●</span> VERTICAL PANORAMA</div>
          ${p5 && p8 ? `
            <div class="panorama-stack-vertical col-span-4">
              <div class="vertical-half" data-full-src="${p5.src}">
                <img src="${p5.src}" alt="${p5.name}" loading="lazy" />
                <div class="item-zoom-hover"><span>⛶ PHÓNG TO</span></div>
              </div>
              <div class="vertical-half" data-full-src="${p8.src}">
                <img src="${p8.src}" alt="${p8.name}" loading="lazy" />
                <div class="item-zoom-hover"><span>⛶ PHÓNG TO</span></div>
              </div>
            </div>
          ` : ''}
        </div>
      `;
    }

    // Default fallback
    return `
      <div class="popup-4col-grid">
        ${makeIntroBox(p.introText)}
        ${p.gifs.map(g => makeGifItem(g, 'col-span-2')).join('')}
        ${p.images.map(img => makeImageItem(img, 'col-span-2')).join('')}
      </div>
    `;
  }

  /* ---------------------------------------------------------------------------
     02. LOCAL SYSTEM CLOCK
     --------------------------------------------------------------------------- */
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
     02.1 AUDIO SYNTHESIS ENGINE (TACTILE MECHANICAL CLICK)
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

    // Phát âm thanh click chuột cơ học chân thực mỗi khi click chuột trên toàn trang
    window.addEventListener('pointerdown', (e) => {
      if (!this.audioEnabled) return;
      if (e.target.closest('#btn-audio-toggle')) return;

      const isInteractive = e.target.closest('button, a, .item-icon-face, .window-chrome, .popup-grid-item, input, textarea, .win-btn');
      this.playTactileSound(isInteractive ? 'high' : 'normal');
    }, { capture: true, passive: true });
  }

  playTactileSound(tone = 'normal') {
    if (!this.audioEnabled) return;
    try {
      if (!this.audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioContext();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
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
     03. DRAGGABLE DESKTOP ITEMS & EXPAND / COLLAPSE
     --------------------------------------------------------------------------- */
  initDraggables() {
    const items = document.querySelectorAll('.desktop-item');

    items.forEach(item => {
      const iconFace = item.querySelector('.item-icon-face');
      const windowChrome = item.querySelector('.window-chrome');

      // Dragging icon
      if (iconFace) {
        this.makeElementDraggable(item, iconFace, 'icon');
      }

      // Dragging window
      if (windowChrome) {
        this.makeElementDraggable(item, windowChrome, 'window');
      }

      // Click icon mở pop-up
      iconFace?.addEventListener('click', () => {
        if (item.dataset.wasDragged === 'true') {
          item.dataset.wasDragged = 'false';
          return;
        }
        this.expandItem(item);
      });

      // Điều khiển cửa sổ
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
        item.classList.toggle('is-maximized');
      });

      windowChrome?.addEventListener('dblclick', (e) => {
        if (e.target.closest('button')) return;
        item.classList.toggle('is-maximized');
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
     04. EXPAND & COLLAPSE POP-UP
     --------------------------------------------------------------------------- */
  expandItem(item) {
    if (!item) return;
    if (item.classList.contains('is-expanded')) {
      this.bringToFront(item);
      return;
    }

    item.dataset.savedLeft = item.style.left || '';
    item.dataset.savedTop = item.style.top || '';

    const stage = document.getElementById('canvas-stage');
    const stageWidth = stage ? stage.clientWidth : window.innerWidth;
    const stageHeight = stage ? stage.clientHeight : window.innerHeight;
    const targetWidth = Math.min(880, stageWidth - 24);
    const targetHeight = Math.min(720, stageHeight - 40);

    const rect = item.getBoundingClientRect();
    const parentRect = item.offsetParent ? item.offsetParent.getBoundingClientRect() : { left: 0, top: 0 };
    let currentLeft = rect.left - parentRect.left;
    let currentTop = rect.top - parentRect.top;

    if (currentLeft + targetWidth > stageWidth - 20) {
      currentLeft = Math.max(20, stageWidth - targetWidth - 20);
    }
    if (currentLeft < 20) currentLeft = 20;

    if (currentTop + targetHeight > stageHeight - 20) {
      currentTop = Math.max(20, stageHeight - targetHeight - 20);
    }
    if (currentTop < 10) currentTop = 10;

    item.style.left = `${currentLeft}px`;
    item.style.top = `${currentTop}px`;

    item.classList.add('is-expanded');
    item.classList.remove('is-minimized');
    this.bringToFront(item);

    this.activeWindows.add(item.id);

    // Kích hoạt nạp media theo yêu cầu (chỉ tải video khi mở popup)
    this.activateWindowMedia(item);
    this.playTactileSound('high');

    const tagTitle = item.querySelector('.chrome-tag')?.textContent || item.id;
    this.showToast(`MỞ RỘNG: ${tagTitle}`);
  }

  collapseItem(item) {
    if (!item) return;
    // Tạm dừng mọi video đang phát trong popup khi đóng hoặc thu nhỏ
    this.deactivateWindowMedia(item);
    this.playTactileSound('low');

    item.classList.remove('is-expanded');
    item.classList.remove('is-minimized');
    item.classList.remove('is-maximized');

    if (item.dataset.savedLeft !== undefined) {
      item.style.left = item.dataset.savedLeft;
      item.style.top = item.dataset.savedTop;
    }

    this.activeWindows.delete(item.id);
  }

  /* ---------------------------------------------------------------------------
     04.1 LAZY LOADING & QUẢN LÝ MEDIA THEO POPUP (TỐI ƯU TỐC ĐỘ TẢI TRANG)
     --------------------------------------------------------------------------- */
  activateWindowMedia(item) {
    if (!item) return;

    const windowContent = item.querySelector('.window-content');

    // 1. Kích hoạt YouTube Iframe khi mở popup (Hero iframe nạp ngay, Cutscene iframe nạp khi cuộn đến)
    const iframes = item.querySelectorAll('iframe[data-src]');
    const loadIframeEl = (iframe) => {
      if (!iframe.getAttribute('src') && iframe.dataset.src) {
        iframe.src = iframe.dataset.src;
      }
    };

    iframes.forEach(iframe => {
      if (iframe.closest('.popup-video-feature') || !('IntersectionObserver' in window)) {
        loadIframeEl(iframe);
      } else {
        const observer = new IntersectionObserver((entries, obs) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              loadIframeEl(iframe);
              obs.unobserve(iframe);
            }
          });
        }, {
          root: windowContent,
          rootMargin: '250px'
        });
        observer.observe(iframe);
      }
    });

    // 2. Kích hoạt Videos theo viewport của popup window-content
    const videos = item.querySelectorAll('video');

    const loadVideoEl = (video) => {
      let shouldLoad = false;
      video.querySelectorAll('source[data-src]').forEach(source => {
        if (!source.getAttribute('src') && source.dataset.src) {
          source.src = source.dataset.src;
          shouldLoad = true;
        }
      });
      if (!video.getAttribute('src') && video.dataset.src) {
        video.src = video.dataset.src;
        shouldLoad = true;
      }
      if (shouldLoad) {
        video.load();
        if (video.dataset.autoplay === 'true') {
          video.play().catch(() => {});
        }
      }
    };

    videos.forEach(video => {
      // Hero video đầu trang hoặc nếu trình duyệt không hỗ trợ IntersectionObserver
      if (video.closest('.popup-video-feature') || !('IntersectionObserver' in window)) {
        loadVideoEl(video);
      } else {
        // Video phụ (BTS / Cutscenes) chỉ tải khi cuộn tới gần
        const observer = new IntersectionObserver((entries, obs) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              loadVideoEl(video);
              obs.unobserve(video);
            }
          });
        }, {
          root: windowContent,
          rootMargin: '250px'
        });
        observer.observe(video);
      }
    });
  }

  deactivateWindowMedia(item) {
    if (!item) return;
    item.querySelectorAll('video').forEach(v => {
      try {
        v.pause();
      } catch {
        // Safe ignore
      }
    });
    item.querySelectorAll('iframe').forEach(iframe => {
      try {
        iframe.contentWindow?.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
      } catch {
        // Safe ignore
      }
    });
  }

  /* ---------------------------------------------------------------------------
     05. LIGHTBOX MODAL (XEM ẢNH & GIF PHÓNG TO)
     --------------------------------------------------------------------------- */
  initLightbox() {
    const lightbox = document.getElementById('media-lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.getElementById('lightbox-close');

    if (!lightbox || !lightboxImg) return;

    // Lắng nghe sự kiện click vào bất kỳ ảnh / gif / panorama nào
    document.addEventListener('click', (e) => {
      const targetEl = e.target.closest('[data-full-src]');
      if (!targetEl) return;

      const fullSrc = targetEl.dataset.fullSrc;
      if (!fullSrc) return;

      lightboxImg.src = fullSrc;
      lightbox.classList.add('is-open');
    });

    const closeLightbox = () => {
      lightbox.classList.remove('is-open');
      lightboxImg.src = '';
    };

    closeBtn?.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.classList.contains('is-open')) {
        closeLightbox();
      }
    });
  }

  /* ---------------------------------------------------------------------------
     08. DIRECT APP & WEB PLATFORM CHANNELS IN FOOTER
     --------------------------------------------------------------------------- */
  initFooterPlatformLinks() {
    const platformLinks = document.querySelectorAll('.footer-platform-strip .platform-btn');
    const emailBtn = document.getElementById('btn-footer-email');
    const cvBtn = document.getElementById('btn-footer-cv');

    platformLinks.forEach(link => {
      const platform = link.dataset.platform;
      if (!platform) return;

      const lower = platform.toLowerCase();
      if (siteConfig.creator.socials && siteConfig.creator.socials[lower]) {
        link.href = siteConfig.creator.socials[lower];
      }
    });

    emailBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      const email = siteConfig.creator.email || 'hoanglong9975@gmail.com';
      this.copyEmailToClipboard(email);
    });

    cvBtn?.addEventListener('click', (e) => {
      this.handleCvDownloadAndOpen(e);
    });
  }

  handleCvDownloadAndOpen(e) {
    if (e) e.preventDefault();
    const pdfUrl = siteConfig.creator.cv || '/HoangLam_CV.pdf';
    const fileName = 'CV_HoangLam.pdf';

    // 1. Mở xem trực tiếp trong tab mới
    window.open(pdfUrl, '_blank');

    // 2. Kích hoạt tải file PDF về máy
    const downloadAnchor = document.createElement('a');
    downloadAnchor.href = pdfUrl;
    downloadAnchor.download = fileName;
    downloadAnchor.style.display = 'none';
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();

    setTimeout(() => {
      if (downloadAnchor.parentNode) {
        downloadAnchor.parentNode.removeChild(downloadAnchor);
      }
    }, 150);

    this.showToast('ĐANG MỞ & TẢI XUỐNG CV HOÀNG LÂM (PDF)');
  }

  /* ---------------------------------------------------------------------------
     08B. CONTACT DRAWER & EMAIL COPY HANDLERS
     --------------------------------------------------------------------------- */
  initContactDrawer() {
    const contactModal = document.getElementById('modal-contact');
    const openContactBtn = document.getElementById('btn-open-contact');
    const closeContactBtn = document.getElementById('btn-close-contact');
    const copyEmailBtn = document.getElementById('btn-copy-email');
    const drawerCvBtn = document.getElementById('btn-drawer-cv');
    const drawerSocialCv = document.getElementById('link-drawer-social-cv');
    const emailLink = document.getElementById('email-link');
    const contactForm = document.getElementById('contact-form');

    // Mở Contact Drawer khi nhấp nút [CONTACT ✉]
    openContactBtn?.addEventListener('click', () => {
      contactModal?.classList.remove('is-hidden');
    });

    // Đóng Contact Drawer khi nhấp [CLOSE ✕]
    closeContactBtn?.addEventListener('click', () => {
      contactModal?.classList.add('is-hidden');
    });

    // Nhấp nút sao chép email trong Contact Drawer
    copyEmailBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      const email = siteConfig.creator.email || 'hoanglong9975@gmail.com';
      this.copyEmailToClipboard(email);
    });

    // Nhấp nút tải và mở CV trong Contact Drawer
    drawerCvBtn?.addEventListener('click', (e) => {
      this.handleCvDownloadAndOpen(e);
    });

    drawerSocialCv?.addEventListener('click', (e) => {
      this.handleCvDownloadAndOpen(e);
    });

    // Nhấp link email trực tiếp trong Contact Drawer
    emailLink?.addEventListener('click', (e) => {
      e.preventDefault();
      const email = siteConfig.creator.email || 'hoanglong9975@gmail.com';
      this.copyEmailToClipboard(email);
    });

    // Submit form giả lập gửi tin nhắn
    contactForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.showToast('DISPATCH TRANSMITTED TO DIRECTORS DESK');
      contactModal?.classList.add('is-hidden');
      contactForm.reset();
    });

    // Đóng modal khi nhấn phím Escape
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && contactModal && !contactModal.classList.contains('is-hidden')) {
        contactModal.classList.add('is-hidden');
      }
    });
  }

  copyEmailToClipboard(email) {
    const targetEmail = email || siteConfig.creator.email || 'hoanglong9975@gmail.com';
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(targetEmail).then(() => {
        this.showToast(`ĐÃ COPY VÀO BỘ NHỚ TẠM: ${targetEmail}`);
      }).catch(() => {
        this.fallbackCopyText(targetEmail);
      });
    } else {
      this.fallbackCopyText(targetEmail);
    }
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
      this.showToast(`ĐÃ COPY VÀO BỘ NHỚ TẠM: ${text}`);
    } catch {
      this.showToast(`DISPATCH: ${text}`);
    }
    document.body.removeChild(textArea);
  }

  /* ---------------------------------------------------------------------------
     09. AUTO-REPOSITION ON WINDOW RESIZE (DÀN TRẢI KHÔNG ĐỂ TRỐNG)
     --------------------------------------------------------------------------- */
  initWindowResizeListener() {
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const responsivePositions = this.computeResponsivePositions();
        document.querySelectorAll('.desktop-item').forEach(item => {
          // Chỉ reposition nếu item chưa bị kéo thả thủ công và không đang mở pop-up
          if (!item.classList.contains('is-expanded') && item.dataset.wasDragged !== 'true') {
            const pid = item.dataset.projectId;
            if (responsivePositions[pid]) {
              item.style.left = `${responsivePositions[pid].x}px`;
              item.style.top = `${responsivePositions[pid].y}px`;
            }
          }
        });
      }, 150);
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
    }, 2200);
  }
}

// Instantiate on DOM load
if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', () => {
    window.studioApp = new StudioApp();
  });
} else {
  window.studioApp = new StudioApp();
}
