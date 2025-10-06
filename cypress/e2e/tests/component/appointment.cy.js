import Appointment from '../../../support/pages/AppointmentPage'
import Login from '../../../support/pages/LoginAalda'

describe('Appointment form - create', () => {
  const appt = new Appointment()
  const login = new Login()

  let name, notes
  let email, date, serviceValue, doctorValue, timeSlot

  before(() => {
    cy.fixture('credentials').then((data) => {
      // use helper that visits, logs in and selects language
      login.loginWithCredentials(data.email, data.password, 'English')
    })
  })

  it('Create Appointment (dynamic)', () => {
    name = 'Sandeep'
    notes = 'Automated test note'

    cy.intercept('POST', '**/appointment/create').as('createAppt')

    appt.visit()
   

    // clinic, service, doctor
    appt.selectClinic()
    appt.selectFirstService()
    appt.getSelectedService().then(val => { serviceValue = val })

    appt.selectDoctor()
    appt.getSelectedDoctor().then(val => { doctorValue = val })

    // date and time slot
    appt.pickDate()
    appt.getSelectedDate().then(val => { date = val })
    cy.wait(2000)
    appt.selectFirstAvailableTimeSlot()
    appt.getSelectedTimeSlot().then(val => { timeSlot = val })

    // client and email (auto-filled)
    appt.enterClient(name)
    appt.getClientEmail().then(val => { email = val })

    // pet, notes
    appt.selectPet()
    appt.enterNotes(notes)

    // submit
    appt.submit()

    // assert request body
    cy.wait('@createAppt').then(interception => {
      const params = new URLSearchParams(interception.request.body)

      expect(params.get('client_name')).to.include(name)
      expect(params.get('client_email')).to.eq(email)
      expect(params.get('appointment_date')).to.eq(date)
      expect(params.get('service_id')).to.eq(serviceValue)
      expect(params.get('doctor_id')).to.eq(doctorValue)
      expect(params.get('time_slot')).to.eq(timeSlot)
      expect(params.get('app_notes')).to.eq(notes)

      expect(interception.response?.statusCode).to.be.oneOf([200, 201, 302])
    })



  })
})
