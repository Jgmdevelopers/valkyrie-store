const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests",

  // Playwright solo descubre pruebas de navegador.
  testMatch: "**/*.spec.js",

  workers: process.env.CI ? 2 : undefined,
});
