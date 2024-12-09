import "@testing-library/cypress/add-commands";
declare global {
  namespace Cypress {
    interface Chainable<Subject = any> {
      /**
       * Custom command to perform login.
       * @param username - The username for login
       * @param password - The password for login
       */
      login(username: string, password: string): Chainable<void>;
    }
  }
}

Cypress.Commands.add("login", (username: string, password: string) => {
  cy.visit("/");
  cy.findByRole("button").click();
  cy.findByRole("combobox").select("Username");
  cy.findByLabelText(/username/i).type(username);
  cy.findByLabelText(/password/i).type(password);
  cy.findByRole("button", {
    name: /sign in/i,
  }).click();
});
