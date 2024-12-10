// Utility functions
const checkHrefAndRequest = (alias: string) => {
  cy.get(`@${alias}`).should("have.attr", "href");
  cy.get(`@${alias}`)
    .invoke("attr", "href")
    .then((href) => {
      cy.log(`The href is: ${href}`);

      cy.request(href).then((response) => {
        expect(response.status).to.eq(200);
        cy.document().then((doc) => {
          doc.write(response.body);
          doc.close();
          cy.findByRole("heading", { name: /metaphor/i });
        });
      });
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
    checkHrefAndRequest("link");
  });

  it("should validate the metaphor staging is working", () => {
    cy.findByRole("link", { name: /metaphor-staging/i }).as("staging");
    cy.get("@staging").as("link");
    checkHrefAndRequest("link");
  });

  it("should validate the metaphor production is working", () => {
    cy.findByRole("link", { name: /metaphor-production/i }).as("production");
    cy.get("@production").as("link");
    checkHrefAndRequest("link");
  });
});
