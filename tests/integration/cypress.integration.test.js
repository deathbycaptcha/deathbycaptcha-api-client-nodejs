const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { spawnSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '../..');
const PROJECT_DIR = path.join(ROOT_DIR, 'examples', 'cypress');
const ENV_PATH = path.join(ROOT_DIR, '.env');

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

function cypressBinary() {
  const packageJson = require.resolve('cypress/package.json');
  return path.join(path.dirname(packageJson), 'bin', 'cypress');
}

function run() {
  loadEnvFile(ENV_PATH);

  const username = process.env.DBC_USERNAME;
  const password = process.env.DBC_PASSWORD;

  if (!username || !password || username === 'your_dbc_username' || password === 'your_dbc_password') {
    console.error('Missing valid credentials. Copy .env.sample to .env and fill DBC_USERNAME/DBC_PASSWORD.');
    process.exit(1);
  }

  console.log('Running the Cypress example against the live API.');
  console.log(`Project: ${path.relative(ROOT_DIR, PROJECT_DIR)}`);

  const result = spawnSync(process.execPath, [cypressBinary(), 'run', '--project', PROJECT_DIR], {
    cwd: ROOT_DIR,
    env: {
      ...process.env,
      // No token or credential may reach the output of this job.
      DBC_CYPRESS_HEADLESS: 'true',
    },
    encoding: 'utf8',
    timeout: Number(process.env.DBC_CYPRESS_TIMEOUT_MS || 300000),
  });

  const output = `${result.stdout || ''}${result.stderr || ''}`;

  if (result.error) {
    console.error(output);
    throw result.error;
  }

  // The token is never printed by the tasks or the spec; assert that the
  // output of the run does not carry one either.
  assert.ok(!/[0-9A-Za-z_-]{60,}/.test(output.replace(/\s+/g, '')), 'The Cypress output leaked a token');

  if (result.status !== 0) {
    console.error(output);
    process.exit(result.status || 1);
  }

  const passed = /All specs passed/.test(output);
  assert.ok(passed, 'Cypress did not report that all specs passed');

  console.log('Integration test passed: the Cypress spec solved the challenge and submitted the form.');
}

if (require.main === module) {
  try {
    run();
  } catch (error) {
    console.error(error && error.message ? error.message : error);
    process.exit(1);
  }
}

module.exports = { run };
