const { defineConfig } = require("cypress");

module.exports = defineConfig({
   video: false,
  screenshotOnRunFailure: true,
  e2e: {

    baseUrl: "https://uatcash2.vet360.jp", // your base URL
    setupNodeEvents(on, config) {
      // implement node event listeners here if needed
    },
  },
});
