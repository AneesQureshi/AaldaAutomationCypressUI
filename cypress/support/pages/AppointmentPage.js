class Appointment {
  // selectors
  selectors = {
    clinicSelect: '#clinic-list',
    serviceSelect: '#check-service-for',
    doctorSelect: '#doctor-option',
    dateInput: '#appointment_date',
    timeSlotContainer: '#time-slot-container input[name="time_slot"]',
    allowDoubleCheckbox: '#allowdoublebooking',
    clientName: '#client_name',
    clientEmail: '#client_email',
    clientPhone: '#client_phone',
    clientExistId: '#exist_client_id',
    gestureDropdown: 'ul.gestureDropdown',
    gestureItem: 'ul.gestureDropdown li.gestureDropdownItem',
    petSelect: '#pet_id',
    notes: '#app_notes',
    submitBtn: '#create_appointment_btn',
    calendarEvent: 'a.fc-timegrid-event'
  }

  visit() {
    cy.visit('https://uatcash2.vet360.jp/appointment/create')
  }

  selectClinic() {
    cy.get(this.selectors.clinicSelect).should('exist').then($sel => {
      cy.wrap($sel)
        .find('option')
        .filter((i, opt) => opt.value !== '' && opt.value.toLowerCase() !== 'any')
        .then($opts => {
          if ($opts.length < 2) throw new Error('Less than 2 valid clinic options')
          const val = $opts[1].value
          cy.get(this.selectors.clinicSelect).select(val)
        })
    })
  }

selectClinicByName(name) {
  if (!name) throw new Error('name is required')

  cy.get(this.selectors.clinicSelect)
    .should('exist')
    .select(name)
}


  selectFirstService() {
    cy.get(this.selectors.serviceSelect).should('exist').then($sel => {
      cy.wrap($sel)
        .find('option')
        .filter((i, opt) => opt.value !== '' && opt.value.toLowerCase() !== 'any')
        .then($opts => {
          if ($opts.length === 0) throw new Error('No valid service option found')
          const val = $opts[0].value
          cy.get(this.selectors.serviceSelect).select(val)
        })
    })
  }

  selectServiceByName(name) {
  if (!name) throw new Error('name is required')

  cy.get(this.selectors.serviceSelect)
    .should('exist')
    .select(name)
}


  selectDoctor() {
    cy.get(this.selectors.doctorSelect).should('exist').then($sel => {
      cy.wrap($sel)
        .find('option')
        .filter((i, opt) => opt.value !== '' && opt.value.toLowerCase() !== 'any')
        .then($opts => {
          if ($opts.length === 0) throw new Error('No valid doctor option found')
          const val = $opts[0].value
          cy.get(this.selectors.doctorSelect).select(val)
        })
    })
  }
selectDoctorByName(name) {
  if (!name) throw new Error('name is required')

  cy.get(this.selectors.doctorSelect)
    .should('exist')
    .select(name)
}

  selectFirstAvailableTimeSlot() {
    cy.get(this.selectors.timeSlotContainer)
      .not(':disabled')
      .eq(0)
      .check({ force: true })
  }

  pickDate() {
    cy.get(this.selectors.dateInput).click()
    cy.get('td[day].current-month.gj-cursor-pointer')
      .first()
      .click()
    cy.get(this.selectors.dateInput)
      .invoke('val')
      .should('not.be.empty')
    cy.get('body').click(0, 0) // close calendar
  }

  enterClient(name) {
    cy.get(this.selectors.clientName).clear().type(name)
    cy.get(this.selectors.gestureDropdown).should('be.visible')
    cy.get(this.selectors.gestureItem).first().click()
    cy.get(this.selectors.clientExistId).should('not.have.value', '')
  }

  getClientEmail() {
    return cy.get(this.selectors.clientEmail).invoke('val')
  }

  selectPet() {
    cy.get(this.selectors.petSelect).should('exist').then($sel => {
      cy.wrap($sel)
        .find('option')
        .filter((i, opt) => opt.value !== '' && opt.value !== 'create_new')
        .then($opts => {
          if ($opts.length === 0) throw new Error('No valid pet option found')
          const val = $opts[0].value
          cy.get(this.selectors.petSelect).select(val)
        })
    })
  }

  enterNotes(text) {
    cy.get(this.selectors.notes).clear().type(text)
  }

  submit() {
    cy.get(this.selectors.submitBtn).should('not.be.disabled').click()
  }

  getSelectedService() {
    return cy.get(`${this.selectors.serviceSelect} option:selected`).invoke('val')
  }

  getSelectedDoctor() {
    return cy.get(`${this.selectors.doctorSelect} option:selected`).invoke('val')
  }

  getSelectedDate() {
    return cy.get(this.selectors.dateInput).invoke('val')
  }

  getSelectedTimeSlot() {
    return cy.get(`${this.selectors.timeSlotContainer}:checked`).invoke('val')
  }

  verifyCalendarEvent(name, timeSlot) {
    cy.get(this.selectors.calendarEvent)
      .should('contain.text', name)
      .and('contain.text', timeSlot)
  }

  createAppointment({
  clinic,
  service,
  doctor,
  clientName = names.clientName,
  notes = data?.appointment?.notes
} = {}) {
  this.visit()

  if (clinic) this.selectClinicByName(clinic)
  else this.selectClinic()

  if (service) this.selectServiceByName(service)
  else this.selectFirstService()

  if (doctor) this.selectDoctorByName(doctor)
  else this.selectDoctor()

  this.pickDate()
  this.getSelectedDate().then(d => cy.wrap(d).as('apptDate'))

  cy.wait(2000) // keeps original timing behaviour
  this.selectFirstAvailableTimeSlot()
  this.getSelectedTimeSlot().then(t => cy.wrap(t).as('apptTime'))

  this.enterClient(clientName)
  this.getClientEmail().then(e => cy.wrap(e).as('apptEmail'))

  this.selectPet()

  if (notes) this.enterNotes(notes)

  this.submit()

  return this
}



}

export default  Appointment
