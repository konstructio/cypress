import { defineConfig } from "cypress";
import "dotenv/config";

import {
  createAtlantisPullRequestOnGithub,
  applyAtlantisPlan,
} from "./cypress/utils/github";

export default defineConfig({
  e2e: {
    baseUrl: process.env.CLUSTER_DOMAIN,
    env: {
      USERNAME: process.env.USERNAME,
      PASSWORD: process.env.PASSWORD,
      RETRY_DELAY: process.env.RETRY_DELAY || 10000,
      CLOUD_PROVIDER: process.env.CLOUD_PROVIDER,
      MAX_TIME_TO_WAIT: process.env.MAX_TIME_TO_WAIT || "1h",
      CLUSTER_NAME: process.env.CLUSTER_NAME || "test-cluster",
    },
    viewportWidth: 2000,
    viewportHeight: 900,
    supportFile: "cypress/support/e2e.ts",
    retries: {
      runMode: +process.env.RETRIES_RUN_MODE || 1,
      openMode: +process.env.RETRIES_OPEN_MODE || 0,
    },
    setupNodeEvents(on) {
      on("task", {
        createAtlantisPullRequestOnGithub,
        applyAtlantisPlan,
      });
    },
  },
});
