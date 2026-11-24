'use strict';

/**
 * Solve a CAPTCHA with the official DeathByCaptcha client.
 *
 * Pure logic: the client is injected, so unit tests do not need the network
 * or the npm package. Used by the Apify actor example in src/main.js.
 */

const PARAMS_KEY_BY_TYPE = {
  4: 'token_params',
  5: 'token_params',
  25: 'token_enterprise_params',
  8: 'geetest_params',
  9: 'geetest_params',
  11: 'textcaptcha',
  12: 'turnstile_params',
  16: 'waf_params',
  21: 'datadome_params',
};

function paramsKeyForType(type) {
  return PARAMS_KEY_BY_TYPE[Number(type)] || 'token_params';
}

function decodeAsync(client, arg) {
  return new Promise((resolve, reject) => {
    try {
      client.decode(arg, (solution) => {
        if (solution && solution.text) {
          resolve(solution);
        } else {
          reject(new Error('DeathByCaptcha returned no solution'));
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}

async function solveCaptcha({ client, type, params, image, timeout }) {
  if (type === undefined || type === null) {
    throw new Error('type is required');
  }
  if (!client || typeof client.decode !== 'function') {
    throw new Error('a client with decode() is required');
  }

  const extra = { type: Number(type) };
  if (params && Object.keys(params).length > 0) {
    extra[paramsKeyForType(type)] = JSON.stringify(params);
  }

  const arg = image ? { captcha: Buffer.from(image, 'base64'), extra } : { extra };
  if (timeout) {
    arg.timeout = timeout;
  }

  const solution = await decodeAsync(client, arg);
  return { captcha: solution.captcha, text: solution.text };
}

module.exports = {
  PARAMS_KEY_BY_TYPE,
  paramsKeyForType,
  solveCaptcha,
};
