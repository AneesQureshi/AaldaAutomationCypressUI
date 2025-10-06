import CreateServicePage from '../../../support/pages/servicePage'

describe('Create New Service', () => {
  const servicePage = new CreateServicePage()

   beforeEach(() => {
    cy.session('admin-session', () => {
      cy.loginFromFixture()
    })
    cy.visit('/queues')
  })
  
  it('should create a new service successfully', () => {
    cy.visit('/service/add')

    servicePage.createService({
      name: 'Vaccination Service',
      categories: ['診察'],
      clinics: ['INC Clinic'],
      providers: ['User Doctor'],
      duration: '30',
      online: true,
      description: 'Routine pet vaccination service',
      active: true,
    })
  })
})
