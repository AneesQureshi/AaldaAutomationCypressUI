import DoctorPage from '../../../support/pages/doctorPage'
const doctorPage = new DoctorPage()

describe('Doctor daily schedule', () => {
  beforeEach(() => {
    cy.session('admin-session', () => {
      cy.loginFromFixture()
    })
    doctorPage.visit()
  })

  it('updates doctor clinic availability', () => {
    doctorPage.filterByClinic('INC Clinic')
    doctorPage.openSelectClinicModalByName('User Doctor')
    doctorPage.setAvailableClinics(['My Test Clinic'])
    doctorPage.saveClinicAvailability()
  })

  it('sets daily availability between start and till date', () => {
   // doctorPage.filterByClinic('INC Clinic')
   doctorPage.clickViewDoctor('User Doctor')

    // open schedule modal (toolbar)
    doctorPage.openAddAvailabilityModal()

    // day flow: start + till, then times inside #day_wrapper
    doctorPage.setScheduleType('day')
doctorPage.selectDates('#visit_date', '#till_date')



    // set times for clinic blocks (0 = first clinic, 1 = second)
   // doctorPage.setDayTimesForClinic({ clinicIndex: 0, open: '09:00', close: '18:00' })
    doctorPage.setDayTimesForClinic({ clinicIndex: 1, open: '09:00', close: '18:00' })

    doctorPage.saveSchedule()
  })
})
