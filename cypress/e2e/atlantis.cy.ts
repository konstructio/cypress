import camelcaseKeys from "camelcase-keys";
import ms from "ms";

const MAX_TIME_TO_WAIT = Cypress.env("MAX_TIME_TO_WAIT");

describe("Test atlantis is working correctly", () => {
  beforeEach(() => {
    const username = Cypress.env("USERNAME");
    const password = Cypress.env("PASSWORD");

    cy.login(username, password);
  });

  beforeEach(() => {
    cy.wait(2000);

    cy.request({
      method: "GET",
      url: "/api/proxy?url=%2Fcluster",
      headers: {
        "Content-type": "application/json",
        Accept: "application/json",
      },
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.length).to.greaterThan(0);

      const [cluster] = response.body;

      cy.log("Cluster data: ", cluster);

      expect(cluster).to.have.property("git_auth");
      expect(cluster.git_auth).to.have.property("git_token");
      expect(cluster.git_auth).to.have.property("git_owner");
      expect(cluster.git_auth).to.have.property("git_username");

      cy.wrap(cluster).as("clusterData");
    });
  });

  it("should verify the atlantis is up", async () => {
    cy.get("@clusterData").then((cluster: any) => {
      const { subdomain_name: subdomain, domain_name: domain } = cluster;

      if (subdomain) {
        cy.visit(`https://atlantis.${subdomain}.${domain}`);
      } else {
        cy.visit(`https://atlantis.${domain}`);
      }
    });
  });

  it("should create a PR inside the github page", () => {
    cy.get("@clusterData").then(({ git_auth }: any) => {
      const { gitToken, gitOwner, gitUsername } = camelcaseKeys(git_auth);

      cy.visit("/");
      cy.wait(2000);

      cy.get(".management-cluster").click();

      cy.findAllByRole("link").eq(1).as("github");

      cy.get("@github")
        .invoke("attr", "href")
        .then((href) => {
          cy.log(`The repository is: ${href}`);
          const [base] = href.replace("https://", "").split("/tree/");
          cy.log(`The base repository is: ${base}`);
          cy.wrap(base).as("baseRepository");
        });

      cy.get("@baseRepository").then((baseRepository: unknown) => {
        cy.task("createAtlantisPullRequestOnGithub", {
          gitOwner,
          gitToken,
          gitUsername,
          baseRepository,
        }).then(({ createPullRequest }: any) => {
          if (createPullRequest) {
            cy.get("@clusterData").then((cluster: any) => {
              const {
                subdomain_name: subdomain,
                domain_name: domain,
                git_auth: git,
              } = cluster;

              cy.wait(20000);

              if (subdomain) {
                cy.visit(`https://atlantis.${subdomain}.${domain}`);
              } else {
                cy.visit(`https://atlantis.${domain}`);
              }

              cy.findAllByText(new RegExp(`${git.git_owner}/gitops`, "i"), {
                timeout: Number(ms(MAX_TIME_TO_WAIT)),
              }).should("exist");

              cy.wait(50000);

              cy.task("applyAtlantisPlan", {
                gitOwner,
                gitToken,
                gitUsername,
                baseRepository,
              }).then(({ apply }: any) => {
                if (apply) {
                  cy.wait(50000);
                  cy.reload();
                  cy.findAllByText(
                    new RegExp(`${git.git_owner}/gitops`, "i")
                  ).should("not.exist");
                }
              });
            });
          }
        });
      });
    });
  });
});
