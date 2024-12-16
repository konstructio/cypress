export const fillOutForm = (clusterName: string) => {
  cy.get("form").as("form");
  cy.get("@form").should("exist");

  cy.findByRole("textbox").type(clusterName, {
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
    cy.findByRole("option", { name: /us-east-1/i }).click();
  });

  cy.findAllByRole("combobox").eq(3).as("instanceSize");

  cy.get("@instanceSize").click();

  cy.findByRole("listbox").within(() => {
    cy.findByRole("option", { name: /t2.nano/i }).click();
  });
};
