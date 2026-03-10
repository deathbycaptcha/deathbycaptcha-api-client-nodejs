# Selenium + DeathByCaptcha (reCAPTCHA v2 token)

This folder contains an internal Selenium example for solving reCAPTCHA v2 token challenges with `deathbycaptcha-lib`.

## Prerequisites

- Node.js 18+
- Firefox installed
- `geckodriver` available in your PATH
- A valid DeathByCaptcha account

Install Selenium dependency:

```bash
npm install selenium-webdriver
```

## Run

Create integration environment file:

```bash
cp .env.sample .env
```

Set credentials as environment variables:

```bash
export DBC_USERNAME="your_username"
export DBC_PASSWORD="your_password"
```

Run the example:

```bash
node examples/selenium/recaptcha_v2_selenium.js
```

Run integration test:

```bash
npm run test:integration:selenium
```

The integration test reuses and executes the same sample runner from:

- [examples/selenium/recaptcha_v2_selenium.js](examples/selenium/recaptcha_v2_selenium.js)

## Notes

- This library API is callback-based; the example wraps callbacks into Promises so it can use `async/await`.
- If you install from npm in another project, use:

```js
const { HttpClient } = require('deathbycaptcha-lib');
```

- In this repository example we use a local import:

```js
const { HttpClient } = require('../../deathbycaptcha');
```
