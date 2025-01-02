import { Account } from "../../../../types/accouts";

import { PhysicalClusterClass } from "./Physical.types";

export class PhysicalCluster extends PhysicalClusterClass {
  login(username: string, password: string) {
    cy.login(username, password);
  }

  visitClusterPage() {
    cy.log("Visiting cluster page");

    cy.visit("/");

    cy.goClusters();

    cy.wait(1000);

    cy.log("Visited cluster page");
  }

  getWorkloadClusterButton(): Cypress.Chainable<JQuery<HTMLElement>> {
    cy.log("Getting workload cluster button");

    return cy.findByRole("button", { name: /add workload cluster/i });
  }

  getButtonCreateCluster(): Cypress.Chainable<JQuery<HTMLElement>> {
    cy.log("Getting create cluster button");

    return cy.findByRole("button", { name: /create cluster/i });
  }

  getClodAccounts(): Cypress.Chainable {
    cy.log("Getting cloud accounts");

    cy.request("GET", "/api/proxy?url=%2Fcloud-account").then(
      ({ status, body }) => {
        expect(status).to.eq(200);

        const { cloud_accounts: cloudAccounts } = body;
        cy.log(`Cloud accounts gotten: ${cloudAccounts}`);

        cy.wrap(cloudAccounts).as("cloudAccounts");
      }
    );

    return cy.get("@cloudAccounts");
  }

  getRegion(clusterName: string): Cypress.Chainable {
    cy.log("Getting region");

    cy.get(".management-cluster").invoke("text").as("mainCluster");

    cy.get("@mainCluster").then((mainClusterText: unknown) => {
      const region = (mainClusterText as string).match(
        new RegExp(`${clusterName}:(.*?)(?=nodes:)`, "i")
      );

      cy.wrap(region.at(1)).as("region");
    });

    return cy.get("@region");
  }

  filloutCivoForm({ name, region, intanceSize }) {
    cy.log("Filling out Civo form");

    cy.get("form").should("exist");

    cy.findByRole("radio", { name: /physical/i }).click();

    cy.findByRole("textbox").type(name, {
      delay: 10,
    });

    cy.findAllByRole("combobox").eq(1).as("clusterHost");

    cy.get("@clusterHost").click();

    cy.findByRole("listbox").within(() => {
      cy.findByRole("option", { name: /default/i }).click();
    });

    cy.findAllByRole("combobox").eq(2).as("clusterRegion");

    cy.get("@clusterRegion").click();

    cy.findByRole("listbox").within(() => {
      cy.findByRole("option", { name: new RegExp(region, "i") }).click();
    });

    cy.findAllByRole("combobox").eq(3).as("instanceSize");

    cy.get("@instanceSize").click();

    cy.findByRole("listbox").within(() => {
      cy.findByRole("option", { name: intanceSize }).click();
    });

    cy.log("Filled out Civo form");
  }

  filloutAWSForm({ name, region, intanceSize }) {
    cy.log("Filling out AWS form");

    cy.get("form").should("exist");

    cy.findByRole("radio", { name: /physical/i }).click();

    cy.findByRole("textbox").type(name, {
      delay: 10,
    });

    cy.findAllByRole("combobox").eq(1).as("clusterHost");

    cy.get("@clusterHost").click();

    cy.findByRole("listbox").within(() => {
      cy.findByRole("option", { name: /default/i }).click();
    });

    cy.findAllByRole("combobox").eq(2).as("clusterRegion");

    cy.get("@clusterRegion").click();

    cy.findByRole("listbox").within(() => {
      cy.findByRole("option", { name: new RegExp(region, "i") }).click();
    });

    cy.findAllByRole("combobox").eq(3).as("instanceSize");

    cy.get("@instanceSize").click();

    cy.findByRole("listbox").within(() => {
      cy.findByRole("option", { name: intanceSize }).click();
    });

    cy.log("Filled out AWS form");
  }

  filloutAkamaiForm({ name, region, intanceSize }) {
    cy.log("Filling out Akamai form");

    cy.get("form").should("exist");

    cy.findByRole("radio", { name: /physical/i }).click();

    cy.findByRole("textbox").type(name, {
      delay: 10,
    });

    cy.findAllByRole("combobox").eq(1).as("clusterRegion");

    cy.get("@clusterRegion").click();

    cy.findByRole("listbox").within(() => {
      cy.findByRole("option", { name: new RegExp(region, "i") }).click();
    });

    cy.findAllByRole("combobox").eq(2).as("instanceSize");

    cy.get("@instanceSize").click();

    cy.findByRole("listbox").within(() => {
      cy.findByRole("option", { name: intanceSize }).click();
    });

    cy.log("Filled out Akamai form");
  }

  getClusterProvisioningStatusButton(
    clusterName: string
  ): Cypress.Chainable<JQuery<HTMLElement>> {
    cy.log("Getting cluster provisioning status button");

    return cy
      .findAllByRole("button", { name: new RegExp(clusterName, "i") })
      .eq(0);
  }
}
