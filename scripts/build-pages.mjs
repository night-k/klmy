import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const distDir = path.join(root, 'dist');
const demoDir = path.join(distDir, 'demo');
const flowIndex = path.join(root, 'flow', 'index.html');

if (!fs.existsSync(flowIndex)) {
  console.error('缺少 flow/index.html（主线流程总览）');
  process.exit(1);
}

if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}

console.log('构建 Mock 演示（输出到 dist/demo）…');
execSync('vite build', {
  cwd: root,
  stdio: 'inherit',
  env: {
    ...process.env,
    VITE_BASE: './',
  },
});

console.log('复制主线流程总览为站点首页…');
fs.copyFileSync(flowIndex, path.join(distDir, 'index.html'));

const favicon = path.join(root, 'public', 'favicon.png');
if (fs.existsSync(favicon)) {
  fs.copyFileSync(favicon, path.join(distDir, 'favicon.png'));
  fs.copyFileSync(favicon, path.join(demoDir, 'favicon.png'));
}

console.log('');
console.log('Pages 构建完成：');
console.log('  首页（主线流程）  http://localhost:2890/');
console.log('  Mock 演示         http://localhost:2890/demo/index.html#/poms/phase1/index');
console.log('  本地预览          npm run serve:pages');
