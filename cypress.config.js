const { defineConfig } = require("cypress");

module.exports = defineConfig({
  viewportHeight: 1080,
  viewportWidth: 1920,
  env: {
    username: 'cytest123123123', 
    email: 'zbogdancajanko1@gmail.com',
    password: 'password123',
    apiUrl: 'https://conduit-api.bondaracademy.com',
    baseUrl: 'https://conduit.bondaracademy.com/'
  },
  retries: {
    runMode: 1,
    openMode: 0
  },
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here

    },
    baseUrl: 'https://conduit.bondaracademy.com/',
    specPattern: 'cypress/e2e/**/*.spec.{js,jsx,ts,tsx}',
    excludeSpecPattern: '**/examples/*'
  },
});

