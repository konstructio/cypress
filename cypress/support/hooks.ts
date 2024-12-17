import ms from "ms";

afterEach(function () {
  if (this.currentTest.state === "failed") {
    const retryDelay = Number(ms(Cypress.env("RETRY_DELAY")));

    cy.wait(retryDelay);
  }
});
