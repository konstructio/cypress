// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

declare namespace Cypress {
  interface Chainable<Subject = any> {
    /**
     * Custom command to perform login.
     * @param username - The username for login
     * @param password - The password for login
     */
    login(username: string, password: string): Chainable<void>;
  }
}

Cypress.Commands.add("login", (username, password) => {
  cy.visit("/");
  cy.get("button").click();
  cy.get('select[id="select-ember18"]').select("Username");
  cy.get('input[id="username"]').type(username);
  cy.get('input[id="password"]').type(password);
  cy.get('button[id="auth-submit"]').click();
});
