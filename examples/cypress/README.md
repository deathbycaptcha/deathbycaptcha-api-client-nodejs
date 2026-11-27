# Cypress example

Solve CAPTCHAs in a Cypress test through DeathByCaptcha. The solve runs in
**Node** — Cypress tasks always do — so the official client loads there,
the credentials never reach the browser, and a solved token is returned
to the test instead of printed, which keeps it out of the command log
and out of a CI job's output.

It is an example to copy, not a published plugin: nothing here is
installed by Cypress.

## Files

| File | What it is |
| --- | --- |
| `deathbycaptcha.tasks.js` | the tasks: `dbcBalance`, `dbcSolveImage`, `dbcSolveRecaptchaV2`, `dbcSolveRecaptchaV3`, `dbcSolveTurnstile` |
| `cypress.config.js` | sample project that registers them |
| `cypress/support/commands.js` | the `cy.dbc*` commands |
| `cypress/support/e2e.js` | loads the commands |
| `cypress/e2e/recaptcha_v2.cy.js` | a spec that solves Google's reCAPTCHA demo and submits it |

## Setup

```bash
npm install            # in the client repository, brings Cypress
export DBC_USERNAME=your_username
export DBC_PASSWORD=your_password
# or: export DBC_AUTHTOKEN=your_authtoken
```

To use it in your own project, copy `deathbycaptcha.tasks.js`,
`cypress/support/commands.js` and the lines below into your config:

```js
const { defineConfig } = require('cypress');
const { createDbcTasks } = require('./deathbycaptcha.tasks');

module.exports = defineConfig({
  e2e: {
    supportFile: 'cypress/support/e2e.js',
    setupNodeEvents(on) {
      on('task', createDbcTasks());
    },
  },
});
```

## Commands

| Command | DeathByCaptcha type | Returns |
| --- | --- | --- |
| `cy.dbcSolveRecaptchaV2(sitekey, pageurl)` | 4 | the token |
| `cy.dbcSolveRecaptchaV3(sitekey, pageurl, { action, minScore })` | 5 | the token |
| `cy.dbcSolveTurnstile(sitekey, pageurl)` | 12 | the token |
| `cy.dbcSolveImage(imagePath)` | 0 | the text to type |
| `cy.dbcBalance()` | — | balance in US cents |

`sitekey` and `pageurl` have to be the ones of the page under test: the
service answers a token for the pair it is given, and the site rejects it
for any other. An optional `timeout` in seconds is accepted as the third
argument; an empty value keeps the client's own default.

## Run

```bash
npx cypress run                       # the whole example project
npx cypress run --spec cypress/e2e/recaptcha_v2.cy.js
npm run test:integration:cypress      # from the repository, via its test
```

## What the spec does

1. Visits [Google's reCAPTCHA demo](https://www.google.com/recaptcha/api2/demo)
   — the vendor's own page, not a third party's production site.
2. Reads the `data-sitekey` from the page instead of typing it in.
3. `cy.dbcSolveRecaptchaV2(sitekey, pageurl)` asks for a token.
4. Writes it into `#g-recaptcha-response` and calls the widget's callback.
5. Submits and asserts `.recaptcha-success`.

The same steps are in the Playwright and Puppeteer samples, so a team can
compare the three before picking one.

## Limits

- **QA on your own pages.** These tests are for flows you are allowed to
  automate — staging, a demo, a page you own. See `RESPONSIBLE_USE.md`.
- **Turnstile tokens are bound to the exit IP.** The task runs on the
  machine running Cypress, so the solve and the request the token is
  pasted into leave from the same machine.
- **reCAPTCHA v3** needs the `action` and the `min_score` the site
  expects; a mismatch is a token the site rejects.
- **No token in the logs.** The tasks return their value and never
  print it, and the spec does not call `cy.log` with it. Keep it that way
  when you extend them.
- An image task needs a file on disk: take the screenshot in the test
  with `cy.screenshot()` or `cy.readFile`, then pass the path.

## Tests

```bash
npm run test:unit                                    # includes the task tests, no network
DBC_USERNAME=... DBC_PASSWORD=... npm run test:integration:cypress
```

The integration test runs the real spec against the live API and skips
itself when the credentials are not in the environment.
