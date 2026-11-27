/**
 * DeathByCaptcha commands.
 *
 * Every command is a thin wrapper over `cy.task`, so the solve happens
 * in Node through the official client. The token is the *subject* of
 * the command: it is never printed, never passed to `cy.log` and never
 * written into the command log.
 */

Cypress.Commands.add('dbcBalance', () => cy.task('dbcBalance'));

Cypress.Commands.add('dbcSolveImage', (imagePath, options = {}) =>
  cy.task('dbcSolveImage', { imagePath, ...options })
);

Cypress.Commands.add('dbcSolveRecaptchaV2', (sitekey, pageurl, options = {}) =>
  cy.task('dbcSolveRecaptchaV2', { sitekey, pageurl, ...options })
);

Cypress.Commands.add('dbcSolveRecaptchaV3', (sitekey, pageurl, options = {}) =>
  cy.task('dbcSolveRecaptchaV3', { sitekey, pageurl, ...options })
);

Cypress.Commands.add('dbcSolveTurnstile', (sitekey, pageurl, options = {}) =>
  cy.task('dbcSolveTurnstile', { sitekey, pageurl, ...options })
);
