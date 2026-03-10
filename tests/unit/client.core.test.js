const { HttpClient } = require('../../deathbycaptcha');

describe('Client core behaviors', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test('constructor handles username/password auth', () => {
    const client = new HttpClient('user1', 'pass1');
    expect(client.userpwd).toEqual({ username: 'user1', password: 'pass1' });
  });

  test('constructor handles authtoken auth', () => {
    const client = new HttpClient('authtoken', 'tok-123');
    expect(client.userpwd).toEqual({ username: 'authtoken', authtoken: 'tok-123' });
  });

  test('get_balance maps from get_user', (done) => {
    const client = new HttpClient('u', 'p');
    client.get_user = jest.fn((cb) => cb({ balance: 321 }));

    client.get_balance((balance) => {
      expect(balance).toBe(321);
      done();
    });
  });

  test('get_text maps from get_captcha', (done) => {
    const client = new HttpClient('u', 'p');
    client.get_captcha = jest.fn((id, cb) => cb({ text: 'hello' }));

    client.get_text(99, (text) => {
      expect(text).toBe('hello');
      done();
    });
  });

  test('decode returns null when upload returns null', async () => {
    const client = new HttpClient('u', 'p');
    client.upload = jest.fn((args, cb) => cb(null));

    const result = await new Promise((resolve) => {
      client.decode({ captcha: 'base64:test', extra: {} }, resolve);
      jest.runAllTimers();
    });

    expect(result).toBeNull();
  });

  test('decode polls and returns solved captcha', async () => {
    const client = new HttpClient('u', 'p');
    client.upload = jest.fn((args, cb) => cb({ captcha: 100, text: null, is_correct: true }));
    client.get_captcha = jest.fn((id, cb) => cb({ captcha: 100, text: 'solved', is_correct: true }));

    const resultPromise = new Promise((resolve) => {
      client.decode({ captcha: 'base64:test', extra: {} }, resolve);
    });

    jest.runOnlyPendingTimers();
    const result = await resultPromise;

    expect(client.get_captcha).toHaveBeenCalledWith(100, expect.any(Function));
    expect(result).toEqual({ captcha: 100, text: 'solved', is_correct: true });
  });

  test('decode returns null when solved text is incorrect', async () => {
    const client = new HttpClient('u', 'p');
    client.upload = jest.fn((args, cb) => cb({ captcha: 111, text: 'bad', is_correct: false }));

    const result = await new Promise((resolve) => {
      client.decode({ captcha: 'base64:test', extra: {} }, resolve);
      jest.runAllTimers();
    });

    expect(result).toBeNull();
  });
});
