import ms from "ms";

import { PhysicalCluster } from "../../utils/create-cluster/physical";

const CLUSTER_NAME = Cypress.env("CLUSTER_NAME");
const isCivo = Cypress.env("CLOUD_PROVIDER") === "civo";
const MAX_TIME_TO_WAIT = Cypress.env("MAX_TIME_TO_WAIT");

describe("Test to validate physical cluster creation", () => {
  const physicalCluster = new PhysicalCluster();

  beforeEach(function () {
    if (!isCivo) {
      cy.log("This test is only for Civo");

      this.skip();
    }
  });

  beforeEach(() => {
    const username = Cypress.env("USERNAME");
    const password = Cypress.env("PASSWORD");

    physicalCluster.login(username, password);
  });

  it("should create a physical cluster", async () => {
    physicalCluster.visitClusterPage();

    const workloadButton = physicalCluster.getWorkloadClusterButton();

    const cloudAccounts = await physicalCluster.getClodAccounts();

    expect(cloudAccounts).to.be.an("array");
    expect(cloudAccounts).to.have.length.greaterThan(0);

    const defaultAccount = cloudAccounts.find(
      (account) => account.name === "default"
    );

    expect(defaultAccount).to.exist;

    const region = await physicalCluster.getRegion("civo");

    workloadButton.click();

    physicalCluster.fillOutCivoForm({
      name: CLUSTER_NAME,
      region: new RegExp(region, "i"),
      intanceSize: new RegExp("g4s.kube.small", "i"),
    });

    const createCluterButton = physicalCluster.getButtonCreateCluster();

    createCluterButton.click();

    cy.wait(2000);

    cy.findByRole("heading", { name: new RegExp(CLUSTER_NAME, "i") }).should(
      "exist"
    );

    cy.contains("Provisioning").should("exist");
  });

  it("should validate the cluster is provisioning", () => {
    physicalCluster.visitClusterPage();

    const provisioningButton =
      physicalCluster.getClusterProvisioningStatusButton(CLUSTER_NAME);

    provisioningButton.should("exist");

    provisioningButton.within(() => {
      cy.findByText(/provisioning/i, {
        timeout: Number(ms(MAX_TIME_TO_WAIT)),
      }).should("exist");
    });
  });

  it("should validate the cluster is provisioned", { retries: 3 }, () => {
    physicalCluster.visitClusterPage();

    const provisioningButton =
      physicalCluster.getClusterProvisioningStatusButton(CLUSTER_NAME);

    provisioningButton.should("exist");

    provisioningButton.within(() => {
      cy.findByText(/available/i, {
        timeout: Number(ms(MAX_TIME_TO_WAIT)),
      }).should("exist");
    });
  });
});
