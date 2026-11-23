const {
  paramsKeyForType,
  buildUploadBody,
  solveCaptcha,
} = require('../../examples/n8n/solve');

describe('n8n example: solve.js', () => {
  test('maps types to the DeathByCaptcha parameter key', () => {
    expect(paramsKeyForType(4)).toBe('token_params');
    expect(paramsKeyForType(12)).toBe('turnstile_params');
    expect(paramsKeyForType(16)).toBe('waf_params');
    expect(paramsKeyForType(0)).toBe('token_params');
  });

  test('builds the upload body with username and password', () => {
    const body = buildUploadBody({
      type: 4,
      params: { googlekey: 'site', pageurl: 'https://example.test/' },
      username: 'user',
      password: 'pass',
    });

    expect(body.get('username')).toBe('user');
    expect(body.get('password')).toBe('pass');
    expect(body.get('type')).toBe('4');
    expect(JSON.parse(body.get('token_params'))).toEqual({
      googlekey: 'site',
      pageurl: 'https://example.test/',
    });
  });

  test('uses the authtoken instead of username and password', () => {
    const body = buildUploadBody({ type: 12, authtoken: 'token' });

    expect(body.get('authtoken')).toBe('token');
    expect(body.get('username')).toBeNull();
    expect(body.get('password')).toBeNull();
    expect(paramsKeyForType(12)).toBe('turnstile_params');
  });

  test('fails without credentials', () => {
    expect(() => buildUploadBody({ type: 0 })).toThrow(
      /DBC_AUTHTOKEN or DBC_USERNAME/
    );
  });

  test('uploads and polls until the captcha is solved', async () => {
    const fetchImpl = jest.fn(async (url, options) => {
      if (options && options.method === 'POST') {
        return {
          ok: true,
          json: async () => ({ captcha: 42, text: '', is_correct: true }),
        };
      }
      return {
        ok: true,
        json: async () => ({ captcha: 42, text: 'solved-token', is_correct: true }),
      };
    });

    const result = await solveCaptcha({
      type: 4,
      params: { googlekey: 'site', pageurl: 'https://example.test/' },
      username: 'user',
      password: 'pass',
      pollIntervalMs: 1,
      fetchImpl,
    });

    expect(result).toEqual({
      captchaId: 42,
      text: 'solved-token',
      isCorrect: true,
    });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(fetchImpl.mock.calls[0][0]).toBe('https://api.dbcapi.me/api/captcha');
    expect(fetchImpl.mock.calls[1][0]).toBe('https://api.dbcapi.me/api/captcha/42');
  });

  test('times out when the captcha never gets solved', async () => {
    const fetchImpl = jest.fn(async (url, options) => {
      if (options && options.method === 'POST') {
        return { ok: true, json: async () => ({ captcha: 7 }) };
      }
      return { ok: true, json: async () => ({ captcha: 7, text: '' }) };
    });

    await expect(
      solveCaptcha({
        type: 4,
        username: 'user',
        password: 'pass',
        timeoutMs: 20,
        pollIntervalMs: 5,
        fetchImpl,
      })
    ).rejects.toThrow(/timed out/);
  });
});
