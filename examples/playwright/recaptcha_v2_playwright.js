const { chromium } = require('playwright');

let HttpClient;
try {
  ({ HttpClient } = require('deathbycaptcha-lib'));
} catch (_) {
  ({ HttpClient } = require('../../deathbycaptcha'));
}

const USERNAME = 'DBC_USERNAME';
const PASSWORD = 'DBC_PASSWORD';

const DEFAULT_CAPTCHA_URL = 'https://www.google.com/recaptcha/api2/demo';
const DEFAULT_TIMEOUT_MS = 15000;

function getBalanceAsync(client) {
  return new Promise((resolve, reject) => {
    try {
      client.get_balance((balance) => resolve(balance));
    } catch (error) {
      reject(error);
    }
  });
}

function decodeAsync(client, captcha) {
  return new Promise((resolve, reject) => {
    try {
      client.decode(captcha, (solution) => resolve(solution));
    } catch (error) {
      reject(error);
    }
  });
}

async function solveCaptcha(client, captcha, logger) {
  const balance = await getBalanceAsync(client);
  logger.log(`Balance: ${balance}`);
  return decodeAsync(client, captcha);
}

async function runPlaywrightSample({
  username = process.env.DBC_USERNAME,
  password = process.env.DBC_PASSWORD,
  headless = process.env.DBC_PLAYWRIGHT_HEADLESS !== 'false',
  captchaUrl = process.env.DBC_TEST_CAPTCHA_URL || DEFAULT_CAPTCHA_URL,
  timeoutMs = Number(process.env.DBC_PLAYWRIGHT_TIMEOUT_MS || DEFAULT_TIMEOUT_MS),
  logger = console,
} = {}) {
  let browser;

  if (!username || !password || username === 'DBC_USERNAME' || password === 'DBC_PASSWORD') {
    throw new Error('Set valid DBC_USERNAME and DBC_PASSWORD first.');
  }

  const client = new HttpClient(username, password);

  try {
    browser = await chromium.launch({ headless });
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto(captchaUrl, { timeout: 60000 });

    await page.waitForSelector('#recaptcha-demo', { timeout: timeoutMs });
    const googleKey = await page.getAttribute('#recaptcha-demo', 'data-sitekey');
    logger.log(`sitekey: ${googleKey}`);

    const captcha = {
      extra: {
        type: 4,
        token_params: JSON.stringify({
          googlekey: googleKey,
          pageurl: captchaUrl,
        }),
      },
    };

    const solution = await solveCaptcha(client, captcha, logger);

    if (!solution || !solution.text) {
      throw new Error('No captcha solution received (consider retry).');
    }

    logger.log(`Token received (${solution.text.length} characters)`);

    await page.evaluate(
      (token) => {
        const textarea = document.getElementById('g-recaptcha-response');
        if (!textarea) return;

        textarea.style.display = 'block';
        textarea.value = token;
        textarea.innerHTML = token;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        textarea.dispatchEvent(new Event('change', { bubbles: true }));

        if (window.___grecaptcha_cfg && window.___grecaptcha_cfg.clients) {
          const clients = window.___grecaptcha_cfg.clients;
          for (const clientKey of Object.keys(clients)) {
            const client = clients[clientKey];
            for (const key of Object.keys(client)) {
              const item = client[key];
              if (item && typeof item.callback === 'function') {
                item.callback(token);
                return;
              }
              if (item && item.W && typeof item.W.callback === 'function') {
                item.W.callback(token);
                return;
              }
            }
          }
        }
      },
      solution.text
    );

    await page.click('#recaptcha-demo-submit');

    await page.waitForSelector('.recaptcha-success', { timeout: timeoutMs });
    logger.log('Success');

    return {
      success: true,
      sitekey: googleKey,
      captchaId: solution.captcha,
      token: solution.text,
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

if (require.main === module) {
  const username = USERNAME !== 'DBC_USERNAME' ? USERNAME : process.env.DBC_USERNAME;
  const password = PASSWORD !== 'DBC_PASSWORD' ? PASSWORD : process.env.DBC_PASSWORD;

  runPlaywrightSample({ username, password })
    .then(() => process.exit(0))
    .catch((error) => {
      console.log(error && error.message ? error.message : error);
      process.exit(1);
    });
}

module.exports = {
  runPlaywrightSample,
};
