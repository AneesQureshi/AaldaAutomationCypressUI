// CreateRole.cy.js
import Login from '../../../support/pages/LoginAalda'
import Role from '../../../support/pages/RolePage'

describe('Create Role', () => {
  const login = new Login()

  beforeEach(() => {
    cy.session('admin-session', () => {
      cy.loginFromFixture()
    })
    cy.visit('/queues')
  })

  it('should create a Doctor role with privileges', () => {
    Role.createRole({
      roleName: 'Doctor1',
      workAsDoctor: true,
      parentPrivileges: ['view_queue', 'view_memo', 'view_board'],
      childPrivileges: ['api_appointment_bulk_detail', 'add_memo', 'edit_board']
    })

    cy.get('#toast-container .toast-message', { timeout: 10000 })
  .should('be.visible')
  .and('have.text', 'Role added successfully!')
  })
})
