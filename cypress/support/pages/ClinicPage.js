// support/pages/Clinic.js
class Clinic {
  selectors = {
    settingsAction: '#settings-modal-action',
    clinicsListItem: '#clinics-list-item',
    addClinicBtn: '#settings-clinic-add-clinics',
    clinicName: '#clinic_name',
    onlineStatus: '#is_available_online',
    anicomCode: '#anicom_code',
    ipetCode: '#ipet_code',
    reportLang: "select[name='default_report_lang']",
    pincode: '#pincode',
    countrySelect: '#country',
    stateInput: '#state',
    cityInput: '#city',
    addressInput: '#address',
    countryFlagArrow: '.iti__selected-flag .iti__arrow',
    countryListbox: '#iti-1__country-listbox',
    countryListItemIN: '.iti__country[data-country-code="in"]',
    countryCodeInput: '#countryCode',
    phoneInput: '#phone_no',
    companyInput: '#company',
    businessLinkInput: '#business_link',
    mondayStatus: '#MondayStatus',
    mondayFrom: '#Monday_from',
    mondayTo: '#Monday_to',
    copyTimeAll: '.copy-time-all-days.monday-row-element',
    submitBtn: '.submit-clinic-btn',
    toastMessage: '#toast-container .toast-message'
  }

  openSettings(timeout = 10000) {
    cy.get(this.selectors.settingsAction, { timeout }).should('be.visible').click()
    cy.get(this.selectors.clinicsListItem, { timeout }).should('be.visible').click()
    cy.get(this.selectors.addClinicBtn, { timeout: timeout + 5000 }).should('exist')
    return this
  }

  addClinic(timeout = 10000) {
    cy.get(this.selectors.addClinicBtn, { timeout }).should('be.visible').click()
    cy.get(this.selectors.clinicName, { timeout: timeout + 5000 }).should('be.visible')
    return this
  }

  fillClinicForm(clinic) {
    cy.get(this.selectors.clinicName).clear().type(clinic.name)
    cy.get(this.selectors.onlineStatus).select(clinic.onlineStatus)
    cy.get(this.selectors.anicomCode).clear().type(clinic.anicomCode)
    cy.get(this.selectors.ipetCode).clear().type(clinic.ipetCode)
    cy.get(this.selectors.reportLang).select(clinic.reportLang)
    cy.get(this.selectors.pincode).clear().type(clinic.pincode)
    cy.get(this.selectors.countrySelect).select(clinic.country)
    cy.get(this.selectors.stateInput).clear().type(clinic.state)
    cy.get(this.selectors.cityInput).clear().type(clinic.city)
    cy.get(this.selectors.addressInput).clear().type(clinic.address)

    // Country code picker
    cy.get(this.selectors.countryFlagArrow).first().click()
    cy.get(this.selectors.countryListbox).should('be.visible')
    cy.get(this.selectors.countryListbox)
      .find(this.selectors.countryListItemIN)
      .first()
      .click({ force: true })
    cy.get(this.selectors.countryCodeInput).should('have.value', '+91')

    cy.get(this.selectors.phoneInput).clear().type(clinic.phone)
    cy.get(this.selectors.companyInput).clear().type(clinic.company)
    cy.get(this.selectors.businessLinkInput).clear().type(clinic.businessLink)

    // Monday schedule
    cy.get(this.selectors.mondayStatus).check().should('be.checked')
    cy.setTime(this.selectors.mondayFrom, clinic.mondayFrom)
    cy.setTime(this.selectors.mondayTo, clinic.mondayTo)
    cy.get(this.selectors.copyTimeAll).click()

    return this
  }

  submitClinic() {
    cy.get(this.selectors.submitBtn).should('be.enabled').click()
    return this
  }

  createClinic(clinic = null, overrides = {}) {
    const prepareAndSubmit = (data) => {
      const random = Math.floor(100000 + Math.random() * 900000)
      data.name = data.name ?? `Clinic ${random}`
      data.anicomCode = data.anicomCode ?? `anicomCode${random}`
      data.ipetCode = data.ipetCode ?? `iPetCode${random}`
      data.phone = data.phone ?? `9718${String(random).slice(0,6)}`

      this.openSettings()
        .addClinic()
        .fillClinicForm(data)
        .submitClinic()

      return cy.contains(this.selectors.toastMessage, /clinic/i, { timeout: 15000 }).should('be.visible')
    }

    if (clinic && Object.keys(clinic).length) {
      return prepareAndSubmit(Object.assign({}, clinic))
    }

    return cy.fixture('clinic.json').then((fixture) => {
      const data = Object.assign({}, fixture, overrides)
      return prepareAndSubmit(data)
    })
  }
}

export default new Clinic()
