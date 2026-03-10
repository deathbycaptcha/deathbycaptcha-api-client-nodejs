jest.mock('form-data', () => {
  const EventEmitter = require('events');

  return class MockFormData {
    constructor() {
      this.fields = [];
    }

    append(key, value) {
      this.fields.push([key, value]);
    }

    getHeaders() {
      return { 'content-type': 'multipart/form-data' };
    }

    submit(options, cb) {
      MockFormData.lastOptions = options;

      if (MockFormData.submitImpl) {
        return MockFormData.submitImpl(options, cb);
      }

      const response = new EventEmitter();
      response.statusCode = 200;
      response.setEncoding = () => {};
      cb(null, response);
      response.emit('data', JSON.stringify({ user: 1, balance: 10 }));
      response.emit('end');
      return { abort: () => {} };
    }

    static setSubmitImpl(fn) {
      MockFormData.submitImpl = fn;
    }
  };
});

const EventEmitter = require('events');
const FormData = require('form-data');
const { HttpClient } = require('../../deathbycaptcha');

describe('HttpClient', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    FormData.setSubmitImpl(null);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('get_user calls _call with expected payload', () => {
    const client = new HttpClient('u', 'p');
    client._call = jest.fn();
    client.get_user(() => {});

    expect(client._call).toHaveBeenCalledWith(
      { cmd: 'user', payload: { username: 'u', password: 'p' } },
      expect.any(Function)
    );
  });

  test('get_captcha/report call _call with expected commands', () => {
    const client = new HttpClient('u', 'p');
    client._call = jest.fn();

    client.get_captcha(7, () => {});
    client.report(7, () => {});

    expect(client._call).toHaveBeenNthCalledWith(
      1,
      { cmd: 'captcha/7' },
      expect.any(Function)
    );
    expect(client._call).toHaveBeenNthCalledWith(
      2,
      { cmd: 'captcha/7/report', payload: { username: 'u', password: 'p' } },
      expect.any(Function)
    );
  });

  test('upload assembles payload/files for base64 captcha and banner', () => {
    const client = new HttpClient('u', 'p');
    client._call = jest.fn((params, cb) => cb({ captcha: 1 }));

    client.upload(
      {
        captcha: 'base64:abc123',
        extra: {
          type: 0,
          banner: 'base64:ban456',
        },
      },
      () => {}
    );

    const [params] = client._call.mock.calls[0];
    expect(params.cmd).toBe('captcha');
    expect(params.payload.username).toBe('u');
    expect(params.payload.password).toBe('p');
    expect(params.payload.type).toBe(0);
    expect(params.files.captchafile).toBe('base64:abc123');
    expect(params.files.banner).toBe('base64:ban456');
  });

  test('_call parses user response mapping on status 200', async () => {
    FormData.setSubmitImpl((options, cb) => {
      const response = new EventEmitter();
      response.statusCode = 200;
      response.setEncoding = () => {};
      cb(null, response);
      response.emit('data', JSON.stringify({ user: 123, balance: 5 }));
      response.emit('end');
      return { abort: () => {} };
    });

    const client = new HttpClient('u', 'p');
    const result = await new Promise((resolve) => {
      client._call({ cmd: 'user', payload: { username: 'u' } }, resolve);
    });

    expect(result).toEqual({ user: 123, balance: 5 });
    expect(FormData.lastOptions.path).toBe('/api/user');
  });

  test('_call maps captcha and report responses', async () => {
    const client = new HttpClient('u', 'p');

    FormData.setSubmitImpl((options, cb) => {
      const response = new EventEmitter();
      response.statusCode = 200;
      response.setEncoding = () => {};
      cb(null, response);
      response.emit('data', JSON.stringify({ captcha: 10, text: 'abc' }));
      response.emit('end');
      return { abort: () => {} };
    });

    const captchaResult = await new Promise((resolve) => {
      client._call({ cmd: 'captcha', payload: { a: 1 } }, resolve);
    });
    expect(captchaResult).toEqual({ captcha: 10, text: 'abc' });

    FormData.setSubmitImpl((options, cb) => {
      const response = new EventEmitter();
      response.statusCode = 200;
      response.setEncoding = () => {};
      cb(null, response);
      response.emit('data', JSON.stringify({ is_correct: false }));
      response.emit('end');
      return { abort: () => {} };
    });

    const reportResult = await new Promise((resolve) => {
      client._call({ cmd: 'captcha/10/report', payload: { a: 1 } }, resolve);
    });
    expect(reportResult).toBe(true);
  });

  test('_call supports GET when payload is null', async () => {
    FormData.setSubmitImpl((options, cb) => {
      const response = new EventEmitter();
      response.statusCode = 200;
      response.setEncoding = () => {};
      cb(null, response);
      response.emit('data', JSON.stringify({ captcha: 0 }));
      response.emit('end');
      return { abort: () => {} };
    });

    const client = new HttpClient('u', 'p');
    await new Promise((resolve) => {
      client._call({ cmd: 'captcha/1', payload: null, headers: {} }, resolve);
    });

    expect(FormData.lastOptions.method).toBe('GET');
  });

  test('_call throws for HTTP error statuses', () => {
    const client = new HttpClient('u', 'p');

    FormData.setSubmitImpl((options, cb) => {
      const response = new EventEmitter();
      response.statusCode = 403;
      response.setEncoding = () => {};
      cb(null, response);
      return { abort: () => {} };
    });

    expect(() => client._call({ cmd: 'user', payload: { u: 1 } }, () => {})).toThrow('Access denied');

    FormData.setSubmitImpl((options, cb) => {
      const response = new EventEmitter();
      response.statusCode = 503;
      response.setEncoding = () => {};
      cb(null, response);
      return { abort: () => {} };
    });

    expect(() => client._call({ cmd: 'user', payload: { u: 1 } }, () => {})).toThrow('service overload');
  });
});
