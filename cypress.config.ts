import { defineConfig } from "cypress";
import * as dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  e2e: {
    baseUrl: process.env.CLUSTER_DOMAIN,
    env: {
      USERNAME: process.env.USERNAME,
      PASSWORD: process.env.PASSWORD,
    },
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    viewportWidth: 2000,
    viewportHeight: 900,
  },
});
