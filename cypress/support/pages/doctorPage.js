// support/pages/DoctorPage.js

class DoctorPage {
  selectors = {
    // top controls
    searchInput: '#setting-doctor-search-query',
    searchBtn: '#search-doctor-settings-btn',
    clinicFilter: '#doc_clinic_filter',

    // table
    doctorTable: 'table.doctors-table',
    doctorRow: 'tr.doctor-table-body',
    actionsButton: '.datatable-actions-button',
    viewDoctorSvg: 'svg#view-doctor',
    selectClinicSvg: 'svg#select-clinic',

    // clinic modal & Select2
    clinicModal: '#userAvailableClinic',
    availableClinicsSelect: '#available_at_clinics',
    select2ResultsOption: '.select2-results__option',
    updateClinicBtn: '#updateClinicAvailability',
    modalCloseBtn: '.cancelBtnDoctorModal',

    // schedule modal/form
    scheduleForm: '#add_schedule_form',
    scheduleTypeSelect: '#type',
    visitDateInput: '#visit_date',
    tillDateInput: '#till_date',
    dayWrapper: '#day_wrapper',
    addTimeBtn: '.addRemoveIcon#action-add-time',
    saveScheduleBtn: '#save_schedule_btn',

    // toolbar trigger
    addAvailabilityBtn: 'button.fc-myCustomButton-button',

    dateInput :'[name="visit_date"]'
  }

  visit() {
    cy.visit('/doctor/list')
  }

  search(query) {
    cy.get(this.selectors.searchInput).clear().type(query)
    cy.get(this.selectors.searchBtn).click()
  }

  filterByClinic(clinicNameOrValue) {
    cy.get(this.selectors.clinicFilter).select(clinicNameOrValue, { force: true })
  }

  getDoctorRowByName(name) {
    return cy.get(this.selectors.doctorTable)
      .find(this.selectors.doctorRow)
      .filter(`:contains("${name}")`)
      .first()
  }

  openActionsForDoctor(name) {
    this.getDoctorRowByName(name)
      .find(this.selectors.actionsButton)
      .click({ force: true })
  }

  clickViewDoctorByName(name) {
    this.getDoctorRowByName(name)
      .within(() => {
        cy.get(this.selectors.viewDoctorSvg).click({ force: true })
      })
  }

  openSelectClinicModalByName(name) {
    this.openActionsForDoctor(name)
    this.getDoctorRowByName(name)
      .find(this.selectors.selectClinicSvg)
      .click({ force: true })
    cy.get(this.selectors.clinicModal).should('be.visible')
  }

  setAvailableClinics(clinics = []) {
    cy.get(this.selectors.clinicModal).should('be.visible')
    clinics.forEach(name => {
      cy.get(this.selectors.availableClinicsSelect)
        .parent()
        .find('.select2-selection')
        .click({ force: true })
      cy.get(this.selectors.select2ResultsOption).contains(name).click({ force: true })
    })
  }

  saveClinicAvailability() {
    cy.get(this.selectors.updateClinicBtn).click({ force: true })
    cy.get(this.selectors.clinicModal).should('not.be.visible')
  }

  closeClinicModal() {
    cy.get(this.selectors.modalCloseBtn).click({ force: true })
    cy.get(this.selectors.clinicModal).should('not.be.visible')
  }

  /* ---------- Schedule helpers (day flow only) ---------- */

  clickViewDoctor(nameOrId) {
  // Try by doctor name first
  cy.contains('tr.doctor-table-body', nameOrId)
    .should('exist')
    .within(() => {
      cy.get('.datatable-actions-button').click({ force: true }) // open dropdown
      cy.get('svg#view-doctor').click({ force: true })           // click view icon
    })
}


  openAddAvailabilityModal() {
    cy.get(this.selectors.addAvailabilityBtn, { timeout: 10000 }).should('be.visible').click({ force: true })
    cy.get(this.selectors.scheduleForm).should('be.visible')
  }

  setScheduleType(type = 'day') {
    cy.get(this.selectors.scheduleForm).find(this.selectors.scheduleTypeSelect).select(type, { force: true })
  }



// in DoctorPage class
selectDates(inputSelectorStart, inputSelectorTill) {
  const today = new Date()
  const todayISO = today.toISOString().slice(0, 10)

  const till = new Date()
  till.setDate(today.getDate() + 10)
  const tillISO = till.toISOString().slice(0, 10)

  // set start date
  cy.get(inputSelectorStart).then($input => {
    $input[0].value = todayISO
    cy.wrap($input).trigger('input').trigger('change').trigger('blur')
  })

  // set till date (+10 days)
  cy.get(inputSelectorTill).then($input => {
    $input[0].value = tillISO
    cy.wrap($input).trigger('input').trigger('change').trigger('blur')
  })

  // verify both populated
  cy.get(inputSelectorStart).invoke('val').should('eq', todayISO)
  cy.get(inputSelectorTill).invoke('val').should('eq', tillISO)
}



  // clinicIndex = 0 for first clinic block, 1 for second, etc.
setDayTimesForClinic({ clinicName, open = '09:00', close = '17:00' } = {}) {
  // find the correct datetime block containing that clinic name
  cy.get('#add_schedule_form .datetimeparent')
    .filter((i, el) => {
      return Cypress.$(el).find('label.custom-control-label').text().trim() === clinicName
    })
    .first() // in case the name repeats across days/tabs
    .within(() => {
      cy.get('input.open_time').clear().type(open)
      cy.get('input.close_time').clear().type(close)
    })
}





  addTimeSlotForClinic(clinicDataId) {
    cy.get(this.selectors.scheduleForm).find(`${this.selectors.addTimeBtn}[data-id="${clinicDataId}"]`).click({ force: true })
  }

  saveSchedule() {
    cy.get(this.selectors.scheduleForm).find(this.selectors.saveScheduleBtn).click({ force: true })
 //   cy.get(this.selectors.scheduleForm).should('not.exist')
  }


createDoctorAvailability({
  doctorDisplayName,
  clinics = ['My Test Clinic'],
  schedule = { type: 'day', clinicName: undefined, open: '10:00', close: '18:00' }
} = {}) {
  this.visit()
  this.openSelectClinicModalByName(doctorDisplayName)
  this.setAvailableClinics(clinics)
  this.saveClinicAvailability()

  this.clickViewDoctor(doctorDisplayName)
  this.openAddAvailabilityModal()
  this.setScheduleType(schedule.type)
  this.selectDates('#visit_date', '#till_date')

  this.setDayTimesForClinic({
    clinicName: schedule.clinicName ?? clinics[0],
    open: schedule.open,
    close: schedule.close
  })

  this.saveSchedule()
  return this
}


}

export default new DoctorPage
