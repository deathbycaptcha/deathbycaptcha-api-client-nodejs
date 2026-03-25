# Testing & CI

## 🗂️ Index

- [Testing](#testing)
    - [Setup test environment](#setup-test-environment)
    - [Run unit tests](#run-unit-tests)
    - [Run unit coverage](#run-unit-coverage)
    - [Run API basic integration test](#run-api-basic-integration-test)
    - [Run Selenium integration test](#run-selenium-integration-test)
    - [Run full integration suite](#run-full-integration-suite)
- [CI](#ci)
    - [GitLab unit test matrix](#gitlab-unit-test-matrix)
    - [GitHub Actions](#github-actions)

---

<a id="testing"></a>
## 🔬 Testing

<a id="setup-test-environment"></a>
### Setup test environment

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from sample:

```bash
cp .env.sample .env
```

3. Set valid credentials in `.env`:

```bash
DBC_USERNAME=your_dbc_username
DBC_PASSWORD=your_dbc_password
```

4. Ensure browser + driver are available (`firefox` + `geckodriver` by default).

<a id="run-unit-tests"></a>
### Run unit tests

```bash
npm run test:unit
```

<a id="run-unit-coverage"></a>
### Run unit coverage

```bash
npm run test:coverage
```

<a id="run-api-basic-integration-test"></a>
### Run API basic integration test

```bash
npm run test:integration:api
```

This test validates:

- server/user check (`get_user`)
- balance (`get_balance`)
- upload text captcha (`type=0`) using `images/normal.jpg`
- decode response contains text
- report call returns boolean

Test file:

- [tests/integration/api.basic.integration.test.js](tests/integration/api.basic.integration.test.js)

<a id="run-selenium-integration-test"></a>
### Run Selenium integration test

```bash
npm run test:integration:selenium
```

The test file is:

- [tests/integration/selenium.integration.test.js](tests/integration/selenium.integration.test.js)

<a id="run-full-integration-suite"></a>
### Run full integration suite

```bash
npm run test:integration
```

---

<a id="ci"></a>
## CI

<a id="gitlab-unit-test-matrix"></a>
### GitLab unit test matrix

GitLab CI is configured in:

- [.gitlab-ci.yml](.gitlab-ci.yml)

The pipeline runs unit tests on Node.js versions:

- 20
- 22
- 24

Each matrix job runs:

```bash
npm install
npm run test:coverage
```

Coverage is visible in the GitLab job output and the `coverage/` folder is uploaded as a job artifact.

GitLab also runs the basic API integration test on Node.js 24.

For credentials, the integration job tries these options in order:

1. local `.env` file in the workspace
2. `DBC_ENV_FILE` GitLab variable (File type recommended)
3. `DBC_ENV` GitLab variable with full `.env` contents

This avoids declaring multiple separate username/password variables in GitLab.

### Run with gitlab-ci-local

For local `gitlab-ci-local` runs, the easiest option is a local-only variables file:

1. Copy [.gitlab-ci-local-variables.example.yml](.gitlab-ci-local-variables.example.yml) to `.gitlab-ci-local-variables.yml`
2. Fill your real credentials there
3. Run:

```bash
gitlab-ci-local --file ./.gitlab-ci.yml
```

`gitlab-ci-local` loads `.gitlab-ci-local-variables.yml` automatically, and the pipeline will pass `DBC_ENV` into the integration job without requiring committed `.env` credentials.

<a id="github-actions"></a>
### GitHub Actions

GitHub Actions is configured in:

- [.github/workflows/unit-tests.yml](.github/workflows/unit-tests.yml)
- [.github/workflows/unit-tests-node22.yml](.github/workflows/unit-tests-node22.yml)
- [.github/workflows/unit-tests-node24.yml](.github/workflows/unit-tests-node24.yml)
- [.github/workflows/coverage.yml](.github/workflows/coverage.yml)
- [.github/workflows/api-integration.yml](.github/workflows/api-integration.yml)

#### Unit Tests workflow

- Runs as separate workflows for Node.js 20, 22 and 24
- Each executes:

```bash
npm install
npm run test:unit
```

- Uses only native GitHub Actions
- Exposes native workflow badges per Node.js version

#### Coverage workflow

- Runs on Node.js 22
- Executes:

```bash
npm install
npm run test:coverage
```

- Uses only native GitHub Actions
- Uploads the `coverage/` folder as an artifact
- Exposes a separate native coverage badge

#### API Integration workflow

- Runs the basic API integration test on Node.js 24
- Executes:

```bash
npm install
npm run test:integration:api
```

- Uses GitHub secrets:
    - `DBC_USERNAME`
    - `DBC_PASSWORD`
- Optional runtime env in workflow:
    - `MOZ_HEADLESS=1`
- No committed `.env` file is required in GitHub Actions

- If either secret is missing, the workflow skips the integration test without failing the pipeline
- Exposes a native GitHub Actions workflow badge

---

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
