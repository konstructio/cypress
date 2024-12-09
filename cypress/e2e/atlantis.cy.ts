describe("Test Login", () => {
  it("should do a login and validate cluster data", async () => {
    const username = Cypress.env("USERNAME");
    const password = Cypress.env("PASSWORD");

    cy.login(username, password);

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
      expect(response.body.length).to.equal(2);

      const [cluster] = response.body;

      expect(cluster).to.have.property("git_auth");
      expect(cluster.git_auth).to.have.property("git_token");
      expect(cluster.git_auth).to.have.property("git_owner");

      cy.wrap(cluster).as("cluster");
    });

    cy.get("@cluster").then((cluster: any) => {
      const { subdomain_name: subdomain, domain_name: domain } = cluster;

      if (subdomain) {
        cy.visit(`https://atlantis.${subdomain}.${domain}`);
      } else {
        cy.visit(`https://atlantis.${domain}`);
      }
    });
  });
});
