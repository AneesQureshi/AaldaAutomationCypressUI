// support/pages/CreateServicePage.js

class servicePage {
  selectors = {
    // Service Type
    inPersonRadio: '#In-Person',
    virtualRadio: '#Virtual',

    // Service Available For
    doctorRadio: '#service-provider',
    clinicRadio: '#service-clinic',

    // Text Inputs
    serviceNameInput: '#name',
    customDurationInput: '#custom_duration',
    descriptionTextarea: '#description',

    // Select dropdowns (Select2)
    categorySelect: '#category',
    clinicSelect: '#clinics',
    providerSelect: '#providers',
    excludeDaysSelect: '#exclude',
    durationSelect: '#duration',

    // Checkboxes and Switches
    statusCheckbox: '#service_status',
    availableOnlineCheckbox: '#is_available_online',

    // Buttons
    saveButton: '#add-form-create-service-btn',
  }

  selectServiceType(type) {
    if (type.toLowerCase() === 'in_person') {
      cy.get(this.selectors.inPersonRadio).check({ force: true })
    } else if (type.toLowerCase() === 'virtual') {
      cy.get(this.selectors.virtualRadio).check({ force: true })
    }
  }

  selectServiceFor(forWhom) {
    if (forWhom.toLowerCase() === 'doctor') {
      cy.get(this.selectors.doctorRadio).check({ force: true })
    } else if (forWhom.toLowerCase() === 'clinic') {
      cy.get(this.selectors.clinicRadio).check({ force: true })
    }
  }

  enterServiceName(name) {
    cy.get(this.selectors.serviceNameInput).clear().type(name)
  }

  selectCategory(categoryNames = []) {
    categoryNames.forEach(name => {
      cy.get(this.selectors.categorySelect).select(name, { force: true })
    })
  }

  selectClinics(clinicNames = []) {
    clinicNames.forEach(name => {
      cy.get(this.selectors.clinicSelect, { timeout: 5000 }).select(name, { force: true })
      cy.wait(5000)
    })
  }

  selectProviders(providerNames = []) {
    providerNames.forEach(name => {
      cy.get(this.selectors.providerSelect).select(name, { force: true })
    })
  }

  selectExcludeDays(days = []) {
    days.forEach(day => {
      cy.get(this.selectors.excludeDaysSelect).select(day, { force: true })
    })
  }

  selectDuration(duration) {
    cy.get(this.selectors.durationSelect).select(duration, { force: true })
  }

  enterCustomDuration(minutes) {
    cy.get(this.selectors.customDurationInput)
      .should('be.visible')
      .clear()
      .type(minutes)
  }

  toggleOnlineAvailability(shouldCheck = true) {
    if (shouldCheck) cy.get(this.selectors.availableOnlineCheckbox).check({ force: true })
    else cy.get(this.selectors.availableOnlineCheckbox).uncheck({ force: true })
  }

  enterDescription(desc) {
    cy.get(this.selectors.descriptionTextarea).clear().type(desc)
  }

  toggleStatus(active = true) {
    cy.get(this.selectors.statusCheckbox).then($checkbox => {
      if (active && !$checkbox.is(':checked')) cy.wrap($checkbox).check({ force: true })
      else if (!active && $checkbox.is(':checked')) cy.wrap($checkbox).uncheck({ force: true })
    })
  }

  clickSave() {
    cy.get(this.selectors.saveButton).click({ force: true })
  }

  // Main reusable workflow
  createService({
    type = 'in_person',
    forWhom = 'doctor',
    name,
    categories = [],
    clinics = [],
    providers = [],
    excludeDays = [],
    duration = '30',
    customDuration = '',
    online = false,
    description = '',
    active = true,
  }) {
    this.selectServiceType(type)
    this.selectServiceFor(forWhom)
    this.enterServiceName(name)
    this.selectCategory(categories)
    this.selectClinics(clinics)
    this.selectProviders(providers)
    this.selectExcludeDays(excludeDays)
    this.selectDuration(duration)
    if (duration === 'custom' && customDuration) this.enterCustomDuration(customDuration)
    this.toggleOnlineAvailability(online)
    if (online) this.enterDescription(description)
    this.toggleStatus(active)
    this.clickSave()
  }
}

export default servicePage
