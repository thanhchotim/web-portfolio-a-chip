import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const ASSETS_DIR = path.join(process.cwd(), 'public', 'assets');
const OPT_DIR = path.join(process.cwd(), 'public', 'assets_opt');

if (!fs.existsSync(OPT_DIR)) {
  fs.mkdirSync(OPT_DIR, { recursive: true });
}

// Danh sách các thumbnail do người dùng chỉ định cho 11 folder
const THUMB_MAPPING = {
  'BLENDER': 'logo.jpg',
  'FEIN': 'travis.jpg',
  'GẠCH ĐÔNG DƯƠNG': 'pic3.jpg',
  'mauvaart': 'tự họa-01-04.jpg',
  'NO ALCOHOL': 'thumbnail.png', // user ghi thumbnail.jpg, file gốc là thumbnail.png
  'TH TRUE FOOD': 'thumb TH.png',
  'THEEND': 'pic6.jpg',
  'TME': 'pic9.jpg',
  'uni project': 'thumb.jpg',
  'LONG CHÂU': 'hth.jpg',
  'yeon': 'yeon_thumb.png'
};

async function optimize() {
  console.log('--- BẮT ĐẦU NÉN & TỐI ƯU HÓA ASSETS ---');
  const folders = fs.readdirSync(ASSETS_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  const manifest = {};
  let totalOriginalBytes = 0;
  let totalOptimizedBytes = 0;

  for (const folder of folders) {
    const srcFolder = path.join(ASSETS_DIR, folder);
    const destFolder = path.join(OPT_DIR, folder);
    if (!fs.existsSync(destFolder)) {
      fs.mkdirSync(destFolder, { recursive: true });
    }

    manifest[folder] = {
      images: [],
      gifs: [],
      videos: [],
      thumbnail: null
    };

    const files = fs.readdirSync(srcFolder);
    console.log(`\n▶ Đang xử lý thư mục [${folder}] (${files.length} files)...`);

    for (const file of files) {
      const srcFile = path.join(srcFolder, file);
      const stat = fs.statSync(srcFile);
      if (stat.isDirectory()) continue;

      totalOriginalBytes += stat.size;
      const ext = path.extname(file).toLowerCase();
      const baseName = path.basename(file, ext);
      const isDesignatedThumb = THUMB_MAPPING[folder] && THUMB_MAPPING[folder].toLowerCase() === file.toLowerCase();

      // Xử lý file GIF -> Animated WebP
      if (ext === '.gif') {
        const outName = `${baseName}.webp`;
        const destFile = path.join(destFolder, outName);
        try {
          console.log(`  [GIF -> WebP] ${file} (${(stat.size / 1024 / 1024).toFixed(2)} MB)...`);
          await sharp(srcFile, { animated: true, limitInputPixels: false })
            .resize({ width: 720, fit: 'inside', withoutEnlargement: true })
            .webp({ effort: 3, quality: 72, loop: 0 })
            .toFile(destFile);
          
          const optStat = fs.statSync(destFile);
          totalOptimizedBytes += optStat.size;
          console.log(`    -> Đã nén thành công: ${(optStat.size / 1024 / 1024).toFixed(2)} MB (giảm ${(((stat.size - optStat.size) / stat.size) * 100).toFixed(1)}%)`);

          manifest[folder].gifs.push({
            name: file,
            webpSrc: `/assets_opt/${encodeURIComponent(folder)}/${encodeURIComponent(outName)}`,
            gifSrc: `/assets/${encodeURIComponent(folder)}/${encodeURIComponent(file)}`
          });
        } catch (err) {
          console.error(`    Lỗi nén GIF ${file}:`, err.message);
          manifest[folder].gifs.push({
            name: file,
            webpSrc: `/assets/${encodeURIComponent(folder)}/${encodeURIComponent(file)}`,
            gifSrc: `/assets/${encodeURIComponent(folder)}/${encodeURIComponent(file)}`
          });
        }
      }
      // Xử lý ảnh tĩnh (JPG, PNG, HEIC hoặc không có đuôi nhưng là HEIC)
      else if (['.jpg', '.jpeg', '.png'].includes(ext) || (!ext && (file.startsWith('BTS') || file === 'scene 1'))) {
        // Kiểm tra xem có phải video không (ví dụ scene 1)
        if (file === 'scene 1') {
          manifest[folder].videos.push({
            name: file,
            src: `/assets/${encodeURIComponent(folder)}/${encodeURIComponent(file)}`
          });
          continue;
        }

        const outName = `${baseName}.webp`;
        const destFile = path.join(destFolder, outName);

        try {
          await sharp(srcFile)
            .rotate()
            .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
            .webp({ quality: 82, effort: 4 })
            .toFile(destFile);

          const optStat = fs.statSync(destFile);
          totalOptimizedBytes += optStat.size;

          const itemData = {
            name: file,
            src: `/assets_opt/${encodeURIComponent(folder)}/${encodeURIComponent(outName)}`,
            originalSrc: `/assets/${encodeURIComponent(folder)}/${encodeURIComponent(file)}`,
            width: 1600
          };
          manifest[folder].images.push(itemData);

          // Nếu là ảnh được chỉ định làm thumbnail, tạo thêm bản thumb siêu nhẹ (400px)
          if (isDesignatedThumb) {
            const thumbName = `thumb_400_${baseName}.webp`;
            const thumbFile = path.join(destFolder, thumbName);
            await sharp(srcFile)
              .resize({ width: 400, height: 400, fit: 'inside', withoutEnlargement: true })
              .webp({ quality: 80, effort: 3 })
              .toFile(thumbFile);
            
            manifest[folder].thumbnail = `/assets_opt/${encodeURIComponent(folder)}/${encodeURIComponent(thumbName)}`;
            console.log(`  ★ Tạo thumbnail thành công cho [${folder}]: ${thumbName}`);
          }
        } catch (err) {
          console.error(`    Lỗi nén ảnh ${file}:`, err.message);
          manifest[folder].images.push({
            name: file,
            src: `/assets/${encodeURIComponent(folder)}/${encodeURIComponent(file)}`,
            originalSrc: `/assets/${encodeURIComponent(folder)}/${encodeURIComponent(file)}`
          });
        }
      }
      // Xử lý Video (MP4, MOV)
      else if (['.mp4', '.mov'].includes(ext)) {
        manifest[folder].videos.push({
          name: file,
          src: `/assets/${encodeURIComponent(folder)}/${encodeURIComponent(file)}`
        });
      }
    }

    // Nếu folder chưa có thumbnail được gán, lấy ảnh đầu tiên làm fallback
    if (!manifest[folder].thumbnail && manifest[folder].images.length > 0) {
      manifest[folder].thumbnail = manifest[folder].images[0].src;
    }
  }

  // Ghi file manifest JSON để kiểm tra
  fs.writeFileSync(path.join(OPT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));

  console.log('\n=============================================');
  console.log('TỔNG KẾT NÉN ASSETS THÀNH CÔNG:');
  console.log(`- Dung lượng gốc: ${(totalOriginalBytes / 1024 / 1024).toFixed(2)} MB`);
  console.log(`- Dung lượng sau nén (WebP): ${(totalOptimizedBytes / 1024 / 1024).toFixed(2)} MB`);
  console.log(`- Tiết kiệm được: ${(((totalOriginalBytes - totalOptimizedBytes) / totalOriginalBytes) * 100).toFixed(1)}%`);
  console.log('=============================================\n');
}

optimize().catch(console.error);
