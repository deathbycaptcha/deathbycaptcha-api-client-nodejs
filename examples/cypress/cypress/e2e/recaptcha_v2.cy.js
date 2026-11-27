/**
 * Solve Google's reCAPTCHA v2 demo with DeathByCaptcha and submit it.
 *
 * The page is the vendor's own demo, not a third party's production
 * site, and the sitekey is read from the page instead of being typed in.
 * The token is the subject of a command: it is never printed.
 */

const DEMO_URL = 'https://www.google.com/recaptcha/api2/demo';

function injectToken(win, token) {
  const textarea = win.document.getElementById('g-recaptcha-response');
  if (!textarea) {
    throw new Error('The page has no g-recaptcha-response field.');
  }

  textarea.style.display = 'block';
  textarea.value = token;
  textarea.innerHTML = token;
  textarea.dispatchEvent(new win.Event('input', { bubbles: true }));
  textarea.dispatchEvent(new win.Event('change', { bubbles: true }));

  // Hand the token to the widget's own callback when the page has one,
  // the same walk the Playwright and Puppeteer samples do.
  const cfg = win.___grecaptcha_cfg;
  if (!cfg || !cfg.clients) {
    return;
  }
  for (const clientKey of Object.keys(cfg.clients)) {
    const widget = cfg.clients[clientKey];
    for (const key of Object.keys(widget)) {
      const item = widget[key];
      if (item && typeof item.callback === 'function') {
        item.callback(token);
        return;
      }
      if (item && item.W && typeof item.W.callback === 'function') {
        item.W.callback(token);
        return;
      }
    }
  }
}

describe('reCAPTCHA v2 with DeathByCaptcha', () => {
  it('solves the demo challenge and submits the form', () => {
    cy.visit(DEMO_URL);

    cy.get('#recaptcha-demo')
      .invoke('attr', 'data-sitekey')
      .then((sitekey) => {
        cy.url().then((pageurl) => {
          cy.dbcSolveRecaptchaV2(sitekey, pageurl).then((token) => {
            cy.window().then((win) => injectToken(win, token));

            cy.get('#recaptcha-demo-submit').click();
            cy.get('.recaptcha-success', { timeout: 30000 }).should('be.visible');
          });
        });
      });
  });
});
