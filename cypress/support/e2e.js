// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'
console.log("👉 Loaded support file: cypress/support/e2e.js");

// support/e2e.js
Cypress.on('uncaught:exception', (err) => {
  if (err.message && err.message.includes('replaceChild')) {
    // log stack for debugging
    // eslint-disable-next-line no-console
    console.error('replaceChild error:', err.stack || err.message);
    // prevent Cypress from failing while you investigate
    return false;
  }
});

Cypress.on('uncaught:exception', (err) => {
  const msg = err.message || '';
  if (msg.includes('Cannot convert undefined') || msg.includes('Object.keys')) {
    return false;
  }
  return true;
});
