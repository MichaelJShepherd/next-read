/** @type {import('jest').Config} */
export default {
  preset: 'jest-puppeteer',
  testMatch: ['<rootDir>/src/**/*.e2e.ts'],
  transform: {},
  testEnvironment: 'jest-environment-puppeteer',
  globalSetup: 'jest-puppeteer/setup',
  globalTeardown: 'jest-puppeteer/teardown',
};
