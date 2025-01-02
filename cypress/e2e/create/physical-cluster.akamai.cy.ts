import ms from "ms";

import { PhysicalCluster } from "../../utils/create-cluster/physical";

const CLUSTER_NAME = Cypress.env("CLUSTER_NAME");
const cloudProvider = Cypress.env("CLOUD_PROVIDER");
const MAX_TIME_TO_WAIT = Cypress.env("MAX_TIME_TO_WAIT");
const isAkamai = cloudProvider === "akamai";

describe("Test to validate physical cluster creation on AKAMAI", () => {
  const physicalCluster = new PhysicalCluster();

  beforeEach(function () {
    if (!isAkamai) {
      cy.log("This test is only for AKAMAI");

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

    workloadButton.click();

    const region = physicalCluster.getRegion(cloudProvider);

    region.then((region) => {
      physicalCluster.filloutAkamaiForm({
        name: CLUSTER_NAME,
        region: new RegExp(region, "i"),
        intanceSize: new RegExp("g6-standard-6", "i"),
      });

      const createCluterButton = physicalCluster.getButtonCreateCluster();

      createCluterButton.click();

      cy.wait(2000);

      cy.findByRole("heading", {
        name: new RegExp(CLUSTER_NAME, "i"),
        timeout: Number(ms(MAX_TIME_TO_WAIT)),
      }).should("exist");

      cy.contains("Provisioning").should("exist");
    });
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
