import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';

const ffmpegPath = ffmpegInstaller.path;

console.log('=== BẮT ĐẦU TỐI ƯU HÓA VIDEO MP4 VỚI FFMPEG ===');
console.log('FFmpeg binary:', ffmpegPath);

const assetsDir = path.resolve('public/assets');

function getMp4Files(dir) {
  let results = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of list) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      results = results.concat(getMp4Files(fullPath));
    } else if (item.isFile() && item.name.toLowerCase().endsWith('.mp4') && !item.name.includes('.opt.')) {
      results.push(fullPath);
    }
  }
  return results;
}

const files = getMp4Files(assetsDir);
console.log(`Tìm thấy tổng cộng ${files.length} tệp MP4 cần tối ưu.\n`);

let totalOriginalBytes = 0;
let totalOptimizedBytes = 0;

for (let i = 0; i < files.length; i++) {
  const file = files[i];
  const relPath = path.relative(process.cwd(), file);
  const origStat = fs.statSync(file);
  const origSizeMB = (origStat.size / (1024 * 1024)).toFixed(2);
  totalOriginalBytes += origStat.size;

  const tempOutput = file + '.opt.mp4';

  console.log(`[${i + 1}/${files.length}] Đang xử lý: ${relPath} (${origSizeMB} MB)...`);
  const startTime = Date.now();

  const args = [
    '-y',
    '-i', file,
    '-c:v', 'libx264',
    '-crf', '25',
    '-preset', 'fast',
    '-c:a', 'aac',
    '-b:a', '128k',
    '-movflags', '+faststart',
    '-vf', 'scale=min(1920\\,iw):-2',
    tempOutput
  ];

  const result = spawnSync(ffmpegPath, args, { stdio: 'ignore' });
  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);

  if (result.status === 0 && fs.existsSync(tempOutput)) {
    const optStat = fs.statSync(tempOutput);
    const optSizeMB = (optStat.size / (1024 * 1024)).toFixed(2);

    if (optStat.size < origStat.size) {
      fs.unlinkSync(file);
      fs.renameSync(tempOutput, file);
      totalOptimizedBytes += optStat.size;
      const savedPercent = (((origStat.size - optStat.size) / origStat.size) * 100).toFixed(1);
      console.log(`  -> Thành công: ${origSizeMB} MB -> ${optSizeMB} MB (Tiết kiệm -${savedPercent}% trong ${durationSec}s) [Faststart enabled]`);
    } else {
      fs.unlinkSync(tempOutput);
      const faststartArgs = ['-y', '-i', file, '-c', 'copy', '-movflags', '+faststart', tempOutput];
      spawnSync(ffmpegPath, faststartArgs, { stdio: 'ignore' });
      if (fs.existsSync(tempOutput)) {
        fs.unlinkSync(file);
        fs.renameSync(tempOutput, file);
      }
      const finalStat = fs.statSync(file);
      totalOptimizedBytes += finalStat.size;
      console.log(`  -> Giữ nguyên độ nén gốc + kích hoạt Faststart (${origSizeMB} MB) trong ${durationSec}s`);
    }
  } else {
    console.error(`  -> Lỗi khi xử lý ${relPath}, giữ nguyên tệp gốc.`);
    if (fs.existsSync(tempOutput)) fs.unlinkSync(tempOutput);
    totalOptimizedBytes += origStat.size;
  }
}

const totalOrigMB = (totalOriginalBytes / (1024 * 1024)).toFixed(2);
const totalOptMB = (totalOptimizedBytes / (1024 * 1024)).toFixed(2);
const totalSavedMB = ((totalOriginalBytes - totalOptimizedBytes) / (1024 * 1024)).toFixed(2);
const totalSavedPercent = (((totalOriginalBytes - totalOptimizedBytes) / totalOriginalBytes) * 100).toFixed(1);

console.log('\n========================================');
console.log('=== HOÀN TẤT TỐI ƯU HÓA TOÀN BỘ VIDEO ===');
console.log(`Dung lượng ban đầu: ${totalOrigMB} MB`);
console.log(`Dung lượng sau khi nén: ${totalOptMB} MB`);
console.log(`Dung lượng đã tiết kiệm: -${totalSavedMB} MB (-${totalSavedPercent}%)`);
console.log('========================================\n');
