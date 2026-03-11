# Changelog

## 4.7.1 - 2026-03-11

### Added
- Package publish setup under npm name `deathbycaptcha-lib`.
- `exports` and publish `files` configuration to ship only the library entrypoint and docs/license.
- Selenium sample folder and internal docs:
  - `examples/selenium/README.md`
  - `examples/selenium/recaptcha_v2_selenium.js`
- Integration tests:
  - `tests/integration/selenium.integration.test.js`
  - `tests/integration/api.basic.integration.test.js`
- Unit test suite for core client, HTTP client and socket client:
  - `tests/unit/client.core.test.js`
  - `tests/unit/httpclient.test.js`
  - `tests/unit/socketclient.test.js`
- Coverage enforcement in Jest (global thresholds >= 70% for lines/statements/functions).
- GitLab CI pipeline:
  - Unit/coverage matrix in Node.js 20, 22 and 24.
  - Basic API integration job with `.env`/`DBC_ENV` support.
- GitHub Actions workflows:
  - Unit tests + coverage matrix for Node.js 20, 22 and 24.
  - API integration workflow using single secret `DBC_ENV`.
- Native GitHub Actions badges in main README.
- Local `gitlab-ci-local` variables template:
  - `.gitlab-ci-local-variables.example.yml`

### Changed
- Package version bumped to `4.7.1`.
- Client API version string bumped to `DBC/NodeJS v4.7`.
- Main and examples imports updated to consume package name `deathbycaptcha-lib`.
- Repository structure clarified so sample scripts live under `examples/`.
- Main README improved with:
  - richer index/sub-index
  - installation from npm and GitHub
  - testing and CI sections
  - Selenium quick-start links
- `.env` setup simplified so integration tests require only:
  - `DBC_USERNAME`
  - `DBC_PASSWORD`
- Jest config updated to ignore `.gitlab-ci-local` duplicated build paths during local runs.

### Security / Transport
- `HttpClient` now uses HTTPS by default (`https:`) for API calls.

### Notes
- No external coverage service (e.g., Codecov) is required.
- No bot commits are used for badges; all badges are native workflow badges.
