// cypress/e2e/full_flow_ui.cy.js
import Login from '../../../support/pages/LoginAalda'
import Clinic from '../../../support/pages/ClinicPage'
import Role from '../../../support/pages/RolePage'
import PeoplePage from '../../../support/pages/PeoplePage'
import DoctorPage from '../../../support/pages/doctorPage'
import CreateServicePage from '../../../support/pages/servicePage'
import Appointment from '../../../support/pages/AppointmentPage'

describe('Full UI flow: clinic -> role -> doctor(person) -> assign -> service -> appointment', () => {
 
  const doctorPage = new DoctorPage()
  const servicePage = new CreateServicePage()
  const appt = new Appointment()

  const names = {
    clinic: `E2E Clinic ${Date.now()}`,
    role: `E2E DoctorRole ${Date.now()}`,
    doctorFirst: 'E2E',
    doctorLast: `Doctor ${Date.now()}`,
    doctorEmail: `e2e.doctor.${Date.now()}@example.com`,
    service: `E2E Service ${Date.now()}`,
    clientName: `Sandeep E2E ${Date.now()}`,
    phone :String(Cypress._.random(100000000, 999999999))

  }

 beforeEach(() => {
    cy.session('admin-session', () => {
      cy.loginFromFixture()
    })
    cy.visit('/queues')
  })

  it('creates clinic via UI', () => {
    cy.intercept('POST', '**/clinic/create').as('createClinic')
    
        Clinic.createClinic({
          name: names.clinic,
          onlineStatus: 'Active',
          anicomCode: 'A100',
          ipetCode: 'I100',
          reportLang: 'English',
          pincode: '110001',
          country: 'India',
          state: 'Delhi',
          city: 'Delhi',
          address: 'Street 1',
          phone: '9876543210',
          company: 'ACME',
          businessLink: 'https://acme.example',
          mondayFrom: '09:30 AM',
          mondayTo: '09:30 PM'
        })
    cy.wait('@createClinic').its('response.statusCode').should('be.oneOf',[200,201])
    cy.get('.toast-message').should('contain.text', 'Clinic added')
  })

  it('creates doctor role via UI', () => {
    cy.intercept('POST', '**/role/create').as('createRole')
    cy.visit('/queues')
    Role.createRole({
      roleName: names.role,
      workAsDoctor: true,
      parentPrivileges: ['view_queue'],
      childPrivileges: ['create_appointment']
    })
    cy.wait('@createRole').its('response.statusCode').should('be.oneOf',[200,201])
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
        kanaLastName: 'カナ', // keep if required
        kanaFirstName: 'カナ',
        email: names.doctorEmail,
        password: 'Test@1234',
        phone: names.phone
      }
    })
    PeoplePage.save()
    cy.wait('@createPerson').its('response.statusCode').should('be.oneOf',[200,201])
    cy.get('.toast-message').should('contain.text', 'User added successfully')
  })

  it('assigns doctor to clinic via UI (doctor availability modal)', () => {
    doctorPage.visit()
    
    //doctorPage.filterByClinic(names.clinic)
    const doctorDisplayName = `${names.doctorLast} ${names.doctorFirst}`
   // const doctorDisplayName = 'Doctor 1760117061142 E2E'
    doctorPage.openSelectClinicModalByName(doctorDisplayName)
    doctorPage.setAvailableClinics(['My Test Clinic'])
    doctorPage.saveClinicAvailability()
    cy.get('.toast-message').should('contain.text', 'Doctor clinic updated successfully')


doctorPage.clickViewDoctor(doctorDisplayName)

    // open schedule modal (toolbar)
    doctorPage.openAddAvailabilityModal()

    // day flow: start + till, then times inside #day_wrapper
    doctorPage.setScheduleType('day')
doctorPage.selectDates('#visit_date', '#till_date')



  doctorPage.setDayTimesForClinic({
  //clinicName: 'E2E Clinic 1760117061142',
   clinicName: names.clinic,
  open: '10:00',
  close: '18:00'
})


    doctorPage.saveSchedule()    

  })

  it('creates service via UI with provider set to the doctor', () => {
   
    cy.intercept('POST', '**/service/create').as('createService')
    cy.visit('/service/add')
    servicePage.createService({
      name: names.service,
      categories: ['診察'],
      clinics: [names.clinic],
      providers: [ `${names.doctorLast} ${names.doctorFirst}` ],
    // clinics:['My Test Clinic'],
    // providers :['User Doctor'],
      duration: '30',
      online: true,
      description: 'E2E service created by UI',
      active: true
    })
    cy.wait('@createService').its('response.statusCode').should('be.oneOf',[200,201])
    cy.get('.toast-message').should('contain.text', 'Service added')
  })

  it('creates appointment via UI using the created clinic, service and doctor', () => {
      let clientname, notes, date, timeSlot, email
       clientname = 'Sandeep'
    notes = 'Automated test note'
    cy.intercept('POST', '**/appointment/create').as('createAppt')
    appt.visit()
    //select clinic by visible name
    appt.selectClinicByName(names.clinic)
    // pick the service we created
    appt.selectServiceByName(names.service)
    // pick provider/doctor
    appt.selectDoctorByName(`${names.doctorLast} ${names.doctorFirst}`)
    // pick a date and first available slot (use existing methods)
   
    //   appt.selectClinicByName('E2E Clinic 1760117061142')
    // // pick the service we created
    // appt.selectServiceByName('E2E Service 1760117061142')
    // // pick provider/doctor
    // appt.selectDoctorByName('Doctor 1760117061142 E2E')
    //pick a date and first available slot (use existing methods)

 appt.pickDate()
    appt.getSelectedDate().then(val => { date = val })
    cy.wait(2000)
    appt.selectFirstAvailableTimeSlot()
    appt.getSelectedTimeSlot().then(val => { timeSlot = val })
    // client and email (auto-filled)
    appt.enterClient(clientname)
    appt.getClientEmail().then(val => { email = val })
    // pet, notes
    appt.selectPet()
    appt.enterNotes('E2E appointment created by UI')
    // submit
    appt.submit()



    cy.wait('@createAppt').its('response.statusCode').should('be.oneOf',[200,201,302])
  //  cy.get('.toast-message').should('contain.text', 'Appointment created')
  })
})
