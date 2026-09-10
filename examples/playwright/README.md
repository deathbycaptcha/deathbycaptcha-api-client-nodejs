# Playwright reCAPTCHA v2 Example

This example demonstrates how to use Playwright with DeathByCaptcha to solve reCAPTCHA v2 challenges.

## Prerequisites

1. Install dependencies:
   ```bash
   npm install
   npx playwright install --with-deps chromium
   ```

2. Set up your credentials:
   ```bash
   cp .env.sample .env
   # Edit .env and add your DeathByCaptcha credentials
   ```

## Running the Example

```bash
node examples/playwright/recaptcha_v2_playwright.js
```

Or using npm script:

```bash
npm run test:integration:playwright
```

## Environment Variables

- `DBC_USERNAME` - Your DeathByCaptcha username
- `DBC_PASSWORD` - Your DeathByCaptcha password
- `DBC_PLAYWRIGHT_HEADLESS` - Run in headless mode (default: true)
- `DBC_TEST_CAPTCHA_URL` - URL of the reCAPTCHA demo page
- `DBC_PLAYWRIGHT_TIMEOUT_MS` - Timeout in milliseconds (default: 15000)

## How It Works

1. Launches a Chromium browser using Playwright
2. Navigates to the reCAPTCHA demo page
3. Extracts the sitekey from the page
4. Requests a token from DeathByCaptcha API
5. Injects the token into the page
6. Submits the form and verifies success
