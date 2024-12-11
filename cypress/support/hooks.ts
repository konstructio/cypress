afterEach(function () {
  if (this.currentTest.state === "failed") {
    const retryDelay = Cypress.env("RETRY_DELAY");

    cy.wait(+retryDelay);
  }
});
