import { Account } from "../../types/accouts";

import { fillOutForm } from "./utils";

const CLUSTER_NAME = "test-cluster";
const isCivo = Cypress.env("CLOUD_PROVIDER") === "civo";

describe("Test to validate physical cluster creation", () => {
  beforeEach(function () {
    if (!isCivo) {
      cy.log("This test is only for Civo");

      this.skip();
    }
  });

  beforeEach(() => {
    const username = Cypress.env("USERNAME");
    const password = Cypress.env("PASSWORD");

    cy.login(username, password);
  });

  it("should create a physical cluster", () => {
    cy.visit("/");
    cy.findByRole("button", { name: /add workload cluster/i }).as("button");

    cy.request("GET", "/api/proxy?url=%2Fcloud-account").then(
      ({ status, body }) => {
        expect(status).to.eq(200);

        const { cloud_accounts: cloudAccounts } = body;
        cy.wrap(cloudAccounts as Account[]).as("accounts");
      }
    );

    cy.get("@accounts").then((accounts) => {
      const cloudAccounts = accounts as unknown as Account[];
      expect(cloudAccounts).to.be.an("array");
      expect(cloudAccounts).to.have.length.greaterThan(0);

      const defaultAccount = cloudAccounts.find(
        (account) => account.name === "default"
      );

      expect(defaultAccount).to.exist;
    });

    cy.get("@button").click();

    fillOutForm(CLUSTER_NAME);

    // cy.findByRole("button", {
    //   name: /create cluster/i,
    // }).click();

    // cy.wait(2000);

    // cy.findByRole("heading", { name: new RegExp(CLUSTER_NAME, "i") }).should(
    //   "exist"
    // );
    // cy.contains("Provisioning").should("exist");
  });
});
