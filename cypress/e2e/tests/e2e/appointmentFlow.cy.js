// cypress/e2e/full_flow_ui.cy.js
import Login from '../../../support/pages/LoginAalda'
import Clinic from '../../../support/pages/ClinicPage'
import Role from '../../../support/pages/RolePage'
import PeoplePage from '../../../support/pages/PeoplePage'
import DoctorPage from '../../../support/pages/doctorPage'
import CreateServicePage from '../../../support/pages/servicePage'
import Appointment from '../../../support/pages/AppointmentPage'

describe('Full UI flow: clinic -> role -> doctor(person) -> assign -> service -> appointment', () => {
  // single timestamp + random phone defined once
  const timestamp = Date.now()
  const randomPhone = String(Cypress._.random(10000, 99999))
  const doctorPage = new DoctorPage()
  const servicePage = new CreateServicePage()
  const appt = new Appointment()

  let data
  // names object will be composed once using fixture + timestamp
  const names = {}

  before(() => {
    cy.fixture('e2eData').then(f => {
      data = f
      // compose stable names once
      names.clinic = `${data.clinic.name} ${timestamp}`
      names.role = `${data.role.roleName} ${timestamp}`
      names.doctorFirst = data.doctor.firstName
      names.doctorLast = `${data.doctor.lastName} ${timestamp}`
      names.doctorEmail = `e2e.doctor.${timestamp}@example.com`
      names.service = `${data.service.name} ${timestamp}`
      names.clientName = `${data.appointment.clientName}`
      names.phone = randomPhone
      names.doctorDisplayName = `${data.doctor.lastName} ${timestamp} ${data.doctor.firstName}`
    })
  })

  beforeEach(() => {
    cy.session('admin-session', () => {
      cy.loginFromFixture()
    })
    cy.visit('/queues')
  })



  
  it('creates clinic via UI', () => {
    cy.intercept('POST', '**/clinic/create').as('createClinic')

    const clinicPayload = {
      ...data.clinic,
      name: names.clinic,
      phone: (data.clinic.phonePrefix ?? '') + names.phone
    }

    Clinic.createClinic(clinicPayload)

    cy.wait('@createClinic').its('response.statusCode').should('be.oneOf', [200, 201])
    cy.get('.toast-message').should('contain.text', 'Clinic added')
  })




  it('creates doctor role via UI', () => {
    cy.intercept('POST', '**/role/create').as('createRole')
    cy.visit('/queues')

    const rolePayload = { ...data.role, roleName: names.role }
    Role.createRole(rolePayload)

    cy.wait('@createRole').its('response.statusCode').should('be.oneOf', [200, 201])
    cy.get('#toast-container .toast-message').should('contain.text', 'Role added')
  })

  it('creates person (doctor) and assigns role & clinics via UI', () => {
    cy.intercept('POST', '**/user/create').as('createPerson')

    PeoplePage.open()
    PeoplePage.fill({
      role: names.role,
      clinics: [names.clinic],
      defaultClinic: names.clinic,
      userInfo: {
        lastName: names.doctorLast,
        firstName: names.doctorFirst,
        kanaLastName: data.doctor.kanaLastName,
        kanaFirstName: data.doctor.kanaFirstName,
        email: names.doctorEmail,
        password: data.doctor.password,
        phone: (data.clinic.phonePrefixJapan ?? '') + names.phone
      }
    })
    PeoplePage.save()

    cy.wait('@createPerson').its('response.statusCode').should('be.oneOf', [200, 201])
    cy.get('.toast-message').should('contain.text', 'User added successfully')
  })

  it('assigns doctor to clinic via UI (doctor availability modal)', () => {
    doctorPage.visit()
    doctorPage.openSelectClinicModalByName(names.doctorDisplayName)
    doctorPage.setAvailableClinics(['My Test Clinic'])
    doctorPage.saveClinicAvailability()
    cy.get('.toast-message').should('contain.text', 'Doctor clinic updated successfully')

    doctorPage.clickViewDoctor(names.doctorDisplayName)
    doctorPage.openAddAvailabilityModal()
    doctorPage.setScheduleType('day')
    doctorPage.selectDates('#visit_date', '#till_date')

    doctorPage.setDayTimesForClinic({
      clinicName: names.clinic,
      open: '10:00',
      close: '18:00'
    })

    doctorPage.saveSchedule()
  })

  it('creates service via UI with provider set to the doctor', () => {
    cy.intercept('POST', '**/service/create').as('createService')
    cy.visit('/service/add')

    const servicePayload = {
      ...data.service,
      name: names.service,
      clinics: [names.clinic],
      providers: [names.doctorDisplayName]
    }

    servicePage.createService(servicePayload)

    cy.wait('@createService').its('response.statusCode').should('be.oneOf', [200, 201])
    cy.get('.toast-message').should('contain.text', 'Service added')
  })

  it('creates appointment via UI using the created clinic, service and doctor', () => {
    cy.intercept('POST', '**/appointment/create').as('createAppt')
    let date, timeSlot, email

    appt.visit()
    appt.selectClinicByName(names.clinic)
    appt.selectServiceByName(names.service)
    appt.selectDoctorByName(names.doctorDisplayName)

    appt.pickDate()
    appt.getSelectedDate().then(val => { date = val })
    cy.wait(2000)
    appt.selectFirstAvailableTimeSlot()
    appt.getSelectedTimeSlot().then(val => { timeSlot = val })

    appt.enterClient(names.clientName)
    appt.getClientEmail().then(val => { email = val })

    appt.selectPet()
    appt.enterNotes(data.appointment.notes)
    appt.submit()

    cy.wait('@createAppt').its('response.statusCode').should('be.oneOf', [200, 201, 302])
  })
})
