const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { runSeleniumSample } = require('../../examples/selenium/recaptcha_v2_selenium');

const ROOT_DIR = path.resolve(__dirname, '../..');
const ENV_PATH = path.join(ROOT_DIR, '.env');

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  raw.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      return;
    }

    const splitAt = trimmed.indexOf('=');
    if (splitAt <= 0) {
      return;
    }

    const key = trimmed.slice(0, splitAt).trim();
    const value = trimmed.slice(splitAt + 1).trim();

    if (!process.env[key]) {
      process.env[key] = value;
    }
  });
}

async function run() {
  loadEnvFile(ENV_PATH);

  const username = process.env.DBC_USERNAME;
  const password = process.env.DBC_PASSWORD;
  const browser = process.env.SELENIUM_BROWSER || 'firefox';
  const captchaUrl = process.env.DBC_TEST_CAPTCHA_URL || 'https://www.google.com/recaptcha/api2/demo';
  const timeoutMs = Number(process.env.DBC_SELENIUM_TIMEOUT_MS || '20000');

  if (!username || !password || username === 'your_dbc_username' || password === 'your_dbc_password') {
    console.error('Missing valid credentials. Copy .env.sample to .env and fill DBC_USERNAME/DBC_PASSWORD.');
    process.exit(1);
  }

  const result = await runSeleniumSample({
    username,
    password,
    browser,
    captchaUrl,
    timeoutMs,
    logger: console,
  });

  assert.ok(result && result.success, 'Selenium sample execution did not report success');
  assert.ok(result.token, 'Selenium sample did not return token');
  console.log('Integration test passed: Selenium sample completed successfully.');
}

run().catch((error) => {
  console.error('Integration test failed:', error && error.message ? error.message : error);
  process.exit(1);
});
