import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve('out'),
  port = Number(process.env.PORT || 3017),
  base = process.env.NEXT_PUBLIC_BASE_PATH ?? '/tihiy-sad-demo';
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain',
};
http
  .createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (pathname === base) {
      res.writeHead(301, { Location: base + '/' });
      res.end();
      return;
    }
    let file = pathname.startsWith(base + '/')
      ? path.resolve(root, '.' + pathname.slice(base.length))
      : '';
    if (!file.startsWith(root + path.sep) && file !== root) file = '';
    if (file && fs.existsSync(file) && fs.statSync(file).isDirectory())
      file = path.join(file, 'index.html');
    const found = file && fs.existsSync(file) && fs.statSync(file).isFile();
    if (!found) file = path.join(root, '404.html');
    res.writeHead(found ? 200 : 404, {
      'Content-Type': types[path.extname(file)] || 'application/octet-stream',
      'X-Robots-Tag': 'noindex, nofollow',
      'Cache-Control': 'no-store',
    });
    fs.createReadStream(file).pipe(res);
  })
  .listen(port, '0.0.0.0', () => console.log(`Static export: http://localhost:${port}${base}/`));
