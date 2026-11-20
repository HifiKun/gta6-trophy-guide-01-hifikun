// Leonida Platinum — a tiny static server for the guide, for local use.
// Serves app/ at http://localhost:8080 so the guide can be tried in a
// desktop browser and screenshotted. Standard library only; nothing is
// installed and nothing leaves this machine.
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';

const PORT = 8080;
const ROOT = join(import.meta.dirname, 'app');

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

const server = createServer((req, res) => {
  const path = normalize(join(ROOT, decodeURIComponent(req.url?.split('?')[0] || '/')));
  if (!path.startsWith(ROOT)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  const file = existsSync(path) && statSync(path).isDirectory() ? join(path, 'index.html') : path;
  if (!existsSync(file) || statSync(file).isDirectory()) {
    res.writeHead(404);
    res.end('Not found');
    return;
  }
  res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream' });
  createReadStream(file).pipe(res);
});

server.listen(PORT, () => {
  console.log(`Leonida Platinum at http://localhost:${PORT}/`);
});
