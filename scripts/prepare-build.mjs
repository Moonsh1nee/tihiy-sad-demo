import { writeFile } from 'node:fs/promises';
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
