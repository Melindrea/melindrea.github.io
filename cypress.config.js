const { defineConfig } = require('cypress');
const htmlvalidate = require('cypress-html-validate/plugin');

module.exports = defineConfig({
  e2e: {
    setupNodeEvents (on, config) {
      htmlvalidate.install(on);
    }
  }
});
