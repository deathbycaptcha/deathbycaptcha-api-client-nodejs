const { Builder, until, By } = require('selenium-webdriver');
const { HttpClient } = require('../../deathbycaptcha');

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

async function runSeleniumSample({
  username = process.env.DBC_USERNAME,
  password = process.env.DBC_PASSWORD,
  browser = process.env.SELENIUM_BROWSER || 'firefox',
  captchaUrl = process.env.DBC_TEST_CAPTCHA_URL || DEFAULT_CAPTCHA_URL,
  timeoutMs = Number(process.env.DBC_SELENIUM_TIMEOUT_MS || DEFAULT_TIMEOUT_MS),
  logger = console,
} = {}) {
  let driver;

  if (!username || !password || username === 'DBC_USERNAME' || password === 'DBC_PASSWORD') {
    throw new Error('Set valid DBC_USERNAME and DBC_PASSWORD first.');
  }

  const client = new HttpClient(username, password);

  try {
    driver = await new Builder().forBrowser(browser).build();

    await driver.get(captchaUrl);
    const element = await driver.wait(until.elementLocated(By.id('recaptcha-demo')), timeoutMs);

    const googleKey = await element.getDomAttribute('data-sitekey');
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

    logger.log(`Solution: ${solution.text}`);

    await driver.executeScript(
      `
      const token = arguments[0];
      const textarea = document.getElementById('g-recaptcha-response');
      if (!textarea) return false;

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
      `,
      solution.text
    );

    const button = await driver.findElement(By.id('recaptcha-demo-submit'));
    await button.click();

    await driver.wait(until.elementLocated(By.className('recaptcha-success')), timeoutMs);
    logger.log('Success');

    return {
      success: true,
      sitekey: googleKey,
      captchaId: solution.captcha,
      token: solution.text,
    };
  } finally {
    if (driver) {
      await driver.quit();
    }
  }
}

if (require.main === module) {
  runSeleniumSample()
    .then(() => process.exit(0))
    .catch((error) => {
      console.log(error && error.message ? error.message : error);
      process.exit(1);
    });
}

module.exports = {
  runSeleniumSample,
};
