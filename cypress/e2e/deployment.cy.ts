import "@testing-library/cypress/add-commands";
const user_name: string = "kbot";
let cluster_name: string = Cypress.env("CLUSTER_NAME");
let time_in_minutes = Cypress.env("TIMEOUT");
const totalDuration = time_in_minutes * 60000;
let password: string = "",
  domain: string = "",
  subdomain: string = "";

const checkStatusCode = (
  url: string
): Promise<{ status: boolean; error: string }> => {
  return new Promise((resolve, reject) => {
    cy.exec(`node checkStatus.js ${url} ${totalDuration}`, {
      timeout: totalDuration,
    }).then((result) => {
      try {
        const response = JSON.parse(result.stdout);

        // Check response code and status
        if (response.code === 0 && response.status === 200) {
          return { status: true, error: "" };
        } else {
          return { status: false, error: result.stderr };
        }
      } catch (e) {
        reject(new Error(`Failed to parse response: ${e.message}`));
      }
    });
  });
};

const requestUrl: string = `https://console-staging.mgmt-24.konstruct.io/api/proxy?url=/cluster/${cluster_name}`;

const checkRunning = (url: string) => {
  cy.visit(url);
  cy.findByText(/running/i).should("exist");
};

const getpassword = () => {
  return cy
    .request({
      method: "GET",
      url: requestUrl,
      followRedirect: true,
    })
    .then((response) => {
      const cluster = response.body;
      expect(cluster).to.have.property("vault_auth");
      expect(cluster.vault_auth).to.have.property("kbot_password");
      expect(cluster).to.have.property("domain_name");
      password = cluster.vault_auth.kbot_password;
      domain = cluster.domain_name;
      subdomain = String(cluster.subdomain_name);
      return { password, domain, subdomain };
    });
};

describe.skip("Kubefirst Console", () => {
  it("Get Kbot password", () => {
    const url: string = requestUrl;
    if (!checkStatusCode(url))
      throw new Error(
        `Timed out after ${
          totalDuration / 60000
        } minutes waiting for status code 200 for ${url}.`
      );
    getpassword();
  });

  it("Login in through vault", () => {
    getpassword().then(({ password, domain, subdomain }) => {
      let baseUrl: string = "";
      if (subdomain.length > 0)
        baseUrl = `https://kubefirst.${subdomain}.${domain}/dashboard/applications`;
      else baseUrl = `https://kubefirst.${domain}/dashboard/applications`;
      cy.log(`Kbot Password: ${password}`);
      cy.log(`Domain Name: ${domain}`);
      cy.log(`Base URL: ${baseUrl}`);
      if (!checkStatusCode(baseUrl))
        throw new Error(
          `Timed out after ${
            totalDuration / 60000
          } minutes waiting for status code 200 for ${url}.`
        );
      cy.visit(baseUrl);
      cy.findByRole("button", {
        name: /vault\-icon log in with vault/i,
      }).click();
      cy.findByRole("combobox", { name: /method/i }).select("Username");
      cy.findByRole("textbox", { name: /username/i })
        .clear()
        .type(user_name);
      cy.get('input[name="password"]').type(password);
      cy.findByRole("button", { name: /sign in/i }).click();
    });
  });

  it("Metaphor Development", () => {
    getpassword().then(({ password, domain, subdomain }) => {
      const url =
        subdomain.length > 0
          ? `https://metaphor-development.${subdomain}.${domain}`
          : `https://metaphor-development.${domain}`;

      cy.log(`Constructed URL: ${url}`);

      checkStatusCode(url).then(({ status, error }) => {
        if (!status) {
          throw new Error(
            `Timed out after ${
              totalDuration / 60000
            } minutes waiting for status code 200 for ${url}  ${error}`
          );
        } else {
          checkRunning(url);
        }
      });
    });
  });

  it("Metaphor Staging", () => {
    getpassword().then(({ password, domain, subdomain }) => {
      const url =
        subdomain.length > 0
          ? `https://metaphor-staging.${subdomain}.${domain}`
          : `https://metaphor-staging.${domain}`;

      cy.log(`Constructed URL: ${url}`);

      checkStatusCode(url).then(({ status, error }) => {
        if (!status) {
          throw new Error(
            `Timed out after ${
              totalDuration / 60000
            } minutes waiting for status code 200 for ${url}  ${error}`
          );
        } else {
          checkRunning(url);
        }
      });
    });
  });

  it("Metaphor Production", () => {
    getpassword().then(({ password, domain, subdomain }) => {
      const url =
        subdomain.length > 0
          ? `https://metaphor-production.${subdomain}.${domain}`
          : `https://metaphor-production.${domain}`;

      cy.log(`Constructed URL: ${url}`);

      checkStatusCode(url).then(({ status, error }) => {
        if (!status) {
          throw new Error(`${error}`);
        } else {
          checkRunning(url);
        }
      });
    });
  });
});
