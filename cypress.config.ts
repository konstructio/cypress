import { defineConfig } from "cypress";
import "dotenv/config";

export default defineConfig({
  e2e: {
    baseUrl: process.env.CLUSTER_DOMAIN,
    env: {
      USERNAME: process.env.USERNAME,
      PASSWORD: process.env.PASSWORD,
      RETRY_DELAY: process.env.RETRY_DELAY || 10000,
      CLOUD_PROVIDER: process.env.CLOUD_PROVIDER,
      MAX_TIME_TO_WAIT: process.env.MAX_TIME_TO_WAIT || "1h",
    },
    viewportWidth: 2000,
    viewportHeight: 900,
    supportFile: "cypress/support/e2e.ts",
    retries: {
      runMode: 3,
      openMode: 0,
    },
  },
});
