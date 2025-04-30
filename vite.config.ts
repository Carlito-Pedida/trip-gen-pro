import { reactRouter } from "@react-router/dev/vite";
import {
  sentryReactRouter,
  type SentryReactRouterBuildOptions
} from "@sentry/react-router";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const sentryConfig: SentryReactRouterBuildOptions = {
  org: "node1creative-hw",
  project: "trip-gen-pro",
  // An auth token is required for uploading source maps.
  authToken:
    "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"
  // ...
};

export default defineConfig((config) => {
  return {
    plugins: [
      tailwindcss(),
      tsconfigPaths(),
      reactRouter(),
      sentryReactRouter(sentryConfig, config)
    ],
    sentryConfig,
    ssr: {
      noExternal: [/@syncfusion/]
    }
  };
});
