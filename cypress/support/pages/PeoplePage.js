class PeoplePage {
  selectors = {
    // Navigation
    settingsAction: '#settings-modal-action',
    peopleRolesItem: '#people-roles-list-item',
    createUser: '#add_user_event_setting',

    // Clinic Info
    profileImage: '#cropzee-input',
    role: '#role_id',
    clinicBox: '.select2-selection--multiple',
    clinicSearch: '.select2-search__field',
    clinicOption: '.select2-results__option',
    defaultClinic: '#default_clinic',

    // User Info
    lastName: '#lastname',
    firstName: '#firstname',
    kanaLastName: '#kana_lastname',
    kanaFirstName: '#kana_firstname',
    email: '#email',
    password: '#password',
    phone: '#phoneNumber',

    // Actions
    saveBtn: '#submit-add-user'
  }

  open() {
    cy.get(this.selectors.settingsAction, { timeout: 5000 })
      .filter(':visible').first().click()

    cy.get(this.selectors.peopleRolesItem, { timeout: 5000 })
      .filter(':visible').first().click()

    cy.get(this.selectors.createUser, { timeout: 5000 })
      .should('be.visible').click()

    return this
  }

  uploadProfileImage(path) {
    cy.get(this.selectors.profileImage).selectFile(path, { force: true })
  }

  selectRole(role) {
    cy.get(this.selectors.role).select(role)
  }

  selectClinics(clinics = []) {
    clinics.forEach(name => {
      cy.get(this.selectors.clinicBox).first().click({ force: true })
      cy.get(this.selectors.clinicSearch).should('be.visible').first().type(name)
      cy.contains(this.selectors.clinicOption, name, { matchCase: false }).click({ force: true })
    })
  }

  selectDefaultClinic(name) {
    cy.get(this.selectors.defaultClinic).select(name)
  }

  enterUserInfo({ lastName, firstName, kanaLastName, kanaFirstName, email, password, phone }) {
    if (lastName) cy.get(this.selectors.lastName).clear().type(lastName)
    if (firstName) cy.get(this.selectors.firstName).clear().type(firstName)
    if (kanaLastName) cy.get(this.selectors.kanaLastName).clear().type(kanaLastName)
    if (kanaFirstName) cy.get(this.selectors.kanaFirstName).clear().type(kanaFirstName)
    if (email) cy.get(this.selectors.email).clear().type(email)
    if (password) cy.get(this.selectors.password).clear().type(password)
    if (phone) cy.get(this.selectors.phone).clear().type(phone)
  }

  save() {
    cy.get(this.selectors.saveBtn).click({ force: true })
  }

  fill({ profileImage, role, clinics, defaultClinic, userInfo }) {
    // if (profileImage) this.uploadProfileImage(profileImage)
    if (role) this.selectRole(role)
    if (clinics) this.selectClinics(clinics)
    if (defaultClinic) this.selectDefaultClinic(defaultClinic)
    if (userInfo) this.enterUserInfo(userInfo)
  }
}

export default new PeoplePage()
