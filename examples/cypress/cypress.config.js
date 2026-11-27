const { defineConfig } = require('cypress');
const { createDbcTasks } = require('./deathbycaptcha.tasks');

// Sample Cypress project for DeathByCaptcha. Copy the pieces you need
// into your own project: this file, `deathbycaptcha.tasks.js`, the two
// files under `cypress/support/` and the spec you want to start from.
module.exports = defineConfig({
  e2e: {
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: 'cypress/support/e2e.js',
    setupNodeEvents(on) {
      on('task', createDbcTasks());
    },
  },
});
