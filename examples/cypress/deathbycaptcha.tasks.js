'use strict';

/**
 * Cypress tasks for DeathByCaptcha.
 *
 * Cypress runs tasks in Node, not in the browser, so this is where the
 * official client is loaded: the credentials never reach the browser and
 * a solved token is *returned* to the test instead of printed, so it
 * never lands in the command log or in the output of a CI job.
 *
 * Copy this file next to your `cypress.config.js` and register it:
 *
 *     const { defineConfig } = require('cypress');
 *     const { createDbcTasks } = require('./deathbycaptcha.tasks');
 *
 *     module.exports = defineConfig({
 *       e2e: {
 *         setupNodeEvents(on) {
 *           on('task', createDbcTasks());
 *         },
 *       },
 *     });
 *
 * Credentials come from the environment of the machine that runs
 * `cypress run` or `cypress open`: `DBC_AUTHTOKEN`, or `DBC_USERNAME`
 * and `DBC_PASSWORD`.
 */

function loadClient() {
  try {
    return require('deathbycaptcha-lib');
  } catch (error) {
    // Running from the repository, without the package installed.
    return require('../../deathbycaptcha');
  }
}

function createDbcTasks(options = {}) {
  const {
    username = process.env.DBC_USERNAME,
    password = process.env.DBC_PASSWORD,
    authtoken = process.env.DBC_AUTHTOKEN,
    timeout = 0,
    client: injectedClient,
  } = options;

  function makeClient() {
    if (injectedClient) {
      return injectedClient;
    }
    const { HttpClient } = loadClient();
    if (authtoken) {
      return new HttpClient('authtoken', authtoken);
    }
    if (username && password) {
      return new HttpClient(username, password);
    }
    throw new Error(
      'Set DBC_AUTHTOKEN or DBC_USERNAME and DBC_PASSWORD before running the tests.'
    );
  }

  function decode(captcha, taskTimeout) {
    return new Promise((resolve, reject) => {
      let client;
      try {
        client = makeClient();
      } catch (error) {
        reject(error);
        return;
      }

      const payload = {
        captcha: captcha.captcha || null,
        extra: captcha.extra || {},
      };
      const seconds = Number(taskTimeout || timeout || 0);
      if (seconds > 0) {
        payload.timeout = seconds;
      }

      try {
        client.decode(payload, (solution) => {
          if (!solution || !solution.text) {
            // No token in the message: a failed run must not print one.
            reject(new Error(
              'DeathByCaptcha returned no solution. Check the balance and the type parameters, then run the test again.'
            ));
            return;
          }
          resolve(solution);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  function requirePageArg(value, name) {
    const text = String(value || '').trim();
    if (!text) {
      throw new Error(`DeathByCaptcha: ${name} is required.`);
    }
    return text;
  }

  return {
    /** Account balance in US cents, the number the client returns. */
    async dbcBalance() {
      return new Promise((resolve, reject) => {
        let client;
        try {
          client = makeClient();
        } catch (error) {
          reject(error);
          return;
        }
        try {
          client.get_balance((balance) => {
            if (balance === null || balance === undefined) {
              reject(new Error('DeathByCaptcha did not return a balance. Check the credentials.'));
              return;
            }
            resolve(balance);
          });
        } catch (error) {
          reject(error);
        }
      });
    },

    /**
     * Image CAPTCHA (type 0) from a file on disk, usually a screenshot
     * taken by the test itself. Returns the text to type into the field.
     */
    async dbcSolveImage({ imagePath, timeout: taskTimeout } = {}) {
      const file = requirePageArg(imagePath, 'imagePath');
      return decode({ captcha: file }, taskTimeout).then((solution) => solution.text);
    },

    /** reCAPTCHA v2 (type 4). Returns the token. */
    async dbcSolveRecaptchaV2({ sitekey, pageurl, timeout: taskTimeout } = {}) {
      const key = requirePageArg(sitekey, 'sitekey');
      const page = requirePageArg(pageurl, 'pageurl');
      return decode({
        extra: {
          type: 4,
          token_params: JSON.stringify({ googlekey: key, pageurl: page }),
        },
      }, taskTimeout).then((solution) => solution.text);
    },

    /**
     * reCAPTCHA v3 (type 5). Returns the token. `action` and `minScore`
     * are optional and must match what the site expects, or the site
     * rejects the token.
     */
    async dbcSolveRecaptchaV3({
      sitekey, pageurl, action, minScore, timeout: taskTimeout,
    } = {}) {
      const key = requirePageArg(sitekey, 'sitekey');
      const page = requirePageArg(pageurl, 'pageurl');
      const fields = { googlekey: key, pageurl: page };
      if (action) {
        fields.action = String(action);
      }
      if (Number(minScore) > 0) {
        fields.min_score = Number(minScore);
      }
      return decode({
        extra: { type: 5, token_params: JSON.stringify(fields) },
      }, taskTimeout).then((solution) => solution.text);
    },

    /**
     * Cloudflare Turnstile (type 12). Returns the token. It is valid
     * only from the exit IP that solved it, so the machine running the
     * test has to be the one that sends the request it is pasted into.
     */
    async dbcSolveTurnstile({ sitekey, pageurl, timeout: taskTimeout } = {}) {
      const key = requirePageArg(sitekey, 'sitekey');
      const page = requirePageArg(pageurl, 'pageurl');
      return decode({
        extra: {
          type: 12,
          turnstile_params: JSON.stringify({ sitekey: key, pageurl: page }),
        },
      }, taskTimeout).then((solution) => solution.text);
    },
  };
}

module.exports = { createDbcTasks, loadClient };
