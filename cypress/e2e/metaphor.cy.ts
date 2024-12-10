// Utility functions
const checkHrefAndRequest = (
  alias: string,
  environment: "staging" | "development" | "production"
) => {
  cy.get(`@${alias}`).should("have.attr", "href");
  cy.get(`@${alias}`)
    .invoke("attr", "href")
    .then((href) => {
      cy.log(`The href is: ${href}`);
      cy.visit(href);
      cy.findByRole("heading", { name: /metaphor demo/i });
      cy.contains(/vault/i);
      cy.contains(/secret one/i);
      cy.contains(/secret two/i);
      cy.contains(new RegExp(`${environment} secret 1`, "i"));
      cy.contains(new RegExp(`${environment} secret 2`, "i"));
    });
};

describe("Test metaphor is working correctly", () => {
  beforeEach(() => {
    const username = Cypress.env("USERNAME");
    const password = Cypress.env("PASSWORD");

    cy.login(username, password);
    cy.goApplications();
    cy.findByRole("textbox").type("metaphor{enter}");
  });

  it("should validate the metaphor development is working", () => {
    cy.findByRole("link", { name: /metaphor-development/i }).as("development");
    cy.get("@development").as("link");
    checkHrefAndRequest("link", "development");
  });

  it("should validate the metaphor staging is working", () => {
    cy.findByRole("link", { name: /metaphor-staging/i }).as("staging");
    cy.get("@staging").as("link");
    checkHrefAndRequest("link", "staging");
  });

  it("should validate the metaphor production is working", () => {
    cy.findByRole("link", { name: /metaphor-production/i }).as("production");
    cy.get("@production").as("link");
    checkHrefAndRequest("link", "production");
  });
});
