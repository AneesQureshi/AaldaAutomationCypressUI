/**
 * Try to pick first available slot. Waits for the network call that runs on slot click.
 * Replace '**/appointment/check_slot**' with the real URL pattern your app calls.
 */
selectFirstAvailableTimeSlot_resilient(maxAttempts = 8) {
  // adjust pattern to real endpoint the app hits on slot selection
  cy.intercept('POST', '**/appointment/check_slot**').as('slotCheck')

  cy.get('#time-slot-container input[name="time_slot"]')
    .not(':disabled')
    .then($all => {
      if ($all.length === 0) throw new Error('No time slot inputs found')

      const total = $all.length

      const attempt = (idx) => {
        if (idx >= Math.min(total, maxAttempts)) {
          throw new Error('Could not select any time slot')
        }

        // re-query the nth input each attempt to avoid detached-subject
        return cy.get('#time-slot-container input[name="time_slot"]').not(':disabled').eq(idx).then($input => {
          const id = $input.attr('id')
          if (!id) return attempt(idx + 1)

          // native label click to mimic user
          cy.get(`label[for="${id}"]`).should('exist').then($lbl => $lbl[0].click())

          // wait for the request the UI makes when selecting a slot
          // if your app doesn't make a network call, this wait will timeout. then fallback below.
          return cy.wait('@slotCheck', { timeout: 5000 })
            .then(() => {
              // after network finishes, re-query input and check
              return cy.get(`#${id}`).then($i => {
                if ($i.is(':checked')) {
                  // success: ensure validation removed
                  cy.contains('Please select slot', { timeout: 5000 }).should('not.exist')
                  return
                }
                // not checked -> try next
                return attempt(idx + 1)
              })
            })
            .catch(() => {
              // fallback when no network call or intercept pattern wrong:
              // wait briefly for re-render then check input state
              return cy.wait(300).then(() =>
                cy.get(`#${id}`).then($i => {
                  if ($i.is(':checked')) {
                    cy.contains('Please select slot', { timeout: 5000 }).should('not.exist')
                    return
                  }
                  return attempt(idx + 1)
                })
              )
            })
        })
      }

      // start attempts at first visible / enabled input
      // find index of first visible enabled input
      const visibleIdx = Cypress._.findIndex($all.toArray(), el => Cypress.$(el).is(':visible'))
      return attempt(Math.max(0, visibleIdx))
    })
}
