import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const distDir = join(__dirname, '..', 'dist');
const flowIndex = join(distDir, 'index.html');
const PORT = Number(process.env.PORT || 2890);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

if (!existsSync(flowIndex)) {
  console.error('未找到 dist/index.html，请先执行：npm run build:pages');
  process.exit(1);
}

const title = readFileSync(flowIndex, 'utf8').match(/<title>([^<]+)/)?.[1] || '';
if (!title.includes('主线流程')) {
  console.warn('警告：dist/index.html 似乎不是流程总览页，请重新执行 npm run build:pages');
}

function resolveFile(urlPath) {
  const safe = normalize(urlPath).replace(/^(\.\.[/\\])+/, '');
  let filePath = join(distDir, safe);

  if (existsSync(filePath) && statSync(filePath).isDirectory()) {
    filePath = join(filePath, 'index.html');
  }

  if (!existsSync(filePath) && !extname(safe)) {
    const withIndex = join(distDir, safe, 'index.html');
    if (existsSync(withIndex)) filePath = withIndex;
  }

  return filePath;
}

createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
  const filePath = resolveFile(urlPath === '/' ? '/index.html' : urlPath);

  if (!filePath.startsWith(distDir) || !existsSync(filePath) || statSync(filePath).isDirectory()) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not Found');
    return;
  }

  const ext = extname(filePath);
  res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
  res.end(readFileSync(filePath));
}).listen(PORT, () => {
  console.log('');
  console.log('本地站点预览（与 Git Pages 结构一致）');
  console.log(`  流程总览首页  http://localhost:${PORT}/`);
  console.log(`  Mock 演示      http://localhost:${PORT}/demo/index.html#/poms/phase1/index`);
  console.log('');
  console.log('按 Ctrl+C 停止');
});
