import * as Sentry from "@sentry/cloudflare";

// Ensure environment variables are loaded if necessary
import * as dotenv from "dotenv";
dotenv.config(); // Uncomment if you need to load .env locally for functions

export const onRequest = [
  // Make sure Sentry is the first middleware
  Sentry.sentryPagesPlugin((context) => ({
    dsn: process.env.SENTRY_DSN || "", // Use environment variable for DSN
    // Set tracesSampleRate to 1.0 to capture 100% of spans for tracing.
    // Learn more at
    // https://docs.sentry.io/platforms/javascript/configuration/options/#traces-sample-rate
    tracesSampleRate: 1.0,
    // Consider adding other Sentry options here if needed
    // release: process.env.YOUR_RELEASE_VERSION, // Example: Set release version
  })),
  // Add other Cloudflare Pages middlewares here if you have any
  // async (context) => {
  //   // Your custom middleware logic
  //   return await context.next();
  // },
];
