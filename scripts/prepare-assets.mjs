import sharp from 'sharp';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
const sources = JSON.parse(
  await readFile(process.argv[2] || 'scripts/image-sources.local.json', 'utf8'),
);
await mkdir('public/images', { recursive: true });
for (const [id, file] of Object.entries(sources))
  for (const width of [400, 640, 1120])
    await sharp(file)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 83 })
      .toFile(`public/images/${id}-${width}.webp`);
await sharp(sources['01'])
  .resize(1200, 630, { fit: 'cover', position: 'attention' })
  .jpeg({ quality: 85 })
  .toFile('public/images/og.jpg');
const base = process.env.NEXT_PUBLIC_BASE_PATH ?? '/tihiy-sad-demo';
await writeFile(
  'public/manifest.webmanifest',
  JSON.stringify({
    name: 'Тихий сад — демо-магазин',
    short_name: 'Тихий сад',
    lang: 'ru',
    start_url: base + '/',
    scope: base + '/',
    display: 'browser',
    theme_color: '#472638',
    background_color: '#f8f5ef',
    icons: [{ src: base + '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  }),
);
