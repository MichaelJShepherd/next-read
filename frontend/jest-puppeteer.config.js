/** @type {import('jest-puppeteer').JestPuppeteerConfig} */
export default {
  launch: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  },
  server: {
    command: 'npx ng serve --configuration development --port 4201',
    port: 4201,
    launchTimeout: 60000,
    waitOnScheme: { delay: 1000 },
  },
};
