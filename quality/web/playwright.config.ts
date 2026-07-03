import { defineConfig } from '@playwright/test';
import { getFreePort } from './src/helpers/get-free-port.js';
import { parsePlaywrightEnv } from './src/schemas/playwright-env.schema.js';

if (!process.env.PW_PORT) {
  process.env.PW_PORT = String(await getFreePort());
}
const port = Number(process.env.PW_PORT);

export default defineConfig(parsePlaywrightEnv(import.meta.dirname, port));
