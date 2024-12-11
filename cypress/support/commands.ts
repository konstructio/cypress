import "@testing-library/cypress/add-commands";
declare global {
  namespace Cypress {
    interface Chainable<Subject = any> {
      login(username: string, password: string): Chainable<void>;
      goApplications(): Chainable<void>;
      goClusterManagement(): Chainable<void>;
    }
  }
}

Cypress.Commands.add("login", (username: string, password: string) => {
  cy.session(
    "login",
    () => {
      cy.visit("/");
      cy.findByRole("button").click();
      cy.findByRole("combobox").select("Username");
      cy.findByLabelText(/username/i).type(username);
      cy.findByLabelText(/password/i).type(password);
      cy.findByRole("button", {
        name: /sign in/i,
      }).click();
      cy.url().should("contain", "/dashboard");
    },
    {
      validate: () => {
        cy.visit("/");
        cy.contains(/clusters/i);
      },
      cacheAcrossSpecs: true,
    }
  );
});

Cypress.Commands.add("goApplications", () => {
  cy.visit("/");
  cy.findByRole("link", { name: /applications/i }).click();
});

Cypress.Commands.add("goClusterManagement", () => {
  cy.visit("/");
  cy.findByRole("link", { name: /cluster management/i }).click();
});
