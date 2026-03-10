jest.mock('net', () => {
  const EventEmitter = require('events');
  let lastSocket = null;

  return {
    createConnection: jest.fn((options, onConnect) => {
      const socket = new EventEmitter();
      socket.write = jest.fn();
      socket.end = jest.fn();
      lastSocket = socket;
      process.nextTick(() => onConnect());
      return socket;
    }),
    __getLastSocket: () => lastSocket,
  };
});

const net = require('net');
const { SocketClient } = require('../../deathbycaptcha');

function flush() {
  return new Promise((resolve) => setImmediate(resolve));
}

describe('SocketClient', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('get_user/get_captcha/report call _call with expected payloads', () => {
    const client = new SocketClient('u', 'p');
    client._call = jest.fn();

    client.get_user(() => {});
    client.get_captcha(9, () => {});
    client.report(9, () => {});

    expect(client._call).toHaveBeenCalledTimes(3);

    const [call1, call2, call3] = client._call.mock.calls;

    expect(call1[0].cmd).toBe('user');
    expect(call1[0].payload).toEqual(expect.objectContaining({ username: 'u', password: 'p' }));

    expect(call2[0]).toEqual({ cmd: 'captcha', payload: { captcha: 9 } });

    expect(call3[0].cmd).toBe('report');
    expect(call3[0].payload).toEqual(expect.objectContaining({ username: 'u', password: 'p', captcha: 9 }));
  });

  test('upload excludes banner from payload and sends files', () => {
    const client = new SocketClient('u', 'p');
    client._call = jest.fn((params, cb) => cb({ captcha: 1 }));

    client.upload(
      {
        captcha: 'base64:abc',
        extra: {
          banner: 'base64:bnr',
          type: 0,
        },
      },
      () => {}
    );

    const [params] = client._call.mock.calls[0];
    expect(params.cmd).toBe('upload');
    expect(params.files.captcha).toBe('abc');
    expect(params.files.banner).toBe('bnr');
    expect(params.payload.type).toBe(0);
    expect(params.payload.banner).toBeUndefined();
  });

  test('_call performs login and returns user result', async () => {
    const client = new SocketClient('u', 'p');

    const resultPromise = new Promise((resolve) => {
      client._call({ cmd: 'user', payload: {} }, resolve);
    });

    await flush();
    const socket = net.__getLastSocket();

    expect(socket.write).toHaveBeenCalledWith(
      JSON.stringify({ cmd: 'login', username: 'u', password: 'p' }) + '\r\n',
      'utf8'
    );

    socket.emit('data', '{"ok":true}\r\n');
    socket.emit('data', '{"user":55,"balance":100}\r\n');

    const result = await resultPromise;
    expect(result.user).toBe(55);
    expect(socket.end).toHaveBeenCalled();
  });

  test('_call supports authtoken login flow', async () => {
    const client = new SocketClient('authtoken', 'tkn');

    const resultPromise = new Promise((resolve) => {
      client._call({ cmd: 'upload', payload: {}, files: { captcha: 'abc' } }, resolve);
    });

    await flush();
    const socket = net.__getLastSocket();

    expect(socket.write).toHaveBeenCalledWith(
      JSON.stringify({ cmd: 'login', authtoken: 'tkn' }) + '\r\n',
      'utf8'
    );

    socket.emit('data', '{"ok":true}\r\n');
    socket.emit('data', '{"captcha":123}\r\n');

    const result = await resultPromise;
    expect(result.captcha).toBe(123);
  });

  test('_call throws mapped errors from socket response', async () => {
    const client = new SocketClient('u', 'p');

    client._call({ cmd: 'user', payload: {} }, () => {});
    await flush();
    const socket = net.__getLastSocket();

    socket.emit('data', '{"ok":true}\r\n');
    expect(() => socket.emit('data', '{"error":"invalid-captcha"}\r\n')).toThrow('valid image');
  });
});
