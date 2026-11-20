#!/usr/bin/env node
/*
 * Solves Google's reCAPTCHA v2 demo with Puppeteer and DeathByCaptcha.
 *
 * Set DBC_USERNAME and DBC_PASSWORD (or DBC_AUTHTOKEN) in the environment
 * or in a .env file. The solved token is injected into the page and the
 * widget callback is called when it exists; the token is never printed.
 */

const puppeteer = require('puppeteer');

let HttpClient;
try {
  ({ HttpClient } = require('deathbycaptcha-lib'));
} catch (_) {
  ({ HttpClient } = require('../../deathbycaptcha'));
}

const DEFAULT_CAPTCHA_URL = 'https://www.google.com/recaptcha/api2/demo';
const DEFAULT_TIMEOUT_MS = 20000;

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

async function runPuppeteerSample({
  username = process.env.DBC_USERNAME,
  password = process.env.DBC_PASSWORD,
  headless = process.env.DBC_PUPPETEER_HEADLESS !== 'false',
  captchaUrl = process.env.DBC_TEST_CAPTCHA_URL || DEFAULT_CAPTCHA_URL,
  timeoutMs = Number(process.env.DBC_PUPPETEER_TIMEOUT_MS || DEFAULT_TIMEOUT_MS),
  executablePath = process.env.CHROME_BIN,
  logger = console,
} = {}) {
  if (!username || !password) {
    throw new Error('Set DBC_USERNAME and DBC_PASSWORD first.');
  }

  const client = new HttpClient(username, password);
  let browser;

  try {
    browser = await puppeteer.launch({
      headless,
      executablePath: executablePath || undefined,
      args: ['--no-sandbox', '--disable-dev-shm-usage'],
    });

    const page = await browser.newPage();
    await page.goto(captchaUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForSelector('#recaptcha-demo', { timeout: timeoutMs });

    const googleKey = await page.$eval(
      '#recaptcha-demo',
      (element) => element.getAttribute('data-sitekey')
    );
    logger.log(`sitekey: ${googleKey}`);

    const balance = await getBalanceAsync(client);
    logger.log(`Balance: ${balance}`);

    const solution = await decodeAsync(client, {
      extra: {
        type: 4,
        token_params: JSON.stringify({ googlekey: googleKey, pageurl: captchaUrl }),
      },
    });

    if (!solution || !solution.text) {
      throw new Error('No captcha solution received.');
    }
    logger.log(`Token received (${solution.text.length} characters)`);

    await page.evaluate(
      (token) => {
        const textarea =
          document.getElementsByName('g-recaptcha-response')[0] ||
          document.getElementById('g-recaptcha-response');
        if (!textarea) return false;

        textarea.style.display = 'block';
        textarea.value = token;
        textarea.innerHTML = token;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        textarea.dispatchEvent(new Event('change', { bubbles: true }));

        const clients = window.___grecaptcha_cfg && window.___grecaptcha_cfg.clients;
        if (clients) {
          for (const key of Object.keys(clients)) {
            const client = clients[key];
            for (const inner of Object.keys(client)) {
              const item = client[inner];
              if (item && typeof item.callback === 'function') {
                item.callback(token);
                return true;
              }
              if (item && item.W && typeof item.W.callback === 'function') {
                item.W.callback(token);
                return true;
              }
            }
          }
        }
        return true;
      },
      solution.text
    );

    await page.click('#recaptcha-demo-submit');
    await page.waitForSelector('.recaptcha-success', { timeout: timeoutMs });
    const successText = await page.$eval('.recaptcha-success', (element) => element.textContent);
    logger.log(successText.trim());

    return {
      success: successText.includes('Verification Success'),
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
  runPuppeteerSample()
    .then((result) => {
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error(error && error.message ? error.message : error);
      process.exit(1);
    });
}

module.exports = {
  runPuppeteerSample,
};
