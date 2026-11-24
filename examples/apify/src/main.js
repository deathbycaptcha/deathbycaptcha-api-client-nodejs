'use strict';

/**
 * Apify actor: solve a CAPTCHA task with DeathByCaptcha and store the result
 * in the run dataset.
 *
 * Credentials come from the environment, so on the platform they are actor
 * secrets named DBC_USERNAME / DBC_PASSWORD or DBC_AUTHTOKEN. They are never
 * read from the input.
 */

const { Actor, log } = require('apify');
const { HttpClient } = require('deathbycaptcha-lib');
const { solveCaptcha } = require('./solve');

function createClient() {
  const authtoken = process.env.DBC_AUTHTOKEN;
  const username = process.env.DBC_USERNAME;
  const password = process.env.DBC_PASSWORD;

  if (authtoken) {
    return new HttpClient('authtoken', authtoken);
  }
  if (username && password) {
    return new HttpClient(username, password);
  }
  throw new Error(
    'Set the DBC_AUTHTOKEN or DBC_USERNAME/DBC_PASSWORD actor secrets'
  );
}

(async () => {
  try {
    await Actor.init();

    const input = (await Actor.getInput()) || {};
    const client = createClient();

    const solution = await solveCaptcha({
      client,
      type: input.type,
      params: input.params,
      image: input.image,
      timeout: input.timeout,
    });

    await Actor.pushData({
      type: input.type,
      captcha: solution.captcha,
      text: solution.text,
    });

    log.info('Solved', { captcha: solution.captcha, type: input.type });
    await Actor.exit({ exitCode: 0 });
  } catch (error) {
    log.exception('Actor failed', error);
    await Actor.exit({ exitCode: 1 });
  }
})();
