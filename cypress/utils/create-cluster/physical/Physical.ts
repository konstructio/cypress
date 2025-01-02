import { Account } from "../../../../types/accouts";

import { PhysicalClusterClass } from "./Physical.types";

export class PhysicalCluster extends PhysicalClusterClass {
  login(username: string, password: string) {
    cy.login(username, password);
  }

  visitClusterPage() {
    cy.visit("/");

    cy.goClusters();
  }

  getWorkloadClusterButton(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.findByRole("button", { name: /add workload cluster/i });
  }

  getButtonCreateCluster(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.findByRole("button", { name: /create cluster/i });
  }

  async getClodAccounts(): Promise<Account[]> {
    return new Promise((resolve) => {
      cy.request("GET", "/api/proxy?url=%2Fcloud-account").then(
        ({ status, body }) => {
          expect(status).to.eq(200);

          const { cloud_accounts: cloudAccounts } = body;
          resolve(cloudAccounts as Account[]);
        }
      );
    });
  }

  async getRegion(clusterName: string): Promise<string> {
    return new Promise((resolve) => {
      cy.get(".management-cluster").invoke("text").as("mainCluster");

      cy.get("@mainCluster").then((mainClusterText: unknown) => {
        const region = (mainClusterText as string).match(
          new RegExp(`${clusterName}:(.*?)(?=nodes:)`, "i")
        );

        resolve(region.at(1));
      });
    });
  }

  fillOutCivoForm({ name, region, intanceSize }) {
    cy.get("form").as("form");
    cy.get("@form").should("exist");

    cy.findByRole("textbox").type(name, {
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
      cy.findByRole("option", { name: new RegExp(region, "i") }).click();
    });

    cy.findAllByRole("combobox").eq(3).as("instanceSize");

    cy.get("@instanceSize").click();

    cy.findByRole("listbox").within(() => {
      cy.findByRole("option", { name: intanceSize }).click();
    });
  }

  getClusterProvisioningStatusButton(
    clusterName: string
  ): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy
      .findAllByRole("button", { name: new RegExp(clusterName, "i") })
      .eq(0);
  }
}
