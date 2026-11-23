'use strict';

/**
 * Generate examples/n8n/deathbycaptcha-solve.workflow.json.
 *
 * The workflow uses HTTP Request nodes for the API calls, because the n8n
 * Code node cannot make HTTP requests by default. A Code node only builds
 * the form body from the input item and the environment variables.
 *
 * Run: node examples/n8n/build-workflow.js
 */

const fs = require('fs');
const path = require('path');

const code = `// Build the DeathByCaptcha upload body from the input item.
// Credentials come from the environment (self-hosted n8n):
//   DBC_USERNAME / DBC_PASSWORD   or   DBC_AUTHTOKEN
// Enable environment access for nodes if n8n blocks it:
//   N8N_BLOCK_ENV_ACCESS_IN_NODE=false
const PARAMS_KEY = {
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

const encode = (value) => encodeURIComponent(value);

return $input.all().map((item) => {
  const json = item.json || {};
  const type = json.type ?? 4;
  const params = json.params ?? {};
  const pairs = [];

  if ($env.DBC_AUTHTOKEN) {
    pairs.push(['authtoken', $env.DBC_AUTHTOKEN]);
  } else {
    pairs.push(['username', $env.DBC_USERNAME || '']);
    pairs.push(['password', $env.DBC_PASSWORD || '']);
  }

  pairs.push(['type', String(type)]);

  const key = PARAMS_KEY[type] || 'token_params';
  if (Object.keys(params).length > 0) {
    pairs.push([key, JSON.stringify(params)]);
  }

  if (json.image_base64) {
    pairs.push(['captcha', json.image_base64]);
  }

  const body = pairs.map(([k, v]) => encode(k) + '=' + encode(v)).join('&');

  return { json: { ...json, type, body } };
});`;

const workflow = {
  name: 'DeathByCaptcha - solve a CAPTCHA',
  nodes: [
    {
      parameters: {},
      id: 'manual-trigger',
      name: 'When clicking Test workflow',
      type: 'n8n-nodes-base.manualTrigger',
      typeVersion: 1,
      position: [0, 0],
    },
    {
      parameters: { mode: 'runOnceForAllItems', jsCode: code },
      id: 'build-request',
      name: 'Build request',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [220, 0],
    },
    {
      parameters: {
        method: 'POST',
        url: 'https://api.dbcapi.me/api/captcha',
        sendBody: true,
        specifyBody: 'raw',
        rawContentType: 'application/x-www-form-urlencoded',
        body: '={{ $json.body }}',
        options: {},
      },
      id: 'upload',
      name: 'Upload CAPTCHA',
      type: 'n8n-nodes-base.httpRequest',
      typeVersion: 4.2,
      position: [440, 0],
    },
    {
      parameters: { amount: 2, unit: 'seconds' },
      id: 'wait',
      name: 'Wait 2s',
      type: 'n8n-nodes-base.wait',
      typeVersion: 1.1,
      position: [660, 0],
    },
    {
      parameters: {
        url: '=https://api.dbcapi.me/api/captcha/{{ $json.captcha }}',
        options: {},
      },
      id: 'poll',
      name: 'Get result',
      type: 'n8n-nodes-base.httpRequest',
      typeVersion: 4.2,
      position: [880, 0],
    },
    {
      parameters: {
        conditions: {
          options: { caseSensitive: true, leftValue: '', typeValidation: 'strict', version: 2 },
          conditions: [
            {
              id: 'solved',
              leftValue: '={{ $json.text }}',
              rightValue: '',
              operator: { type: 'string', operation: 'notEmpty', singleValue: true },
            },
          ],
          combinator: 'and',
        },
        options: {},
      },
      id: 'solved',
      name: 'Solved?',
      type: 'n8n-nodes-base.if',
      typeVersion: 2,
      position: [1100, 0],
    },
    {
      parameters: {},
      id: 'done',
      name: 'Done',
      type: 'n8n-nodes-base.noOp',
      typeVersion: 1,
      position: [1320, -100],
    },
    {
      parameters: {},
      id: 'retry',
      name: 'Wait and poll again',
      type: 'n8n-nodes-base.noOp',
      typeVersion: 1,
      position: [1320, 100],
    },
  ],
  connections: {
    'When clicking Test workflow': { main: [[{ node: 'Build request', type: 'main', index: 0 }]] },
    'Build request': { main: [[{ node: 'Upload CAPTCHA', type: 'main', index: 0 }]] },
    'Upload CAPTCHA': { main: [[{ node: 'Wait 2s', type: 'main', index: 0 }]] },
    'Wait 2s': { main: [[{ node: 'Get result', type: 'main', index: 0 }]] },
    'Get result': { main: [[{ node: 'Solved?', type: 'main', index: 0 }]] },
    'Solved?': {
      main: [
        [{ node: 'Done', type: 'main', index: 0 }],
        [{ node: 'Wait and poll again', type: 'main', index: 0 }],
      ],
    },
    'Wait and poll again': { main: [[{ node: 'Wait 2s', type: 'main', index: 0 }]] },
  },
  settings: { executionOrder: 'v1' },
  pinData: {},
};

const out = path.join(__dirname, 'deathbycaptcha-solve.workflow.json');
fs.writeFileSync(out, JSON.stringify(workflow, null, 2) + '\n');
console.log('wrote', out);
