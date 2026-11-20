# Puppeteer reCAPTCHA v2 sample

Solves Google's reCAPTCHA v2 demo with Puppeteer and DeathByCaptcha.

The sample extracts the `data-sitekey`, requests a `type=4` token, injects
it into `g-recaptcha-response`, calls the widget callback when it exists,
and submits the form. The token is never printed.

## Requirements

- Node.js 20 or newer
- A DeathByCaptcha account
- Chrome for Puppeteer (`npm install` downloads it; or set `CHROME_BIN`)

## Setup

From the repository root:

```bash
npm install
cp .env.sample .env
# edit .env with DBC_USERNAME and DBC_PASSWORD
```

## Run

```bash
node examples/puppeteer/recaptcha_v2_puppeteer.js
```

Headless is the default. To watch the browser:

```bash
DBC_PUPPETEER_HEADLESS=false node examples/puppeteer/recaptcha_v2_puppeteer.js
```

If Chrome is not the one Puppeteer downloaded, point to it:

```bash
CHROME_BIN=/path/to/chrome node examples/puppeteer/recaptcha_v2_puppeteer.js
```

## Notes

- `DBC_USERNAME` and `DBC_PASSWORD` are the only credentials the sample
  reads. Nothing is written to the repository.
- Token types other than reCAPTCHA v2 (Turnstile, WAF, v3) follow the
  same `decode` call with their own `*_params` and injection step; see the
  per-type examples in `examples/`.
- For IP-bound tokens, pass the same proxy to the browser and to the
  service, or the token will not be accepted by the target site.
