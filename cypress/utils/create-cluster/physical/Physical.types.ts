import { Account } from "../../../../types/accouts";

type ClusterOptions = {
  name: string;
  region: RegExp;
  intanceSize: RegExp;
};

export abstract class PhysicalClusterClass {
  abstract login(username: string, password: string): void;
  abstract visitClusterPage(): void;
  abstract getWorkloadClusterButton(): Cypress.Chainable<JQuery<HTMLElement>>;
  abstract getButtonCreateCluster(): Cypress.Chainable<JQuery<HTMLElement>>;
  abstract getClodAccounts(): Promise<Account[]>;
  abstract getRegion(clusterName: string): Promise<string>;
  abstract fillOutCivoForm({ name, region, intanceSize }: ClusterOptions): void;
  abstract getClusterProvisioningStatusButton(
    clusterName: string
  ): Cypress.Chainable<JQuery<HTMLElement>>;
}
