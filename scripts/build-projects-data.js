import fs from 'fs';
import path from 'path';

const manifest = JSON.parse(fs.readFileSync('public/assets_opt/manifest.json', 'utf8'));

const textContents = {
  'GẠCH ĐÔNG DƯƠNG': fs.readFileSync('public/assets/GẠCH ĐÔNG DƯƠNG/gachdongduong giới thieu.txt', 'utf8').trim(),
  'LONG CHÂU': 'Roles: Art Director Assistant | Voice Talent | Extra\n\nSupported the Long Châu x HIEUTHUHAI commercial project across multiple facets: assisting the Art Director in set design execution and prop coordination, acting as an extra during office scenes, and lending my voice to one of the three product mascots in the reveal sequence.',
  'NO ALCOHOL': fs.readFileSync('public/assets/NO ALCOHOL/giới thiệu NO ALCOH.txt', 'utf8').trim(),
  'TH TRUE FOOD': fs.readFileSync('public/assets/TH TRUE FOOD/TH TRUE FOOD giới thiệu.txt', 'utf8').trim(),
  'THEEND': fs.readFileSync('public/assets/THEEND/giới thiệu project.txt', 'utf8').trim(),
  'TME': fs.readFileSync('public/assets/TME/Trongmatem.txt', 'utf8').trim(),
  'FEIN': 'The song "FE!N" by Travis Scott, featuring Playboi Carti, explores themes of addiction, fame, and indulgence. This was a group project to animate and re-edit a music video we liked, so we picked this song and made the whole video with VFX effects and animated text.',
  'yeon': 'This is a music video by a rapper from Hanoi, and I had the opportunity to work as the Art Director and Set Designer for this project. The video tells the story of the main character\'s high school memories as he revisits his old school, reflecting on a friend from his teenage years.'
};

// 4 Cột phân bổ đều sang cả màn hình bên phải (không để trống bên phải)
const folderOrder = [
  { folder: 'yeon', tagNum: 'TAG 01', title: 'YEON', col: 0, row: 0 },
  { folder: 'THEEND', tagNum: 'TAG 02', title: 'THEEND', col: 1, row: 0 },
  { folder: 'FEIN', tagNum: 'TAG 03', title: 'FEIN', col: 2, row: 0 },
  { folder: 'NO ALCOHOL', tagNum: 'TAG 04', title: 'NO ALCOHOL', col: 3, row: 0 },
  { folder: 'TME', tagNum: 'TAG 05', title: 'TME', col: 0, row: 1 },
  { folder: 'LONG CHÂU', tagNum: 'TAG 06', title: 'LONG CHÂU', col: 1, row: 1 },
  { folder: 'TH TRUE FOOD', tagNum: 'TAG 07', title: 'TH TRUE FOOD', col: 2, row: 1 },
  { folder: 'GẠCH ĐÔNG DƯƠNG', tagNum: 'TAG 08', title: 'GẠCH ĐÔNG DƯƠNG', col: 3, row: 1 },
  { folder: 'BLENDER', tagNum: 'TAG 09', title: 'BLENDER', col: 0, row: 2 },
  { folder: 'mauvaart', tagNum: 'TAG 10', title: 'ART', col: 1, row: 2 },
  { folder: 'uni project', tagNum: 'TAG 11', title: 'UNI PROJECT', col: 2, row: 2 }
];

const projects = folderOrder.map(item => {
  const m = manifest[item.folder] || { images: [], gifs: [], videos: [], thumbnail: '' };
  const num = item.tagNum.replace('TAG ', '').toLowerCase();
  
  // Tọa độ mở rộng trải đều 4 cột sang bên phải màn hình
  const left = 60 + item.col * 430;
  const top = 30 + item.row * 240;

  // Xử lý riêng NO ALCOHOL với 2 file BTS 2.jpg và BTS 3.jpg mới upload
  if (item.folder === 'NO ALCOHOL') {
    m.images = m.images.map(img => {
      if (img.name.includes('BTS 2')) {
        return {
          name: 'BTS 2.jpg',
          src: '/assets_opt/NO%20ALCOHOL/BTS%202.webp',
          originalSrc: '/assets_opt/NO%20ALCOHOL/BTS%202.webp',
          width: 1400
        };
      }
      if (img.name.includes('BTS 3')) {
        return {
          name: 'BTS 3.jpg',
          src: '/assets_opt/NO%20ALCOHOL/BTS%203.webp',
          originalSrc: '/assets_opt/NO%20ALCOHOL/BTS%203.webp',
          width: 1400
        };
      }
      return img;
    });

    // Đảm bảo BTS 2 và BTS 3 có mặt trong danh sách
    const hasBts2 = m.images.some(img => img.name.includes('BTS 2'));
    if (!hasBts2) {
      m.images.unshift({
        name: 'BTS 2.jpg',
        src: '/assets_opt/NO%20ALCOHOL/BTS%202.webp',
        originalSrc: '/assets_opt/NO%20ALCOHOL/BTS%202.webp',
        width: 1400
      });
    }
    const hasBts3 = m.images.some(img => img.name.includes('BTS 3'));
    if (!hasBts3) {
      m.images.unshift({
        name: 'BTS 3.jpg',
        src: '/assets_opt/NO%20ALCOHOL/BTS%203.webp',
        originalSrc: '/assets_opt/NO%20ALCOHOL/BTS%203.webp',
        width: 1400
      });
    }
  }

  // Xử lý riêng LONG CHÂU cho BTS 1 và BTS 2
  if (item.folder === 'LONG CHÂU') {
    m.images = m.images.map(img => {
      if (img.name === 'BTS 1' || img.name === 'BTS 1.heic') {
        return {
          name: 'BTS 1',
          src: '/assets_opt/LONG%20CH%C3%82U/BTS%201.webp',
          originalSrc: '/assets_opt/LONG%20CH%C3%82U/BTS%201.webp',
          width: 1400
        };
      }
      if (img.name === 'BTS 2' || img.name === 'BTS 2.heic') {
        return {
          name: 'BTS 2',
          src: '/assets_opt/LONG%20CH%C3%82U/BTS%202.webp',
          originalSrc: '/assets_opt/LONG%20CH%C3%82U/BTS%202.webp',
          width: 1400
        };
      }
      return img;
    });
  }

  return {
    id: `tag-${num}`,
    tagNumber: item.tagNum,
    folderName: item.folder,
    title: item.title,
    thumbnail: m.thumbnail,
    introText: textContents[item.folder] || null,
    initialPosition: { x: left, y: top },
    gifs: m.gifs || [],
    images: m.images || [],
    videos: m.videos || [],
    isTheEnd: item.folder === 'THEEND'
  };
});

// Tạo file src/data/projects.js chuẩn ES module
const fileContent = `/**
 * =============================================================================
 * DỮ LIỆU 11 DỰ ÁN (PROJECT DATA CONFIGURATION) - ĐÃ TỐI ƯU HÓA WEBP & BỐ CỤC 4 CỘT
 * =============================================================================
 */

export const siteConfig = {
  creator: {
    name: "LAM HOANG",
    studio: "ARCHIVE / STUDIO",
    role: "DIRECTOR & LEAD COLORIST",
    location: "HANOI, VN [GMT+7]",
    availability: "AVAILABLE FOR COMMISSIONS — Q2/Q3 2026",
    email: "hoanglong9975@gmail.com",
    socials: {
      vimeo: "https://vimeo.com",
      instagram: "https://www.instagram.com/ttenlam/",
      youtube: "https://youtube.com",
      behance: "https://www.behance.net/lamnguyen233"
    }
  }
};

export const projects = ${JSON.stringify(projects, null, 2)};
`;

fs.writeFileSync('src/data/projects.js', fileContent, 'utf8');
console.log(`Đã tạo src/data/projects.js thành công với ${projects.length} dự án!`);
