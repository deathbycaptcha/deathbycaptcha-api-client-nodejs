# [DeathByCaptcha](https://deathbycaptcha.com/)


<p align="center">
  <a href="https://github.com/deathbycaptcha/deathbycaptcha-api-client-python#readme"><img alt="Python" src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white"></a>
  <a href="https://github.com/deathbycaptcha/deathbycaptcha-api-client-nodejs#readme"><img alt="Node.js" src="https://img.shields.io/badge/%E2%80%BA-Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white&labelColor=555555"></a>
  <a href="https://github.com/deathbycaptcha/deathbycaptcha-api-client-dotnet#readme"><img alt=".NET" src="https://img.shields.io/badge/.NET-512BD4?style=for-the-badge&logo=dotnet&logoColor=white"></a>
  <a href="https://github.com/deathbycaptcha/deathbycaptcha-api-client-java#readme"><img alt="Java" src="https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white"></a>
  <a href="https://github.com/deathbycaptcha/deathbycaptcha-api-client-php#readme"><img alt="PHP" src="https://img.shields.io/badge/PHP-777BB4?style=for-the-badge&logo=php&logoColor=white"></a>
  <a href="https://github.com/deathbycaptcha/deathbycaptcha-api-client-perl#readme"><img alt="Perl" src="https://img.shields.io/badge/Perl-39457E?style=for-the-badge&logo=perl&logoColor=white"></a>
  <a href="https://github.com/deathbycaptcha/deathbycaptcha-api-client-c11#readme"><img alt="C" src="https://img.shields.io/badge/C-A8B9CC?style=for-the-badge&logo=c&logoColor=black"></a>
  <a href="https://github.com/deathbycaptcha/deathbycaptcha-api-client-cpp#readme"><img alt="C++" src="https://img.shields.io/badge/C%2B%2B-00599C?style=for-the-badge&logo=cplusplus&logoColor=white"></a>
  <a href="https://github.com/deathbycaptcha/deathbycaptcha-api-client-go#readme"><img alt="Go" src="https://img.shields.io/badge/Go-00ADD8?style=for-the-badge&logo=go&logoColor=white"></a>
</p>


## 📖 Introduction

The [DeathByCaptcha](https://deathbycaptcha.com) Node.js client is the official **captcha API for automation tools** — web scrapers, browser automation frameworks, and testing pipelines that need to solve CAPTCHA challenges programmatically. It is also a battle-tested **recaptcha solver API**, with full support for reCAPTCHA v2, v3, and Enterprise token solving, plus Cloudflare Turnstile, GeeTest, Amazon WAF, and many more types. The library ships with both an HTTPS transport (encrypted — recommended when security is a priority) and a socket transport (lower latency — recommended for high-throughput production workloads).

Key features:

- 🧩 Send image, audio and modern token-based CAPTCHA types (reCAPTCHA v2/v3, Turnstile, GeeTest, etc.).
- 🔄 Unified client API across HTTP and socket transports — switching implementations is straightforward.
- 🔐 Built-in support for proxies, timeouts and advanced token parameters for modern CAPTCHA flows.

Quick start example (HTTP):

```javascript
const dbc = require('deathbycaptcha-lib');

const client = new dbc.HttpClient('your_username', 'your_password');
client.decode({captcha: 'path/to/captcha.jpg'}, (captcha) => {
    if (captcha) console.log(captcha['text']);
});
```

> **🚌 Transport options:** Use `HttpClient` for encrypted HTTPS communication — credentials and data travel over TLS. Use `SocketClient` for lower latency and higher throughput — it is faster but communicates over a plain TCP connection to `api.dbcapi.me` on ports `8123–8130`.

---

### Tests Status

[![Unit Tests Node 24](https://github.com/deathbycaptcha/deathbycaptcha-api-client-nodejs/actions/workflows/unit-tests-node24.yml/badge.svg)](https://github.com/deathbycaptcha/deathbycaptcha-api-client-nodejs/actions/workflows/unit-tests-node24.yml)
[![API Integration](https://github.com/deathbycaptcha/deathbycaptcha-api-client-nodejs/actions/workflows/api-integration.yml/badge.svg)](https://github.com/deathbycaptcha/deathbycaptcha-api-client-nodejs/actions/workflows/api-integration.yml)
[![Coverage](https://img.shields.io/endpoint?url=https://deathbycaptcha.github.io/deathbycaptcha-api-client-nodejs/coverage-badge.json)](https://github.com/deathbycaptcha/deathbycaptcha-api-client-nodejs/actions/workflows/coverage.yml)

---

## 🗂️ Index

- [Installation](#installation)
    - [From npm (Recommended)](#from-npm-recommended)
    - [From GitHub Repository](#from-github-repository)
- [How to Use DBC API Clients](#how-to-use-dbc-api-clients)
    - [Common Clients' Interface](#common-clients-interface)
    - [Available Methods](#available-methods)
- [Credentials & Configuration](#credentials--configuration)
    - [Quick Setup](#quick-setup)
- [CAPTCHA Types Quick Reference & Examples](#captcha-types-quick-reference--examples)
    - [Quick Start](#quick-start)
    - [Type Reference](#type-reference)
    - [Per-Type Code Snippets](#per-type-code-snippets)
- [CAPTCHA Types Extended Reference](#captcha-types-extended-reference)
    - [Featured Sample: Selenium reCAPTCHA v2](#featured-sample-selenium-recaptcha-v2)
    - [reCAPTCHA Image-Based API — Deprecated (Types 2 & 3)](#recaptcha-image-based-api--deprecated-types-2--3)
    - [reCAPTCHA Token API (v2 & v3)](#recaptcha-token-api-v2--v3)
    - [reCAPTCHA v2 API FAQ](#recaptcha-v2-api-faq)
    - [What is reCAPTCHA v3?](#what-is-recaptcha-v3)
    - [reCAPTCHA v3 API FAQ](#recaptcha-v3-api-faq)
    - [Amazon WAF API (Type 16)](#amazon-waf-api-type-16)
    - [Cloudflare Turnstile API (Type 12)](#cloudflare-turnstile-api-type-12)
- [Testing & CI](TESTING.md)


<a id="installation"></a>
## 🛠️ Installation

<a id="from-npm-recommended"></a>
### 📦 From npm (Recommended)

```bash
npm install deathbycaptcha-lib
```

<a id="from-github-repository"></a>
### 🐙 From GitHub Repository

For the latest development version or to contribute:

```bash
git clone https://github.com/deathbycaptcha/deathbycaptcha-api-client-nodejs.git
cd deathbycaptcha-api-client-nodejs
npm install
```

Or install directly from the repository URL without cloning:

```bash
npm install git+https://github.com/deathbycaptcha/deathbycaptcha-api-client-nodejs.git
```

<a id="how-to-use-dbc-api-clients"></a>
## 🚀 How to Use DBC API Clients

<a id="common-clients-interface"></a>
### 🔌 Common Clients' Interface

All clients must be instantiated with your DeathByCaptcha credentials — either *username* and *password*, or an *authtoken* (available in the DBC user panel). Replace `HttpClient` with `SocketClient` to use the socket transport instead.

```javascript
const dbc = require('deathbycaptcha-lib');

// Username + password (HTTPS transport — encrypted, recommended when security matters)
const client = new dbc.HttpClient(username, password);

// Username + password (socket transport — faster, lower latency, recommended for high throughput)
// const client = new dbc.SocketClient(username, password);

// Authtoken — pass "authtoken" as the first argument, token as second
// const client = new dbc.HttpClient('authtoken', token_from_panel);
```

| Transport | Class | Best for |
|---|---|---|
| HTTPS | `dbc.HttpClient` | Encrypted TLS transport — safer for credential handling and network-sensitive environments |
| Socket | `dbc.SocketClient` | Plain TCP — faster and lower latency, recommended for high-throughput production workloads |

All clients share the same interface. Below is a summary of every available method.

<a id="available-methods"></a>

| Method | Signature | Description |
|---|---|---|
| `upload()` | `upload({captcha, extra}, callback)` | Upload a CAPTCHA for solving without waiting. `captcha` is a file path; `extra` carries type-specific params (`type`, `token_params`, `waf_params`, etc.). |
| `decode()` | `decode({captcha, extra}, callback)` | Upload and poll until solved or timed out. Preferred method for most integrations. Callback receives the result object or `null`. |
| `get_captcha()` | `get_captcha(captchaId, callback)` | Fetch status and result of a previously uploaded CAPTCHA by its numeric ID. |
| `report()` | `report(captchaId, callback)` | Report a CAPTCHA as incorrectly solved to request a refund. Only report genuine errors. |
| `get_balance()` | `get_balance(callback)` | Return the current account balance in US cents via callback. |

### 📬 CAPTCHA Result Object

All methods that return a solved CAPTCHA pass a plain object to the callback with the following keys:

| Key | Type | Description |
|---|---|---|
| `"captcha"` | `number` | Numeric CAPTCHA ID assigned by DBC |
| `"text"` | `string` | Solved text or token (the value you inject into the page) |
| `"is_correct"` | `boolean` | Whether DBC considers the solution correct |

```javascript
// Example result object
{
    captcha: 123456789,
    text: '03AOPBWq_...',
    is_correct: true
}
```

### 💡 Full Usage Example

```javascript
const dbc = require('deathbycaptcha-lib');

const client = new dbc.HttpClient(username, password);

client.get_balance((balance) => {
    console.log('Balance:', balance, 'US cents');
});

client.decode({captcha: 'path/to/captcha.jpg'}, (captcha) => {
    if (captcha) {
        console.log('Solved CAPTCHA ' + captcha['captcha'] + ': ' + captcha['text']);

        // Report only if you are certain the solution is wrong:
        // client.report(captcha['captcha'], (result) => {
        //     console.log('Report status: ' + result);
        // });
    }
});
```

Quick balance check from the command line:

```bash
node examples/get_balance.js <username> <password> HTTP
```

<a id="credentials--configuration"></a>
## 🔑 Credentials & Configuration

<a id="quick-setup"></a>
### ⚡ Quick Setup

```bash
# ① Copy template and add credentials
cp .env.sample .env
# Edit .env with your username and password

# ② Run unit tests locally (fastest)
npm run test:unit

# ③ Run the full integration suite
npm run test:integration

# ④ Push to repo for GitHub Actions and GitLab CI
git push
```

<a id="captcha-types-quick-reference--examples"></a>
## 🧩 CAPTCHA Types Quick Reference & Examples

This section covers every supported CAPTCHA type, how to run the corresponding example scripts, and ready-to-copy code snippets. Start with the Quick Start below, then use the Type Reference to find the type you need.

<a id="quick-start"></a>
### 🏁 Quick Start

1. **📦 Install the library** (see [Installation](#installation))
2. **📂 Navigate to the `examples/` directory** and run the script for the type you need:

```bash
cd examples
node example.normal_Captcha.js

# Balance check (accepts credentials as arguments):
node get_balance.js <username> <password> HTTP
```

> ⚠️ Always run examples from the `examples/` directory so the `images/` folder is accessible to scripts that need it.

Before running any script, add your DBC credentials inside it:

```javascript
const username = 'your_username';
const password = 'your_password';
```

<a id="type-reference"></a>
### 📋 Type Reference

The table below maps every supported type to its use case, a code snippet, and the corresponding example file in `examples/`.

| Type ID | CAPTCHA Type | Use Case | Quick Use | Node.js Sample |
| --- | --- | --- | --- | --- |
| 0 | Standard Image | Basic image CAPTCHA | [snippet](#sample-type-0-standard-image) | [open](https://github.com/deathbycaptcha/deathbycaptcha-api-client-nodejs/blob/master/examples/example.normal_Captcha.js) |
| 2 | ~~reCAPTCHA Coordinates~~ | Deprecated — do not use for new integrations | — | — |
| 3 | ~~reCAPTCHA Image Group~~ | Deprecated — do not use for new integrations | — | — |
| 4 | reCAPTCHA v2 Token | reCAPTCHA v2 token solving | [snippet](#sample-type-4-recaptcha-v2-token) | [open](https://github.com/deathbycaptcha/deathbycaptcha-api-client-nodejs/blob/master/examples/example.reCAPTCHA_v2.js) |
| 5 | reCAPTCHA v3 Token | reCAPTCHA v3 with risk scoring | [snippet](#sample-type-5-recaptcha-v3-token) | [open](https://github.com/deathbycaptcha/deathbycaptcha-api-client-nodejs/blob/master/examples/example.reCAPTCHA_v3.js) |
| 25 | reCAPTCHA v2 Enterprise | reCAPTCHA v2 Enterprise tokens | [snippet](#sample-type-25-recaptcha-v2-enterprise) | [open](https://github.com/deathbycaptcha/deathbycaptcha-api-client-nodejs/blob/master/examples/example.reCAPTCHA_v2_enterprise.js) |
| 8 | GeeTest v3 | Geetest v3 verification | [snippet](#sample-type-8-geetest-v3) | [open](https://github.com/deathbycaptcha/deathbycaptcha-api-client-nodejs/blob/master/examples/example.Geetest_v3.js) |
| 9 | GeeTest v4 | Geetest v4 verification | [snippet](#sample-type-9-geetest-v4) | [open](https://github.com/deathbycaptcha/deathbycaptcha-api-client-nodejs/blob/master/examples/example.Geetest_v4.js) |
| 11 | Text CAPTCHA | Text-based question solving | [snippet](#sample-type-11-text-captcha) | [open](https://github.com/deathbycaptcha/deathbycaptcha-api-client-nodejs/blob/master/examples/example.Textcaptcha.js) |
| 12 | Cloudflare Turnstile | Cloudflare Turnstile token | [snippet](#sample-type-12-cloudflare-turnstile) | [open](https://github.com/deathbycaptcha/deathbycaptcha-api-client-nodejs/blob/master/examples/example.Turnstile.js) |
| 13 | Audio CAPTCHA | Audio CAPTCHA solving | [snippet](#sample-type-13-audio-captcha) | [open](https://github.com/deathbycaptcha/deathbycaptcha-api-client-nodejs/blob/master/examples/example.Audio.js) |
| 14 | Lemin | Lemin CAPTCHA | [snippet](#sample-type-14-lemin) | [open](https://github.com/deathbycaptcha/deathbycaptcha-api-client-nodejs/blob/master/examples/example.Lemin.js) |
| 15 | Capy | Capy CAPTCHA | [snippet](#sample-type-15-capy) | [open](https://github.com/deathbycaptcha/deathbycaptcha-api-client-nodejs/blob/master/examples/example.Capy.js) |
| 16 | Amazon WAF | Amazon WAF verification | [snippet](#sample-type-16-amazon-waf) | [open](https://github.com/deathbycaptcha/deathbycaptcha-api-client-nodejs/blob/master/examples/example.Amazon_Waf.js) |
| 17 | Siara | Siara CAPTCHA | [snippet](#sample-type-17-siara) | [open](https://github.com/deathbycaptcha/deathbycaptcha-api-client-nodejs/blob/master/examples/example.Siara.js) |
| 18 | MTCaptcha | Mtcaptcha CAPTCHA | [snippet](#sample-type-18-mtcaptcha) | [open](https://github.com/deathbycaptcha/deathbycaptcha-api-client-nodejs/blob/master/examples/example.Mtcaptcha.js) |
| 19 | Cutcaptcha | Cutcaptcha CAPTCHA | [snippet](#sample-type-19-cutcaptcha) | [open](https://github.com/deathbycaptcha/deathbycaptcha-api-client-nodejs/blob/master/examples/example.Cutcaptcha.js) |
| 20 | Friendly Captcha | Friendly Captcha | [snippet](#sample-type-20-friendly-captcha) | [open](https://github.com/deathbycaptcha/deathbycaptcha-api-client-nodejs/blob/master/examples/example.Friendlycaptcha.js) |
| 21 | DataDome | Datadome verification | [snippet](#sample-type-21-datadome) | [open](https://github.com/deathbycaptcha/deathbycaptcha-api-client-nodejs/blob/master/examples/example.Datadome.js) |
| 23 | Tencent | Tencent CAPTCHA | [snippet](#sample-type-23-tencent) | [open](https://github.com/deathbycaptcha/deathbycaptcha-api-client-nodejs/blob/master/examples/example.Tencent.js) |
| 24 | ATB | ATB CAPTCHA | [snippet](#sample-type-24-atb) | [open](https://github.com/deathbycaptcha/deathbycaptcha-api-client-nodejs/blob/master/examples/example.Atb.js) |

<a id="per-type-code-snippets"></a>
### 📝 Per-Type Code Snippets

Minimal usage snippet for each supported type. Use these as a starting point and refer to the full example files in `examples/` for complete implementations.

<a id="sample-type-0-standard-image"></a>
#### 🖼️ Sample Type 0: Standard Image
Official description: [Supported CAPTCHAs](https://deathbycaptcha.com/api#supported_captchas)
Full sample: [example.normal_Captcha.js](https://github.com/deathbycaptcha/deathbycaptcha-api-client-nodejs/blob/master/examples/example.normal_Captcha.js)

```javascript
client.decode({captcha: 'images/normal.jpg'}, (captcha) => {
    if (captcha) console.log(captcha['captcha'], captcha['text']);
});
```

---

<a id="sample-type-4-recaptcha-v2-token"></a>
#### 🤖 Sample Type 4: reCAPTCHA v2 Token
Official description: [reCAPTCHA Token API (v2)](https://deathbycaptcha.com/api/newtokenrecaptcha#token-v2)
Full sample: [example.reCAPTCHA_v2.js](https://github.com/deathbycaptcha/deathbycaptcha-api-client-nodejs/blob/master/examples/example.reCAPTCHA_v2.js)

```javascript
const token_params = JSON.stringify({
    proxy: 'http://user:pass@127.0.0.1:1234',
    proxytype: 'HTTP',
    googlekey: 'sitekey',
    pageurl: 'https://target',
});
client.decode({extra: {type: 4, token_params}}, (captcha) => {
    if (captcha) console.log(captcha['captcha'], captcha['text']);
});
```

---

<a id="sample-type-5-recaptcha-v3-token"></a>
#### 🤖 Sample Type 5: reCAPTCHA v3 Token
Official description: [reCAPTCHA v3](https://deathbycaptcha.com/api/newtokenrecaptcha#reCAPTCHAv3)
Full sample: [example.reCAPTCHA_v3.js](https://github.com/deathbycaptcha/deathbycaptcha-api-client-nodejs/blob/master/examples/example.reCAPTCHA_v3.js)

```javascript
const token_params = JSON.stringify({
    proxy: 'http://user:pass@127.0.0.1:1234',
    proxytype: 'HTTP',
    googlekey: 'sitekey',
    pageurl: 'https://target',
    action: 'verify',
    min_score: 0.3,
});
client.decode({extra: {type: 5, token_params}}, (captcha) => {
    if (captcha) console.log(captcha['captcha'], captcha['text']);
});
```

---

<a id="sample-type-25-recaptcha-v2-enterprise"></a>
#### 🏢 Sample Type 25: reCAPTCHA v2 Enterprise
Official description: [reCAPTCHA v2 Enterprise](https://deathbycaptcha.com/api/newtokenrecaptcha#reCAPTCHAv2Enterprise)
Full sample: [example.reCAPTCHA_v2_enterprise.js](https://github.com/deathbycaptcha/deathbycaptcha-api-client-nodejs/blob/master/examples/example.reCAPTCHA_v2_enterprise.js)

```javascript
const token_enterprise_params = JSON.stringify({
    proxy: 'http://user:pass@127.0.0.1:1234',
    proxytype: 'HTTP',
    googlekey: 'sitekey',
    pageurl: 'https://target',
});
client.decode({extra: {type: 25, token_enterprise_params}}, (captcha) => {
    if (captcha) console.log(captcha['captcha'], captcha['text']);
});
```

---

<a id="sample-type-8-geetest-v3"></a>
#### 🧩 Sample Type 8: GeeTest v3
Official description: [GeeTest](https://deathbycaptcha.com/api/geetest)
Full sample: [example.Geetest_v3.js](https://github.com/deathbycaptcha/deathbycaptcha-api-client-nodejs/blob/master/examples/example.Geetest_v3.js)

```javascript
const geetest_params = JSON.stringify({
    proxy: 'http://user:pass@127.0.0.1:1234',
    proxytype: 'HTTP',
    gt: 'gt_value',
    challenge: 'challenge_value',
    pageurl: 'https://target',
});
client.decode({extra: {type: 8, geetest_params}}, (captcha) => {
    if (captcha) console.log(captcha['captcha'], captcha['text']);
});
```

---

<a id="sample-type-9-geetest-v4"></a>
#### 🧩 Sample Type 9: GeeTest v4
Official description: [GeeTest](https://deathbycaptcha.com/api/geetest)
Full sample: [example.Geetest_v4.js](https://github.com/deathbycaptcha/deathbycaptcha-api-client-nodejs/blob/master/examples/example.Geetest_v4.js)

```javascript
const geetest_params = JSON.stringify({
    proxy: 'http://user:pass@127.0.0.1:1234',
    proxytype: 'HTTP',
    captcha_id: 'captcha_id',
    pageurl: 'https://target',
});
client.decode({extra: {type: 9, geetest_params}}, (captcha) => {
    if (captcha) console.log(captcha['captcha'], captcha['text']);
});
```

---

<a id="sample-type-11-text-captcha"></a>
#### 💬 Sample Type 11: Text CAPTCHA
Official description: [Text CAPTCHA](https://deathbycaptcha.com/api/textcaptcha)
Full sample: [example.Textcaptcha.js](https://github.com/deathbycaptcha/deathbycaptcha-api-client-nodejs/blob/master/examples/example.Textcaptcha.js)

```javascript
client.decode({extra: {type: 11, textcaptcha: 'What is two plus two?'}}, (captcha) => {
    if (captcha) console.log(captcha['captcha'], captcha['text']);
});
```

---

<a id="sample-type-12-cloudflare-turnstile"></a>
#### ☁️ Sample Type 12: Cloudflare Turnstile
Official description: [Cloudflare Turnstile](https://deathbycaptcha.com/api/turnstile)
Full sample: [example.Turnstile.js](https://github.com/deathbycaptcha/deathbycaptcha-api-client-nodejs/blob/master/examples/example.Turnstile.js)

```javascript
const turnstile_params = JSON.stringify({
    proxy: 'http://user:pass@127.0.0.1:1234',
    proxytype: 'HTTP',
    sitekey: 'sitekey',
    pageurl: 'https://target',
});
client.decode({extra: {type: 12, turnstile_params}}, (captcha) => {
    if (captcha) console.log(captcha['captcha'], captcha['text']);
});
```

---

<a id="sample-type-13-audio-captcha"></a>
#### 🔊 Sample Type 13: Audio CAPTCHA
Official description: [Audio CAPTCHA](https://deathbycaptcha.com/api/audio)
Full sample: [example.Audio.js](https://github.com/deathbycaptcha/deathbycaptcha-api-client-nodejs/blob/master/examples/example.Audio.js)

```javascript
const fs = require('fs');
const audio_b64 = fs.readFileSync('images/audio.mp3').toString('base64');
client.decode({extra: {type: 13, audio: audio_b64, language: 'en'}}, (captcha) => {
    if (captcha) console.log(captcha['captcha'], captcha['text']);
});
```

---

<a id="sample-type-14-lemin"></a>
#### 🔵 Sample Type 14: Lemin
Official description: [Lemin](https://deathbycaptcha.com/api/lemin)
Full sample: [example.Lemin.js](https://github.com/deathbycaptcha/deathbycaptcha-api-client-nodejs/blob/master/examples/example.Lemin.js)

```javascript
const lemin_params = JSON.stringify({
    proxy: 'http://user:pass@127.0.0.1:1234',
    proxytype: 'HTTP',
    captchaid: 'CROPPED_xxx',
    pageurl: 'https://target',
});
client.decode({extra: {type: 14, lemin_params}}, (captcha) => {
    if (captcha) console.log(captcha['captcha'], captcha['text']);
});
```

---

<a id="sample-type-15-capy"></a>
#### 🏴 Sample Type 15: Capy
Official description: [Capy](https://deathbycaptcha.com/api/capy)
Full sample: [example.Capy.js](https://github.com/deathbycaptcha/deathbycaptcha-api-client-nodejs/blob/master/examples/example.Capy.js)

```javascript
const capy_params = JSON.stringify({
    proxy: 'http://user:pass@127.0.0.1:1234',
    proxytype: 'HTTP',
    captchakey: 'PUZZLE_xxx',
    api_server: 'https://api.capy.me/',
    pageurl: 'https://target',
});
client.decode({extra: {type: 15, capy_params}}, (captcha) => {
    if (captcha) console.log(captcha['captcha'], captcha['text']);
});
```

---

<a id="sample-type-16-amazon-waf"></a>
#### 🛡️ Sample Type 16: Amazon WAF
Official description: [Amazon WAF](https://deathbycaptcha.com/api/amazonwaf)
Full sample: [example.Amazon_Waf.js](https://github.com/deathbycaptcha/deathbycaptcha-api-client-nodejs/blob/master/examples/example.Amazon_Waf.js)

```javascript
const waf_params = JSON.stringify({
    proxy: 'http://user:pass@127.0.0.1:1234',
    proxytype: 'HTTP',
    sitekey: 'sitekey',
    pageurl: 'https://target',
    iv: 'iv_value',
    context: 'context_value',
});
client.decode({extra: {type: 16, waf_params}}, (captcha) => {
    if (captcha) console.log(captcha['captcha'], captcha['text']);
});
```

---

<a id="sample-type-17-siara"></a>
#### 🔍 Sample Type 17: Siara
Official description: [Siara](https://deathbycaptcha.com/api/siara)
Full sample: [example.Siara.js](https://github.com/deathbycaptcha/deathbycaptcha-api-client-nodejs/blob/master/examples/example.Siara.js)

```javascript
const siara_params = JSON.stringify({
    proxy: 'http://user:pass@127.0.0.1:1234',
    proxytype: 'HTTP',
    slideurlid: 'slide_master_url_id',
    pageurl: 'https://target',
    useragent: 'Mozilla/5.0',
});
client.decode({extra: {type: 17, siara_params}}, (captcha) => {
    if (captcha) console.log(captcha['captcha'], captcha['text']);
});
```

---

<a id="sample-type-18-mtcaptcha"></a>
#### 🔒 Sample Type 18: MTCaptcha
Official description: [MTCaptcha](https://deathbycaptcha.com/api/mtcaptcha)
Full sample: [example.Mtcaptcha.js](https://github.com/deathbycaptcha/deathbycaptcha-api-client-nodejs/blob/master/examples/example.Mtcaptcha.js)

```javascript
const mtcaptcha_params = JSON.stringify({
    proxy: 'http://user:pass@127.0.0.1:1234',
    proxytype: 'HTTP',
    sitekey: 'MTPublic-xxx',
    pageurl: 'https://target',
});
client.decode({extra: {type: 18, mtcaptcha_params}}, (captcha) => {
    if (captcha) console.log(captcha['captcha'], captcha['text']);
});
```

---

<a id="sample-type-19-cutcaptcha"></a>
#### ✂️ Sample Type 19: Cutcaptcha
Official description: [Cutcaptcha](https://deathbycaptcha.com/api/cutcaptcha)
Full sample: [example.Cutcaptcha.js](https://github.com/deathbycaptcha/deathbycaptcha-api-client-nodejs/blob/master/examples/example.Cutcaptcha.js)

```javascript
const cutcaptcha_params = JSON.stringify({
    proxy: 'http://user:pass@127.0.0.1:1234',
    proxytype: 'HTTP',
    apikey: 'api_key',
    miserykey: 'misery_key',
    pageurl: 'https://target',
});
client.decode({extra: {type: 19, cutcaptcha_params}}, (captcha) => {
    if (captcha) console.log(captcha['captcha'], captcha['text']);
});
```

---

<a id="sample-type-20-friendly-captcha"></a>
#### 💚 Sample Type 20: Friendly Captcha
Official description: [Friendly Captcha](https://deathbycaptcha.com/api/friendly)
Full sample: [example.Friendlycaptcha.js](https://github.com/deathbycaptcha/deathbycaptcha-api-client-nodejs/blob/master/examples/example.Friendlycaptcha.js)

```javascript
const friendly_params = JSON.stringify({
    proxy: 'http://user:pass@127.0.0.1:1234',
    proxytype: 'HTTP',
    sitekey: 'FCMG...',
    pageurl: 'https://target',
});
client.decode({extra: {type: 20, friendly_params}}, (captcha) => {
    if (captcha) console.log(captcha['captcha'], captcha['text']);
});
```

---

<a id="sample-type-21-datadome"></a>
#### 🛡️ Sample Type 21: DataDome
Official description: [DataDome](https://deathbycaptcha.com/api/datadome)
Full sample: [example.Datadome.js](https://github.com/deathbycaptcha/deathbycaptcha-api-client-nodejs/blob/master/examples/example.Datadome.js)

```javascript
const datadome_params = JSON.stringify({
    proxy: 'http://user:pass@127.0.0.1:1234',
    proxytype: 'HTTP',
    pageurl: 'https://target',
    captcha_url: 'https://target/captcha',
});
client.decode({extra: {type: 21, datadome_params}}, (captcha) => {
    if (captcha) console.log(captcha['captcha'], captcha['text']);
});
```

---

<a id="sample-type-23-tencent"></a>
#### 🔑 Sample Type 23: Tencent
Official description: [Tencent](https://deathbycaptcha.com/api/tencent)
Full sample: [example.Tencent.js](https://github.com/deathbycaptcha/deathbycaptcha-api-client-nodejs/blob/master/examples/example.Tencent.js)

```javascript
const tencent_params = JSON.stringify({
    proxy: 'http://user:pass@127.0.0.1:1234',
    proxytype: 'HTTP',
    appid: 'appid',
    pageurl: 'https://target',
});
client.decode({extra: {type: 23, tencent_params}}, (captcha) => {
    if (captcha) console.log(captcha['captcha'], captcha['text']);
});
```

---

<a id="sample-type-24-atb"></a>
#### 🏷️ Sample Type 24: ATB
Official description: [ATB](https://deathbycaptcha.com/api/atb)
Full sample: [example.Atb.js](https://github.com/deathbycaptcha/deathbycaptcha-api-client-nodejs/blob/master/examples/example.Atb.js)

```javascript
const atb_params = JSON.stringify({
    proxy: 'http://user:pass@127.0.0.1:1234',
    proxytype: 'HTTP',
    appid: 'appid',
    apiserver: 'https://cap.aisecurius.com',
    pageurl: 'https://target',
});
client.decode({extra: {type: 24, atb_params}}, (captcha) => {
    if (captcha) console.log(captcha['captcha'], captcha['text']);
});
```

<a id="captcha-types-extended-reference"></a>
## 📚 CAPTCHA Types Extended Reference

Full API-level documentation for selected CAPTCHA types: parameter references, payload schemas, request/response formats, token lifespans, and integration notes.

<a id="featured-sample-selenium-recaptcha-v2"></a>
### ⭐ Featured Sample: Selenium reCAPTCHA v2

This repository includes an integrated Selenium sample at:

- `examples/selenium/`

Use this sample when you need a browser-automation flow that extracts `sitekey`, requests a token using DeathByCaptcha (`type=4`), injects it into the page, and submits the form.

Quick run:

```bash
npm install
cp .env.sample .env
# edit .env with DBC_USERNAME and DBC_PASSWORD
node examples/selenium/recaptcha_v2_selenium.js
```

See detailed usage in [examples/selenium/README.md](examples/selenium/README.md).

---

<a id="recaptcha-image-based-api--deprecated-types-2--3"></a>
### ⛔ reCAPTCHA Image-Based API — Deprecated (Types 2 & 3)

> ⚠️ **Deprecated.** Types 2 (Coordinates) and 3 (Image Group) are legacy image-based reCAPTCHA challenge methods that are no longer used at captcha solving. Do not use them for new integrations — use the [reCAPTCHA Token API (v2 & v3)](#recaptcha-token-api-v2--v3) instead.

---

<a id="recaptcha-token-api-v2--v3"></a>
### 🔐 reCAPTCHA Token API (v2 & v3)

The Token-based API solves reCAPTCHA challenges by returning a token you inject directly into the page form, rather than clicking images. Given a site URL and site key, DBC solves the challenge on its side and returns a token valid for one submission.

- **Token Image API**: Provided a site URL and site key, the API returns a token that you use to submit the form on the page with the reCAPTCHA challenge.

---

<a id="recaptcha-v2-api-faq"></a>
### ❓ reCAPTCHA v2 API FAQ

**What's the Token Image API URL?**
To use the Token Image API you will have to send a HTTP POST Request to <http://api.dbcapi.me/api/captcha>

**What are the POST parameters for the Token image API?**

-   **`username`**: Your DBC account username
-   **`password`**: Your DBC account password
-   **`type`=4**: Type 4 specifies this is the reCAPTCHA v2 Token API
-   **`token_params`=json(payload)**: the data to access the recaptcha challenge
json payload structure:
    -   **`proxy`**: your proxy url and credentials (if any). Examples:
        -   <http://127.0.0.1:3128>
        -   <http://user:password@127.0.0.1:3128>

    -   **`proxytype`**: your proxy connection protocol. For supported proxy types refer to Which proxy types are supported?. Example:
        -   HTTP

    -   **`googlekey`**: the google recaptcha site key of the website with the recaptcha. For more details about the site key refer to What is a recaptcha site key?. Example:
        -   6Le-wvkSAAAAAPBMRTvw0Q4Muexq9bi0DJwx_mJ-

    -   **`pageurl`**: the url of the page with the recaptcha challenges. This url has to include the path in which the recaptcha is loaded. Example: if the recaptcha you want to solve is in <http://test.com/path1>, pageurl has to be <http://test.com/path1> and not <http://test.com>.
    -   **`data-s`**: This parameter is only required for solve the google search tokens, the ones visible, while google search trigger the robot protection. Use the data-s value inside the google search response html. For regulars tokens don't use this parameter.

The **`proxy`** parameter is optional, but we strongly recommend to use one to prevent token rejection by the provided page due to inconsistencies between the IP that solved the captcha (ours if no proxy is provided) and the IP that submitted the token for verification (yours).
**Note**: If **`proxy`** is provided, **`proxytype`** is a required parameter.

Full example of **`token_params`**:
```json
{
  "proxy": "http://127.0.0.1:3128",
  "proxytype": "HTTP",
  "googlekey": "6Le-wvkSAAAAAPBMRTvw0Q4Muexq9bi0DJwx_mJ-",
  "pageurl": "http://test.com/path_with_recaptcha"
}
```

Example of **`token_params`** for google search captchas:
```json
{
  "googlekey": "6Le-wvkSA...",
  "pageurl": "...",
  "data-s": "IUdfh4rh0sd..."
}
```

**What's the response from the Token image API?**
The token image API response has the same structure as regular captchas' response. Refer to Polling for uploaded CAPTCHA status for details about the response. The token will come in the text key of the response. It's valid for one use and has a 2 minute lifespan. It will be a string like the following:
```bash
"03AOPBWq_RPO2vLzyk0h8gH0cA2X4v3tpYCPZR6Y4yxKy1s3Eo7CHZRQntxrdsaD2H0e6S3547xi1FlqJB4rob46J0-wfZMj6YpyVa0WGCfpWzBWcLn7tO_EYsvEC_3kfLNINWa5LnKrnJTDXTOz-JuCKvEXx0EQqzb0OU4z2np4uyu79lc_NdvL0IRFc3Cslu6UFV04CIfqXJBWCE5MY0Ag918r14b43ZdpwHSaVVrUqzCQMCybcGq0yxLQf9eSexFiAWmcWLI5nVNA81meTXhQlyCn5bbbI2IMSEErDqceZjf1mX3M67BhIb4"
```

---

<a id="what-is-recaptcha-v3"></a>
### 🔎 What is reCAPTCHA v3?
This API extends the reCAPTCHA v2 Token API with two additional parameters: `action` and **minimal score (`min_score`)**.
reCAPTCHA v3 returns a score from each user, that evaluate if user is a bot or human. Then the website uses the score value that could range from 0 to 1 to decide if will accept or not the requests. Lower scores near to 0 are identified as bot.
The `action` parameter at reCAPTCHA v3 is an additional data used to separate different captcha validations like for example **login**, **register**, **sales**, **etc**.

---

<a id="recaptcha-v3-api-faq"></a>
### ❓ reCAPTCHA v3 API FAQ

**What is `action` in reCAPTCHA v3?**
Is a new parameter that allows processing user actions on the website differently.
To find this we need to inspect the javascript code of the website looking for call of grecaptcha.execute function. Example:
```javascript
grecaptcha.execute('6Lc2fhwTAAAAAGatXTzFYfvlQMI2T7B6ji8UVV_f', {action: something})
```
Sometimes it's really hard to find it and we need to look through all javascript files. We may also try to find the value of action parameter inside ___grecaptcha_cfg configuration object. Also we can call grecaptcha.execute and inspect javascript code. The API will use "verify" default value it if we won't provide action in our request.

**What is `min-score` in reCAPTCHA v3 API?**
The minimal score needed for the captcha resolution. We recommend using the 0.3 min-score value, scores highers than 0.3 are hard to get.

**What are the POST parameters for the reCAPTCHA v3 API?**

-   **`username`**: Your DBC account username
-   **`password`**: Your DBC account password
-   **`type`=5**: Type 5 specifies this is reCAPTCHA v3 API
-   **`token_params`**=json(payload): the data to access the recaptcha challenge
json payload structure:
    -   **`proxy`**: your proxy url and credentials (if any).Examples:
        -   <http://127.0.0.1:3128>
        -   <http://user:password@127.0.0.1:3128>

    -   **`proxytype`**: your proxy connection protocol. For supported proxy types refer to Which proxy types are supported?. Example:
        -   HTTP

    -   **`googlekey`**: the google recaptcha site key of the website with the recaptcha. For more details about the site key refer to What is a recaptcha site key?. Example:
        -   6Le-wvkSAAAAAPBMRTvw0Q4Muexq9bi0DJwx_mJ-

    -   **`pageurl`**: the url of the page with the recaptcha challenges. This url has to include the path in which the recaptcha is loaded. Example: if the recaptcha you want to solve is in <http://test.com/path1>, pageurl has to be <http://test.com/path1> and not <http://test.com>.

    -   **`action`**: The action name.

    -   **`min_score`**: The minimal score, usually 0.3

The **`proxy`** parameter is optional, but we strongly recommend to use one to prevent rejection by the provided page due to inconsistencies between the IP that solved the captcha (ours if no proxy is provided) and the IP that submitted the solution for verification (yours).
**Note**: If **`proxy`** is provided, **`proxytype`** is a required parameter.

Full example of **`token_params`**:
```json
{
  "proxy": "http://127.0.0.1:3128",
  "proxytype": "HTTP",
  "googlekey": "6Le-wvkSAAAAAPBMRTvw0Q4Muexq9bi0DJwx_mJ-",
  "pageurl": "http://test.com/path_with_recaptcha",
  "action": "example/action",
  "min_score": 0.3
}
```

**What's the response from reCAPTCHA v3 API?**
The response has the same structure as regular captcha. Refer to [Polling for uploaded CAPTCHA status](https://deathbycaptcha.com/api#polling-captcha) for details about the response. The solution will come in the **text** key of the response. It's valid for one use and has a 1 minute lifespan.

---

<a id="amazon-waf-api-type-16"></a>
### 🛡️ Amazon WAF API (Type 16)

Amazon WAF Captcha (also referred to as AWS WAF Captcha) is part of the Intelligent Threat Mitigation system within Amazon AWS. It presents image-alignment challenges that DBC solves by returning a token you set as the `aws-waf-token` cookie on the target page.

- **Official documentation:** [deathbycaptcha.com/api/amazonwaf](https://deathbycaptcha.com/api/amazonwaf)
- **Node.js sample:** [examples/example.Amazon_Waf.js](https://github.com/deathbycaptcha/deathbycaptcha-api-client-nodejs/blob/master/examples/example.Amazon_Waf.js)

**API URL:** Send a HTTP POST request to `http://api.dbcapi.me/api/captcha`

**POST parameters:**

-   **`username`**: Your DBC account username
-   **`password`**: Your DBC account password
-   **`type`=16**: Type 16 specifies this is the Amazon WAF API
-   **`waf_params`=json(payload)**: The data needed to access the Amazon WAF challenge

`waf_params` payload fields:

| Parameter | Required | Description |
|---|---|---|
| `proxy` | Optional\* | Proxy URL with credentials. E.g. `http://user:password@127.0.0.1:3128` |
| `proxytype` | Required if proxy set | Proxy protocol. Currently only `HTTP` is supported. |
| `sitekey` | Required | Amazon WAF site key found in the page's captcha script (value of the `key` parameter) |
| `pageurl` | Required | Full URL of the page showing the Amazon WAF challenge (must include the path) |
| `iv` | Required | Value of the `iv` parameter found in the captcha script on the page |
| `context` | Required | Value of the `context` parameter found in the captcha script on the page |
| `challengejs` | Optional | URL of the `challenge.js` script referenced on the page |
| `captchajs` | Optional | URL of the `captcha.js` script referenced on the page |

> The `proxy` parameter is optional but strongly recommended — using a proxy prevents token rejection caused by IP inconsistencies between the solving machine (DBC) and the submitting machine (yours).
> **📌 Note:** If `proxy` is provided, `proxytype` is required.

Full example of `waf_params`:

```json
{
  "proxy": "http://user:password@127.0.0.1:1234",
  "proxytype": "HTTP",
  "sitekey": "AQIDAHjcYu/GjX+QlghicBgQ/7bFaQZ+m5FKCMDnO+vTbNg96AHDh0IR5vgzHNceHYqZR+GO...",
  "pageurl": "https://efw47fpad9.execute-api.us-east-1.amazonaws.com/latest",
  "iv": "CgAFRjIw2vAAABSM",
  "context": "zPT0jOl1rQlUNaldX6LUpn4D6Tl9bJ8VUQ/NrWFxPii..."
}
```

**Response:** The API returns a token string valid for one use with a 1-minute lifespan. Once received, set it as the `aws-waf-token` cookie on the target page before submitting the form.

---

<a id="cloudflare-turnstile-api-type-12"></a>
### 🌐 Cloudflare Turnstile API (Type 12)

Cloudflare Turnstile is a CAPTCHA alternative that protects pages without requiring user interaction in most cases. DBC solves it by returning a token you inject into the target form or pass to the page's callback.

- **Official documentation:** [deathbycaptcha.com/api/turnstile](https://deathbycaptcha.com/api/turnstile)
- **Node.js sample:** [examples/example.Turnstile.js](https://github.com/deathbycaptcha/deathbycaptcha-api-client-nodejs/blob/master/examples/example.Turnstile.js)

**API URL:** Send a HTTP POST request to `http://api.dbcapi.me/api/captcha`

| POST Parameter | Description |
|---|---|
| `username` | Your DBC account username |
| `password` | Your DBC account password |
| `type` | `12` — specifies this is a Turnstile API request |
| `turnstile_params` | JSON-encoded payload (see fields below) |

**`turnstile_params` payload fields:**

| Field | Required | Description |
|---|---|---|
| `proxy` | Optional | Proxy URL with optional credentials. E.g. `http://user:password@127.0.0.1:3128` |
| `proxytype` | Required if `proxy` set | Proxy connection protocol. Currently only `HTTP` is supported. |
| `sitekey` | Required | The Turnstile site key found in `data-sitekey` attribute, the captcha iframe URL, or the `turnstile.render` call. E.g. `0x4AAAAAAAGlwMzq_9z6S9Mh` |
| `pageurl` | Required | Full URL of the page hosting the Turnstile challenge, including path. E.g. `https://testsite.com/xxx-test` |
| `action` | Optional | Value of the `data-action` attribute or the `action` option passed to `turnstile.render`. |

> **📌 Note:** The `proxy` parameter is optional but strongly recommended to avoid rejection due to IP inconsistency between the solver and the submitter. If `proxy` is provided, `proxytype` becomes required.

**Example `turnstile_params`:**

```json
{
    "proxy": "http://user:password@127.0.0.1:1234",
    "proxytype": "HTTP",
    "sitekey": "0x4AAAAAAAGlwMzq_9z6S9Mh",
    "pageurl": "https://testsite.com/xxx-test"
}
```

**Response:** The API returns a token string valid for one use with a 2-minute lifespan. Submit it via the `input[name="cf-turnstile-response"]` field or pass it to the callback defined in `turnstile.render` / `data-callback`.

---

## 🔬 Testing & CI

See [TESTING.md](TESTING.md) for setup instructions, how to run unit tests, coverage, integration tests, and CI configuration (GitLab & GitHub Actions).

### Tests results

| Workflow | Node | Status |
|---|:---:|---|
| Unit Tests | 20 | [![Unit Tests Node 20](https://github.com/deathbycaptcha/deathbycaptcha-api-client-nodejs/actions/workflows/unit-tests.yml/badge.svg)](https://github.com/deathbycaptcha/deathbycaptcha-api-client-nodejs/actions/workflows/unit-tests.yml) |
| Unit Tests | 22 | [![Unit Tests Node 22](https://github.com/deathbycaptcha/deathbycaptcha-api-client-nodejs/actions/workflows/unit-tests-node22.yml/badge.svg)](https://github.com/deathbycaptcha/deathbycaptcha-api-client-nodejs/actions/workflows/unit-tests-node22.yml) |
| Unit Tests | 24 | [![Unit Tests Node 24](https://github.com/deathbycaptcha/deathbycaptcha-api-client-nodejs/actions/workflows/unit-tests-node24.yml/badge.svg)](https://github.com/deathbycaptcha/deathbycaptcha-api-client-nodejs/actions/workflows/unit-tests-node24.yml) |
| API Integration | 24 | [![API Integration](https://github.com/deathbycaptcha/deathbycaptcha-api-client-nodejs/actions/workflows/api-integration.yml/badge.svg)](https://github.com/deathbycaptcha/deathbycaptcha-api-client-nodejs/actions/workflows/api-integration.yml) |
| Selenium Integration | 24 | [![Selenium Integration](https://github.com/deathbycaptcha/deathbycaptcha-api-client-nodejs/actions/workflows/selenium-integration.yml/badge.svg)](https://github.com/deathbycaptcha/deathbycaptcha-api-client-nodejs/actions/workflows/selenium-integration.yml) |
| API npm Integration | 24 | [![API npm Integration](https://github.com/deathbycaptcha/deathbycaptcha-api-client-nodejs/actions/workflows/api-npm-integration.yml/badge.svg)](https://github.com/deathbycaptcha/deathbycaptcha-api-client-nodejs/actions/workflows/api-npm-integration.yml) |
| Coverage | 22 | [![Coverage](https://img.shields.io/endpoint?url=https://deathbycaptcha.github.io/deathbycaptcha-api-client-nodejs/coverage-badge.json)](https://github.com/deathbycaptcha/deathbycaptcha-api-client-nodejs/actions/workflows/coverage.yml) |


## ⚖️ Responsible Use

See [Responsible Use Agreement](RESPONSIBLE_USE.md).
