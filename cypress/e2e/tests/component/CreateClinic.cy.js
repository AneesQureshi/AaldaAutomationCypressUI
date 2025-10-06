import Login from '../../../support/pages/LoginAalda'
import Clinic from '../../../support/pages/ClinicPage'

describe('Create Clinic', () => {
  const credentials = {
    email: 'admin@aalda.in',
    password: '12345',
    language: 'English'
  }

  beforeEach(() => {
    // create once and reuse automatically
    cy.session('admin-session', () => {
      const login = new Login()
      login.loginWithCredentials(credentials.email, credentials.password, credentials.language)
      cy.url().should('include', '/queues')
    })

    // now visit page with restored session
    cy.visit('/queues')
  })


  it('Create Clinic using fixture data', () => {
    cy.intercept('POST', '/clinic/create').as('createClinic')

    Clinic.createClinic()

    cy.wait('@createClinic').its('response').should((res) => {
      expect(res.statusCode).to.eq(200)
      expect(res.body.status).to.eq('success')
      expect(res.body.message).to.eq('Clinic added successfully.')
    })
  })

  it('Create Clinic using provided data', () => {
    cy.intercept('POST', '/clinic/create').as('createClinic')

    Clinic.createClinic({
      name: 'My Test Clinic',
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

    cy.wait('@createClinic').its('response').should((res) => {
      expect(res.statusCode).to.eq(200)
      expect(res.body.status).to.eq('success')
      expect(res.body.message).to.eq('Clinic added successfully.')
    })
  })
})
