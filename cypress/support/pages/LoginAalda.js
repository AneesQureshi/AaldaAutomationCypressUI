class Login {
  visit() {
    cy.visit('https://uatcash2.vet360.jp/login');
  }

  login(email, password) {
    cy.get('#email').clear().type(email);
    cy.get('#password').clear().type(password);
    cy.get('#login-form-btn').click();
  }

  selectLanguage(lang) {
    cy.get('li.dropdown > a.nav-link.dropdown-toggle')
      .filter(':visible')
      .first()
      .click();
    cy.contains('.dropdown-menu a.dropdown-item', lang)
      .click({ force: true });
  }

  loginWithCredentials(email, password, language) {
    this.visit();
    this.login(email, password);
    cy.url().should('include', '/queues');
    cy.wait(2000)
    this.selectLanguage(language);
  }
}

export default Login;
