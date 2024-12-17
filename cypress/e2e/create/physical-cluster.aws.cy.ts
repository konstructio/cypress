import ms from "ms";

import { Account } from "../../../types/accouts";

import { fillOutForm } from "../../utils";

const CLUSTER_NAME = Cypress.env("CLUSTER_NAME");
const isAWS = Cypress.env("CLOUD_PROVIDER") === "aws";
const MAX_TIME_TO_WAIT = Cypress.env("MAX_TIME_TO_WAIT");

describe("Test to validate physical cluster creation on AWS", () => {
  beforeEach(function () {
    if (!isAWS) {
      cy.log("This test is only for AWS");

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

    fillOutForm({
      name: CLUSTER_NAME,
      region: /us-east-1/i,
      intanceSize: /t2.nano/i,
    });

    cy.findByRole("button", {
      name: /create cluster/i,
    }).click();

    cy.wait(2000);

    cy.findByRole("heading", { name: new RegExp(CLUSTER_NAME, "i") }).should(
      "exist"
    );
    cy.contains("Provisioning").should("exist");
  });

  it("should validate the cluster is provisioning", () => {
    cy.visit("/");

    cy.goClusters();

    cy.findAllByRole("button", { name: new RegExp(CLUSTER_NAME, "i") })
      .eq(0)
      .as("clusterProvisioningButton");

    cy.get("@clusterProvisioningButton").should("exist");

    cy.get("@clusterProvisioningButton").within(() => {
      cy.findByText(/provisioning/i).should("exist");
    });
  });

  it("should validate the cluster is provisioned", { retries: 3 }, () => {
    cy.visit("/");

    cy.goClusters();

    cy.findAllByRole("button", { name: new RegExp(CLUSTER_NAME, "i") })
      .eq(0)
      .as("clusterProvisionedButton");

    cy.get("@clusterProvisionedButton").should("exist");

    cy.get("@clusterProvisionedButton").within(() => {
      cy.findByText(/provisioned/i, {
        timeout: Number(ms(MAX_TIME_TO_WAIT)),
      }).should("exist");
    });
  });
});
