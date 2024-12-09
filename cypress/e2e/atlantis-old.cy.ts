import "@testing-library/cypress/add-commands";

let git_owner: string = "",
  git_token: string = "",
  git_username: string = "",
  subdomain: string = "",
  domain: string = "";
let cluster_name: string = Cypress.env("CLUSTER_NAME");
const requestUrl: string = `https://console-staging.mgmt-24.konstruct.io/api/proxy?url=/cluster/${cluster_name}`;

const checkStatusCode = () => {
  cy.log(git_owner, git_token, git_username);
  return cy
    .exec(`node git-status.js ${git_username} ${git_token} ${git_owner}`, {
      timeout: 1200000,
    })
    .then((result) => {
      try {
        const response = JSON.parse(result.stdout);
        if (response.code === 0) {
          return { status: true, error: "" };
        } else {
          return { status: false, error: result.stderr };
        }
      } catch (e) {}
    });
};

const getgitceredintals = () => {
  return cy
    .request({
      method: "GET",
      url: requestUrl,
      followRedirect: true,
    })
    .then((response) => {
      const cluster = response.body;
      expect(cluster).to.have.property("git_auth");
      expect(cluster.git_auth).to.have.property("git_token");
      expect(cluster.git_auth).to.have.property("git_owner");
      git_owner = cluster.git_auth.git_owner;
      git_token = cluster.git_auth.git_token;
      git_username = cluster.git_auth.git_username;
      subdomain = cluster.subdomain_name;
      domain = cluster.domain_name;
      return { git_owner, git_token, subdomain, domain };
    });
};

describe.skip("Altantis Check", () => {
  it("Run Atlanis Shell", () => {
    getgitceredintals().then(({ git_owner, git_token, subdomain, domain }) => {
      if (!checkStatusCode())
        throw Error("Error in running applying changes to gitops repo");
    });
  });
  it("Check Pull Request on Repo", () => {
    getgitceredintals().then(({ git_owner, git_token, subdomain, domain }) => {
      let gitops_url: string = " ";
      if (subdomain.length > 0)
        gitops_url = `https://atlantis.${subdomain}.${domain}`;
      else gitops_url = `https://atlantis.${domain}`;
      cy.visit(gitops_url);
    });
  });
});
