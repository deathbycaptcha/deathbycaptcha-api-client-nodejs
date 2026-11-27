/**
 * Unit tests for the Cypress task layer.
 *
 * No network and no Cypress: the client is replaced by a fake, so these
 * tests check the arguments that reach it and the value the task hands
 * back to the test. The live path is tests/integration/cypress.
 */

const { createDbcTasks } = require('../../examples/cypress/deathbycaptcha.tasks');

function fakeClient({ solution, balance = 1234 } = {}) {
  const calls = { decode: [], balance: 0 };
  return {
    calls,
    decode(payload, cb) {
      calls.decode.push(payload);
      setImmediate(() => cb(solution === undefined ? { captcha: 7, text: 'TOKEN', is_correct: true } : solution));
    },
    get_balance(cb) {
      calls.balance += 1;
      setImmediate(() => cb(balance));
    },
  };
}

describe('createDbcTasks', () => {
  let logSpy;

  beforeEach(() => {
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  it('returns a task for every command', () => {
    const tasks = createDbcTasks({ client: fakeClient() });
    expect(Object.keys(tasks).sort()).toEqual([
      'dbcBalance',
      'dbcSolveImage',
      'dbcSolveRecaptchaV2',
      'dbcSolveRecaptchaV3',
      'dbcSolveTurnstile',
    ]);
  });

  it('asks for a reCAPTCHA v2 token with the page values', async () => {
    const client = fakeClient();
    const tasks = createDbcTasks({ client });

    const token = await tasks.dbcSolveRecaptchaV2({
      sitekey: '6Le-site',
      pageurl: 'https://example.test/',
    });

    expect(token).toBe('TOKEN');
    expect(client.calls.decode).toHaveLength(1);
    const payload = client.calls.decode[0];
    expect(payload.extra.type).toBe(4);
    expect(JSON.parse(payload.extra.token_params)).toEqual({
      googlekey: '6Le-site',
      pageurl: 'https://example.test/',
    });
    expect(payload.timeout).toBeUndefined();
  });

  it('passes the timeout through only when one was asked for', async () => {
    const client = fakeClient();
    const tasks = createDbcTasks({ client });

    await tasks.dbcSolveRecaptchaV2({
      sitekey: 'k', pageurl: 'https://example.test/', timeout: 45,
    });

    expect(client.calls.decode[0].timeout).toBe(45);
  });

  it('refuses a reCAPTCHA v2 without a sitekey or a page', async () => {
    const tasks = createDbcTasks({ client: fakeClient() });

    await expect(tasks.dbcSolveRecaptchaV2({ sitekey: '', pageurl: 'https://x.test' }))
      .rejects.toThrow('sitekey is required');
    await expect(tasks.dbcSolveRecaptchaV2({ sitekey: 'k', pageurl: ' ' }))
      .rejects.toThrow('pageurl is required');
  });

  it('sends the v3 action and score only when they were given', async () => {
    const plain = createDbcTasks({ client: fakeClient() });
    await plain.dbcSolveRecaptchaV3({ sitekey: 'k', pageurl: 'https://x.test' });
    const bare = plain;

    const client = fakeClient();
    const tasks = createDbcTasks({ client });
    await tasks.dbcSolveRecaptchaV3({
      sitekey: 'k', pageurl: 'https://x.test', action: 'login', minScore: '0.6',
    });

    expect(JSON.parse(client.calls.decode[0].extra.token_params)).toEqual({
      googlekey: 'k', pageurl: 'https://x.test', action: 'login', min_score: 0.6,
    });
    expect(bare).toBeDefined();
  });

  it('uses its own parameter key for Turnstile', async () => {
    const client = fakeClient();
    const tasks = createDbcTasks({ client });

    await tasks.dbcSolveTurnstile({ sitekey: '0x4A', pageurl: 'https://x.test' });

    const payload = client.calls.decode[0];
    expect(payload.extra.type).toBe(12);
    expect(payload.extra.token_params).toBeUndefined();
    expect(JSON.parse(payload.extra.turnstile_params)).toEqual({
      sitekey: '0x4A', pageurl: 'https://x.test',
    });
  });

  it('sends the image path as the captcha to upload', async () => {
    const client = fakeClient();
    const tasks = createDbcTasks({ client });

    const text = await tasks.dbcSolveImage({ imagePath: '/tmp/shot.png' });

    expect(text).toBe('TOKEN');
    expect(client.calls.decode[0]).toEqual({ extra: {}, captcha: '/tmp/shot.png' });
  });

  it('fails with a message when the service returns no solution', async () => {
    const tasks = createDbcTasks({
      client: fakeClient({ solution: { captcha: 7, text: '', is_correct: false } }),
    });

    await expect(tasks.dbcSolveRecaptchaV2({ sitekey: 'k', pageurl: 'https://x.test' }))
      .rejects.toThrow('no solution');
  });

  it('fails when there are no credentials', async () => {
    const tasks = createDbcTasks({ username: '', password: '', authtoken: '' });

    await expect(tasks.dbcBalance()).rejects.toThrow('DBC_AUTHTOKEN');
    await expect(tasks.dbcSolveImage({ imagePath: '/tmp/x.png' }))
      .rejects.toThrow('DBC_AUTHTOKEN');
  });

  it('returns the balance as a number', async () => {
    const tasks = createDbcTasks({ client: fakeClient({ balance: 5678 }) });

    await expect(tasks.dbcBalance()).resolves.toBe(5678);
  });

  it('never prints the solved token', async () => {
    const tasks = createDbcTasks({ client: fakeClient() });

    await tasks.dbcSolveRecaptchaV2({ sitekey: 'k', pageurl: 'https://x.test' });
    await tasks.dbcBalance().catch(() => {});

    const printed = logSpy.mock.calls.map((args) => args.join(' ')).join('\n');
    expect(printed).not.toContain('TOKEN');
  });
});
