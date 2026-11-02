import { defineConfig } from '@playwright/test';
const port = process.env.PORT || '3017';
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: { baseURL: `http://127.0.0.1:${port}`, trace: 'retain-on-failure' },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 1000 } } },
    {
      name: 'mobile',
      use: { viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true },
    },
  ],
  webServer: {
    command: 'npm run preview',
    url: `http://127.0.0.1:${port}${process.env.NEXT_PUBLIC_BASE_PATH ?? '/tihiy-sad-demo'}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
});
