// cypress/support/commands.js
console.log('👉 support/commands.js loaded');



// Defensive guard so a runtime error doesn't abort registration
try {
  // simple smoke command
  Cypress.Commands.add('checkcustomcommand', () => {
    cy.log('✅ checkcustomcommand registered');
  });


  Cypress.Commands.add('setTime', (selector, time12h) => {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (modifier.toLowerCase() === 'pm' && hours < 12) hours += 12;
    if (modifier.toLowerCase() === 'am' && hours === 12) hours = 0;
    const formatted = `${hours.toString().padStart(2,'0')}:${minutes.toString().padStart(2,'0')}`;
    cy.get(selector).invoke('val', formatted).trigger('input').trigger('change');
  });

  console.log('👉 commands registered OK');

} catch (err) {
  // show error so you can fix the underlying import/runtime issue
  console.error('👉 commands.js failed to load', err);
}

import Login from './pages/LoginAalda'  // adjust path if needed

Cypress.Commands.add('loginFromFixture', () => {
  cy.fixture('credentials').then((creds) => {
    const login = new Login()
    login.loginWithCredentials(creds.email, creds.password, creds.language)
    cy.url().should('include', '/queues')
  })
})
