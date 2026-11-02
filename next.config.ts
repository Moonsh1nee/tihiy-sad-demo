import type { NextConfig } from 'next';
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '/tihiy-sad-demo';
if (basePath && !/^\/[a-zA-Z0-9_-]+$/.test(basePath))
  throw new Error('Invalid NEXT_PUBLIC_BASE_PATH');
const config: NextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};
export default config;
