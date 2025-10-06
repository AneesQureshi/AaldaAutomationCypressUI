import PeoplePage from '../../../support/pages/PeoplePage'

describe('Create People', () => {
  beforeEach(() => {
    cy.session('admin-session', () => {
      cy.loginFromFixture()
    })
    cy.visit('/queues')
  })

  it('should open People page and create a new user', () => {
    PeoplePage.open()

    PeoplePage.fill({
      role: 'Admin',
      clinics: ['INC Clinic', 'My Test Clinic'],
      defaultClinic: 'INC Clinic',
      userInfo: {
        lastName: 'Qureshi',
        firstName: 'Anish',
        kanaLastName: 'クレシ',
        kanaFirstName: 'アニッシュ',
        email: 'anish.qa@aalda.com',
        password: 'Test@123',
        phone: '987643210'
      }
    })

    PeoplePage.save()

cy.get('.toast-message', { timeout: 10000 })
  .should('be.visible')
  .and('contain.text', 'User added successfully.')

  })
})
