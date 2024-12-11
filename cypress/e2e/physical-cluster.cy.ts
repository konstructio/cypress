import ms from "ms";

import { Account } from "../../types/accouts";

const CLUSTER_NAME = "test-cluster";
const isAWS = Cypress.env("CLOUD_PROVIDER") === "aws";
const MAX_TIME_TO_WAIT = Cypress.env("MAX_TIME_TO_WAIT");

// Utility function to fill out the form to create a physical cluster
const fillOutForm = () => {
  cy.get("form").as("form");
  cy.get("@form").should("exist");

  cy.findByRole("textbox").type(CLUSTER_NAME, {
    delay: 10,
  });

  cy.findByRole("radio", { name: /physical/i }).click();

  cy.findAllByRole("combobox").eq(1).as("clusterHost");

  cy.get("@clusterHost").click();

  cy.findByRole("listbox").within(() => {
    cy.findByRole("option", { name: /default/i }).click();
  });

  cy.findAllByRole("combobox").eq(2).as("clusterRegion");

  cy.get("@clusterRegion").click();

  cy.findByRole("listbox").within(() => {
    cy.findByRole("option", { name: /us-east-1/i }).click();
  });

  cy.findAllByRole("combobox").eq(3).as("instanceSize");

  cy.get("@instanceSize").click();

  cy.findByRole("listbox").within(() => {
    cy.findByRole("option", { name: /t2.nano/i }).click();
  });
};

describe("Test to validate physical cluster creation", () => {
  beforeEach(() => {
    const username = Cypress.env("USERNAME");
    const password = Cypress.env("PASSWORD");

    cy.login(username, password);
  });

  if (isAWS) {
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

      fillOutForm();

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

      cy.goClusterManagement();

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

      cy.goClusterManagement();

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
  } else {
    it("Test not run because the cloud provider is not AWS", () => {
      cy.log("Skipping test because the cloud provider is not AWS");
    });
  }
});
