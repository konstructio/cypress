type ClusterOptions = {
  name: string;
  region: RegExp;
  intanceSize: RegExp;
};

export const fillOutForm = ({ name, region, intanceSize }: ClusterOptions) => {
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
};
