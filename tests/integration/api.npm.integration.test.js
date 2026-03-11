/**
 * API basic integration test using the published npm package.
 *
 * Identical logic to api.basic.integration.test.js but imports
 * `deathbycaptcha-lib` from npm instead of the local source.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { HttpClient } = require('deathbycaptcha-lib');

const ROOT_DIR = path.resolve(__dirname, '../..');
const ENV_PATH = path.join(ROOT_DIR, '.env');
const NORMAL_IMAGE_PATH = path.join(ROOT_DIR, 'images', 'normal.jpg');

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  raw.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      return;
    }

    const splitAt = trimmed.indexOf('=');
    if (splitAt <= 0) {
      return;
    }

    const key = trimmed.slice(0, splitAt).trim();
    const value = trimmed.slice(splitAt + 1).trim();

    if (!process.env[key]) {
      process.env[key] = value;
    }
  });
}

function callClient(client, methodName, ...args) {
  return new Promise((resolve, reject) => {
    try {
      client[methodName](...args, (result) => resolve(result));
    } catch (error) {
      reject(error);
    }
  });
}

async function run() {
  loadEnvFile(ENV_PATH);

  const username = process.env.DBC_USERNAME;
  const password = process.env.DBC_PASSWORD;

  if (!username || !password || username === 'your_dbc_username' || password === 'your_dbc_password') {
    console.error('Missing valid credentials. Set DBC_USERNAME/DBC_PASSWORD env vars or create .env file.');
    process.exit(1);
  }

  assert.ok(fs.existsSync(NORMAL_IMAGE_PATH), `Missing captcha image at ${NORMAL_IMAGE_PATH}`);

  const client = new HttpClient(username, password);

  console.log('1) Checking server/user endpoint...');
  const user = await callClient(client, 'get_user');
  assert.ok(user && Number(user.user) > 0, 'get_user failed or returned invalid user id');
  console.log(
    `   server/user status => user_id=${user.user}, rate=${user.rate}, balance=${user.balance}, is_banned=${user.is_banned}`
  );

  console.log('2) Checking balance...');
  const balance = await callClient(client, 'get_balance');
  assert.notStrictEqual(balance, null, 'get_balance returned null');
  assert.ok(!Number.isNaN(Number(balance)), 'get_balance did not return a numeric value');
  console.log(`   account balance => ${balance}`);

  console.log('3) Uploading text captcha type=0 (images/normal.jpg)...');
  const uploaded = await callClient(client, 'upload', {
    captcha: NORMAL_IMAGE_PATH,
    extra: { type: 0 },
  });
  assert.ok(uploaded && Number(uploaded.captcha) > 0, 'upload did not return a valid captcha id');
  console.log(`   uploaded captcha id => ${uploaded.captcha}`);

  console.log('4) Checking uploaded captcha object...');
  const uploadedDetails = await callClient(client, 'get_captcha', uploaded.captcha);
  assert.ok(uploadedDetails && Number(uploadedDetails.captcha) > 0, 'get_captcha failed for uploaded captcha id');
  console.log(
    `   uploaded captcha status => id=${uploadedDetails.captcha}, text=${uploadedDetails.text}, is_correct=${uploadedDetails.is_correct}`
  );

  console.log('5) Decoding text captcha type=0 and validating response...');
  const solved = await callClient(client, 'decode', {
    captcha: NORMAL_IMAGE_PATH,
    timeout: 120,
    extra: { type: 0 },
  });
  assert.ok(solved && Number(solved.captcha) > 0, 'decode did not return a valid captcha object');
  assert.ok(typeof solved.text === 'string' && solved.text.trim().length > 0, 'decode returned empty text');
  console.log(`   solved captcha => id=${solved.captcha}, text="${solved.text}", is_correct=${solved.is_correct}`);

  console.log('6) Reporting solved captcha...');
  const reportResult = await callClient(client, 'report', solved.captcha);
  assert.ok(typeof reportResult === 'boolean', 'report did not return a boolean result');
  console.log(`   report result => ${reportResult}`);

  console.log('API npm integration test passed.');
}

run().catch((error) => {
  console.error('API npm integration test failed:', error && error.message ? error.message : error);
  process.exit(1);
});
