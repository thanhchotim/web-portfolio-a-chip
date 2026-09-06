/**
 * =============================================================================
 * DỮ LIỆU DỰ ÁN & HƯỚNG DẪN CẤU HÌNH (PROJECT DATA CONFIGURATION)
 * =============================================================================
 * 
 * Chào bạn! Đây là file chứa toàn bộ thông tin dự án, video nhúng, hình ảnh và thông số kỹ thuật.
 * Bạn có thể dễ dàng thay đổi nội dung bên dưới:
 * 
 * 1. ĐỔI VIDEO:
 *    - Nếu dùng file MP4 trực tiếp: đặt type: 'html5', src: '/assets/ten-video.mp4' hoặc link online
 *    - Nếu dùng YouTube: đặt type: 'youtube', embedId: 'MÃ_VIDEO_YOUTUBE' (ví dụ 'dQw4w9WgXcQ')
 *    - Nếu dùng Vimeo: đặt type: 'vimeo', embedId: 'MÃ_VIDEO_VIMEO' (ví dụ '76979871')
 * 
 * 2. ĐỔI HÌNH ẢNH / STILLS:
 *    - Đặt ảnh vào thư mục /public/assets/ rồi trỏ đường dẫn như '/assets/anh_cua_ban.jpg'
 * 
 * 3. ĐỔI THÔNG TIN KỸ THUẬT (SLATE):
 *    - Chỉnh sửa camera, codec, fps, aspect ratio theo thực tế dự án của bạn.
 * =============================================================================
 */

export const siteConfig = {
  creator: {
    name: "ALEXANDER VO",
    studio: "ARCHIVE / STUDIO",
    role: "DIRECTOR & LEAD COLORIST",
    location: "HANOI, VN [GMT+7]",
    availability: "AVAILABLE FOR COMMISSIONS — Q2/Q3 2026",
    email: "contact@alexandervo.studio",
    socials: {
      vimeo: "https://vimeo.com",
      instagram: "https://instagram.com",
      youtube: "https://youtube.com",
      behance: "https://behance.net"
    },
    bio: [
      "Specializing in high-cadence commercial storytelling, music videos, and precision color science.",
      "Rooted in raw brutalist cinematography, architectural framing, and custom film print emulation (Kodak 2383 / 5219 grain pipelines).",
      "Operating across DaVinci Resolve Studio (Advanced Panel), Baselight, and ARRI Alexa 35 / RED V-Raptor workflows."
    ],
    software: [
      "DaVinci Resolve Studio 19",
      "Colorfront Transkoder",
      "Baselight",
      "Adobe Premiere Pro",
      "After Effects",
      "Filmlight Dehancer / FilmConvert"
    ],
    awards: [
      { year: "2025", title: "Vimeo Staff Pick: Best Cinematography", work: "Echoes of Hanoi" },
      { year: "2024", title: "Cannes Lions Bronze: Luxury Fashion Film", work: "Aura Nocturne" },
      { year: "2024", title: "Berlin Commercial Awards Nominee", work: "Speed of Silence" },
      { year: "2023", title: "UKMVA Shortlist: Best Electronic Music Video", work: "Sub-Zero" }
    ],
    clients: [
      "PORSCHE APAC",
      "SONY MUSIC",
      "BALENCIAGA",
      "RED BULL MEDIA",
      "SAMSUNG GLOBAL",
      "WARNER MUSIC GROUP",
      "NIKE LAB"
    ]
  }
};

export const projects = [
  {
    id: "tag-01",
    tagNumber: "TAG 01",
    categoryBadge: "HERO PROJECT // MUSIC VIDEO",
    title: "yeon-music video",
    subtitle: "MUSIC VIDEO & DYNAMIC STAGE VISUALS",
    role: "Lead Editor & Senior Colorist",
    year: "2026",
    client: "SONY MUSIC ENTERTAINMENT",
    aspectRatio: "16:9 DCI",
    windowWidth: 780,
    windowHeight: 560,
    initialPosition: { x: 80, y: 110 },
    
    // Cấu hình video: hỗ trợ 'html5', 'youtube', hoặc 'vimeo'
    video: {
      type: "html5",
      src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
      poster: "/assets/yeon_thumb.png",
      autoPlay: true,
      loop: true,
      muted: true
    },

    // Phân đoạn GIF Loop (Cảnh ăn bánh giò) đã được tối ưu WebP nhẹ hơn 62%
    animatedLoop: {
      title: "CẢNH ĂN BÁNH GIÒ",
      webpSrc: "/assets/canh_an_banh_gio.webp",      // Bản WebP 5.6MB (mượt 24fps vô tận, decode GPU, giảm 9MB)
      gifFallbackSrc: "/assets/CẢNH ĂN BÁNH GIÒ.gif", // Bản GIF gốc (14.5MB)
      aspectRatio: "4/3",
      fps: "24.00 FPS",
      lazyLoad: true
    },

    // Thông số máy quay & timeline dựng (Slate)
    metadata: {
      fps: "24.000 FPS",
      timecodeStart: "01:00:14:08",
      resolution: "4096 x 2304 [4K DCI]",
      aspectRatio: "16:9 / 2.39:1 MASK",
      sensor: "ARRI ALEXA 35 // 4.6K SUPER 35",
      codec: "Apple ProRes 4444 XQ",
      colorScience: "ARRI Log-C4 // ACEScc 1.3",
      audioSpecs: "24-bit 48kHz L/R Stereo Master",
      bpm: "130 BPM",
      lenses: "Cooke Anamorphic /i Full Frame Plus"
    },

    // Hình ảnh hậu trường hoặc stills cắt từ phim (Thêm bao nhiêu ảnh tùy thích, pop-up sẽ tự động cuộn xuống để duyệt)
    stills: [
      {
        url: "/assets/still_mv_01.jpg",
        caption: "STILL 01: INDUSTRIAL HALL — 35MM ANA",
        meta: "T2.0 // ISO 800 // 1/48s"
      },
      {
        url: "/assets/still_mv_02.jpg",
        caption: "STILL 02: STAGE VISUAL RIG // 30kW LASERS",
        meta: "T1.4 // ISO 1600 // 1/48s"
      },
      {
        url: "/assets/grading_graded.jpg",
        caption: "STILL 03: DUSK EXT. // 35MM KODAK 500T",
        meta: "T2.8 // ISO 500 // 1/48s"
      },
      {
        url: "/assets/vertical_reel.jpg",
        caption: "STILL 04: AVANT SILHOUETTE // MONO",
        meta: "T1.8 // ISO 1250 // 1/48s"
      }
    ],

    description:
      "A high-octane 4-minute music video and synchronized arena tour stage visual system. Edited on an aggressive metric rhythm cut to transient percussion, treated with customized film halation and photochemically accurate print curves.",

    credits: [
      { role: "Director", name: "Kaelen Voss" },
      { role: "Lead Editor", name: "Alexander Vo" },
      { role: "Colorist", name: "Alexander Vo" },
      { role: "Director of Photography", name: "Elena Rostova" },
      { role: "VFX Supervisor", name: "David K. Lind" }
    ]
  },

  {
    id: "tag-02",
    tagNumber: "TAG 02",
    categoryBadge: "COMMERCIAL // TVC 60s",
    title: "THE VECTOR DRIVE: 2026 CAMPAIGN",
    subtitle: "GLOBAL AUTOMOTIVE COMMERCIAL",
    role: "Offline & Online Editor",
    year: "2026",
    client: "ASTON & HORIZON MOTORS",
    aspectRatio: "16:9 DCI",
    windowWidth: 720,
    windowHeight: 560,
    initialPosition: { x: 480, y: 130 },

    video: {
      type: "html5",
      src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
      poster: "/assets/grading_graded.jpg",
      autoPlay: true,
      loop: true,
      muted: true
    },

    metadata: {
      fps: "23.976 FPS",
      timecodeStart: "00:01:00:00",
      resolution: "3840 x 2160 [UHD]",
      aspectRatio: "16:9 (Broadcast Safe)",
      sensor: "RED V-RAPTOR XL 8K VV",
      codec: "REDCODE RAW 8:1 ELQ",
      colorScience: "IPP2 Wide Gamut RGB",
      audioSpecs: "5.1 Surround & -14 LUFS Stereo",
      editSoftware: "DaVinci Resolve Studio 19"
    },

    // Gallery stills cho TVC xe hơi (cuộn xuống để xem)
    stills: [
      {
        url: "/assets/grading_graded.jpg",
        caption: "FRAME 01: ALPINE PASS // 8K VV",
        meta: "T2.8 // ISO 400"
      },
      {
        url: "/assets/still_mv_01.jpg",
        caption: "FRAME 02: TUNNEL GLOW // HIGH CRANK",
        meta: "T1.4 // ISO 800"
      }
    ],

    description:
      "Precision cut luxury commercial shot on coastal alpine passes. Highlighting aerodynamics, tactile carbon finishes, and dusk golden-hour transitions. Mastered for global cinema distribution and international 4K broadcast.",

    credits: [
      { role: "Agency", name: "Ogilvy / Studio M" },
      { role: "Offline Editor", name: "Alexander Vo" },
      { role: "Sound Design", name: "Formosa Group" }
    ]
  },

  {
    id: "tag-03",
    tagNumber: "TAG 03",
    categoryBadge: "SHORT REEL // 9:16 VERTICAL",
    title: "AVANT-GARDE: DECONSTRUCTED FORM",
    subtitle: "EXPERIMENTAL FASHION RUNWAY FILM",
    role: "Director & Editor",
    year: "2025",
    client: "MAISON NOIR // PARIS FASHION WEEK",
    aspectRatio: "9:16 VERTICAL",
    windowWidth: 420,
    windowHeight: 620,
    initialPosition: { x: 880, y: 200 },

    video: {
      type: "html5",
      src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      poster: "/assets/vertical_reel.jpg",
      autoPlay: true,
      loop: true,
      muted: true
    },

    metadata: {
      fps: "60.000 FPS HIGH CRANK",
      timecodeStart: "03:12:45:00",
      resolution: "2160 x 3840 [9:16 UHD]",
      aspectRatio: "9:16 Mobile Native",
      sensor: "Sony FX6 Full-Frame 4K",
      codec: "XAVC-I 10-bit 4:2:2",
      colorScience: "S-Gamut3.Cine / S-Log3",
      shutterAngle: "90° Sharp Motion",
      audioSpecs: "Binaural Stereo Spatial Master"
    },

    description:
      "A kinetic 30-second vertical film designed for high-density social platforms and boutique in-store monolithic OLED screens. Rapid architectural jump cuts synced to industrial modular techno.",

    credits: [
      { role: "Director & Editor", name: "Alexander Vo" },
      { role: "Styling", name: "Camille Delacroix" },
      { role: "Sound Design", name: "VOID System" }
    ]
  },

  {
    id: "tag-04",
    tagNumber: "TAG 04",
    categoryBadge: "COLOR GRADING // BEFORE & AFTER",
    title: "ALPINE HORIZON: FILM EMULATION",
    subtitle: "INTERACTIVE FLAT LOG VS REC.709 GRADE",
    role: "Colorist & Look Development",
    year: "2026",
    client: "SPEC / LAB PROJECT",
    aspectRatio: "16:9 DCI",
    windowWidth: 780,
    windowHeight: 560,
    initialPosition: { x: 260, y: 340 },

    // Chế độ so sánh Before / After
    isColorGradingReel: true,
    grading: {
      beforeLabel: "RAW LOG: FLAT ARRI LOG-C4",
      afterLabel: "GRADE: KODAK 2383 PRINT EMULATION",
      imageGraded: "/assets/grading_graded.jpg",
      imageLog: "/assets/grading_graded.jpg",
      sliderDefault: 50,
      nodeTree: [
        "01: Exposure & Offset Calibration",
        "02: CST to DWG / Intermediate",
        "03: Custom Tone Curve & Contrast Pivot",
        "04: Highlight Roll-off & Warm Bleed",
        "05: Split-Toning (Teal Shadows / Amber Sunset)",
        "06: Kodak 2383 D55 Print LUT Emulation",
        "07: 35mm 500T Grain & Optical Halation"
      ]
    },

    metadata: {
      fps: "24.000 FPS",
      timecodeStart: "04:00:21:12",
      resolution: "4448 x 3096 [Open Gate]",
      aspectRatio: "2.39:1 CinemaScope",
      sensor: "ARRI ALEXA Mini LF",
      codec: "ARRIRAW 4.5K",
      colorSpaceIn: "ARRI Wide Gamut 4 / LogC4",
      colorSpaceOut: "DCI-P3 / Rec.709 Gamma 2.4",
      monitoring: "Sony BVM-HX310 1000-nit HDR Master"
    },

    description:
      "Interactive color grading split comparison. Slide left to reveal the raw high-dynamic-range Log-C sensor capture; slide right to inspect the finished photochemical print emulation, preserving specular highlight detail while maintaining rich, dense chassis blacks.",

    credits: [
      { role: "Senior Colorist", name: "Alexander Vo" },
      { role: "Color Suite", name: "DaVinci Resolve 19 Advanced Panel" }
    ]
  }
];
