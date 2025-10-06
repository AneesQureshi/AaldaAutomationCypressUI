// support/pages/Role.js
class RolePage {
  selectors = {
    settingsAction: '#settings-modal-action',
    peopleRolesItem: '#people-roles-list-item',
    form: '#add-role-form',
    roleName: '#role_name',
    workAsDoctor: '#customSwitch1',
    saveBtn: '#add-role-btn-click',
    rolesBtn: '#roles-btn',
    createRoleAction: '#create-role-action',
    parentPrivilege: (val) => `.priv-class-outer-role[data-value="${val}"]`,
    childPrivilege: (val) => `.priv-class-role[data-value="${val}"]`,
    allParentPrivileges: '.priv-class-outer-role',
    allChildPrivileges: '.priv-class-role'
  }

  openSettings(timeout = 10000) {
    cy.get(this.selectors.settingsAction, { timeout }).should('be.visible').click()
    cy.get(this.selectors.peopleRolesItem, { timeout: timeout + 5000 }).should('be.visible').click()
    return this
  }

  clickOnRoles() {
    cy.get(this.selectors.rolesBtn).should('be.visible').click()
    cy.get(this.selectors.createRoleAction).should('be.visible').click()
    return this
  }

  setRoleName(name) {
    cy.get(this.selectors.roleName).clear().type(name)
    return this
  }

  toggleWorkAsDoctor(enable = true) {
    cy.get(this.selectors.workAsDoctor).then(($el) => {
      const isChecked = $el.prop('checked')
      if (enable && !isChecked) cy.wrap($el).click()
      if (!enable && isChecked) cy.wrap($el).click()
    })
    return this
  }

  selectParentPrivileges(privileges = []) {
    privileges.forEach((priv) => {
      cy.get(this.selectors.parentPrivilege(priv)).then(($el) => {
        if ($el.length) cy.wrap($el).check({ force: true })
      })
    })
    return this
  }

  selectChildPrivileges(privileges = []) {
    privileges.forEach((priv) => {
      cy.get(this.selectors.childPrivilege(priv)).then(($el) => {
        if ($el.length) cy.wrap($el).check({ force: true })
      })
    })
    return this
  }

  checkAllPrivileges() {
    cy.get(this.selectors.allParentPrivileges).check({ force: true })
    cy.get(this.selectors.allChildPrivileges).check({ force: true })
    return this
  }

  save() {
    cy.get(this.selectors.saveBtn).should('be.enabled').click()
    return this
  }

  createRole({ roleName, workAsDoctor = false, parentPrivileges = [], childPrivileges = [] } = {}) {
    this.openSettings()
    cy.wait(2000)

    this.clickOnRoles()
      .setRoleName(roleName)
      .toggleWorkAsDoctor(workAsDoctor)
      .selectParentPrivileges(parentPrivileges)
      .selectChildPrivileges(childPrivileges)
      .save()

    return this
  }
}

export default new RolePage()
