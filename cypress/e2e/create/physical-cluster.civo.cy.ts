import ms from "ms";

import { Account } from "../../../types/accouts";

import { fillOutForm } from "../../utils";

const CLUSTER_NAME = Cypress.env("CLUSTER_NAME");
const isCivo = Cypress.env("CLOUD_PROVIDER") === "civo";
const MAX_TIME_TO_WAIT = Cypress.env("MAX_TIME_TO_WAIT");

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

  it.skip("should create a physical cluster", () => {
    cy.visit("/");

    cy.goClusters();

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

    cy.get(".management-cluster").invoke("text").as("mainCluster");

    cy.get("@mainCluster").then((mainClusterText: unknown) => {
      const region = (mainClusterText as string).match(/civo:(.*?)(?=nodes:)/i);
      cy.wrap(region.at(1)).as("region");
    });

    cy.get("@region").then((region: unknown) => {
      cy.get("@button").click();

      fillOutForm({
        name: CLUSTER_NAME,
        region: new RegExp(region as string, "i"),
        intanceSize: new RegExp("g4s.kube.small", "i"),
      });
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

  it.skip("should validate the cluster is provisioning", () => {
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
      cy.findByText(/available/i, {
        timeout: Number(ms(MAX_TIME_TO_WAIT)),
      }).should("exist");
    });
  });
});
