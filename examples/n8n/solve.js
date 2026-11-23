'use strict';

/**
 * Solve a CAPTCHA through the DeathByCaptcha HTTP API.
 *
 * Used by the n8n workflow example (see build-workflow.js) and by the unit
 * tests. It only depends on `fetch`, so it runs in Node, in the n8n Code
 * node sandbox and in a browser bundle.
 */

const DEFAULT_BASE_URL = 'https://api.dbcapi.me/api';

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

function buildUploadBody({
  type,
  params,
  imageBase64,
  username,
  password,
  authtoken,
}) {
  const body = new URLSearchParams();

  if (authtoken) {
    body.append('authtoken', authtoken);
  } else {
    if (!username || !password) {
      throw new Error('Set DBC_AUTHTOKEN or DBC_USERNAME/DBC_PASSWORD');
    }
    body.append('username', username);
    body.append('password', password);
  }

  body.append('type', String(type));

  if (params && Object.keys(params).length > 0) {
    body.append(paramsKeyForType(type), JSON.stringify(params));
  }

  if (imageBase64) {
    body.append('captcha', imageBase64);
  }

  return body;
}

async function solveCaptcha({
  type,
  params = {},
  imageBase64,
  username,
  password,
  authtoken,
  baseUrl = DEFAULT_BASE_URL,
  timeoutMs = 120000,
  pollIntervalMs = 2000,
  fetchImpl = fetch,
} = {}) {
  if (type === undefined || type === null) {
    throw new Error('type is required');
  }

  const body = buildUploadBody({
    type,
    params,
    imageBase64,
    username,
    password,
    authtoken,
  });

  const uploadResponse = await fetchImpl(`${baseUrl}/captcha`, {
    method: 'POST',
    headers: { Accept: 'application/json' },
    body,
  });

  if (!uploadResponse.ok) {
    throw new Error(`DeathByCaptcha upload failed with ${uploadResponse.status}`);
  }

  const uploaded = await uploadResponse.json();
  const captchaId = uploaded.captcha;

  if (!captchaId) {
    throw new Error('DeathByCaptcha returned no captcha id');
  }

  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const pollResponse = await fetchImpl(`${baseUrl}/captcha/${captchaId}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (pollResponse.ok) {
      const result = await pollResponse.json();
      if (result.text) {
        return {
          captchaId,
          text: result.text,
          isCorrect: result.is_correct,
        };
      }
    }

    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
  }

  throw new Error(`DeathByCaptcha timed out after ${timeoutMs}ms`);
}

module.exports = {
  DEFAULT_BASE_URL,
  PARAMS_KEY_BY_TYPE,
  paramsKeyForType,
  buildUploadBody,
  solveCaptcha,
};
