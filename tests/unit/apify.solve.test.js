const {
  paramsKeyForType,
  solveCaptcha,
} = require('../../examples/apify/src/solve');

function fakeClient(result) {
  const client = {
    decode(arg, cb) {
      client.lastArg = arg;
      cb(result);
    },
  };
  return client;
}

describe('Apify example: solve.js', () => {
  test('maps types to the DeathByCaptcha parameter key', () => {
    expect(paramsKeyForType(16)).toBe('waf_params');
    expect(paramsKeyForType(12)).toBe('turnstile_params');
    expect(paramsKeyForType(0)).toBe('token_params');
  });

  test('solves a token task and returns the id and the text', async () => {
    const client = fakeClient({ captcha: 42, text: 'solved-token' });

    const result = await solveCaptcha({
      client,
      type: 4,
      params: { googlekey: 'site', pageurl: 'https://example.test/' },
    });

    expect(result).toEqual({ captcha: 42, text: 'solved-token' });
    expect(JSON.parse(client.lastArg.extra.token_params)).toEqual({
      googlekey: 'site',
      pageurl: 'https://example.test/',
    });
    expect(client.lastArg.extra.type).toBe(4);
    expect(client.lastArg.captcha).toBeUndefined();
  });

  test('sends a base64 image as bytes for the image type', async () => {
    const client = fakeClient({ captcha: 7, text: 'image-answer' });

    await solveCaptcha({ client, type: 0, image: Buffer.from('fake').toString('base64') });

    expect(Buffer.isBuffer(client.lastArg.captcha)).toBe(true);
    expect(client.lastArg.extra.type).toBe(0);
  });

  test('fails without a type', async () => {
    await expect(solveCaptcha({ client: fakeClient({}) })).rejects.toThrow(/type is required/);
  });

  test('fails when the service returns no solution', async () => {
    await expect(
      solveCaptcha({ client: fakeClient({ captcha: 1, text: '' }), type: 4 })
    ).rejects.toThrow(/no solution/);
  });
});
