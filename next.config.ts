import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        // Prevents the browser from MIME-sniffing responses
        {
          key: "X-Content-Type-Options",
          value: "nosniff",
        },
        // Blocks clickjacking via iframes
        {
          key: "X-Frame-Options",
          value: "DENY",
        },
        // Forces HTTPS for 1 year, includes subdomains
        {
          key: "Strict-Transport-Security",
          value: "max-age=31536000; includeSubDomains",
        },
        // Stops referrer leaking to external domains
        {
          key: "Referrer-Policy",
          value: "strict-origin-when-cross-origin",
        },
        // Restricts browser features not needed by the app
        {
          key: "Permissions-Policy",
          value: "camera=(), microphone=(), geolocation=()",
        },
        // Content Security Policy
        // - default-src self: blocks everything not explicitly allowed
        // - script-src self + unsafe-inline: required by Next.js App Router
        // - style-src self + unsafe-inline: required by Tailwind inline styles
        // - img-src: allow self, data URIs (base64 fallback), and Cloudinary CDN
        // - connect-src: allow self and Upstash REST API for rate limiter
        // - frame-ancestors none: redundant with X-Frame-Options but belt-and-suspenders
        {
          key: "Content-Security-Policy",
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: blob: https://res.cloudinary.com https://replicate.delivery",
            "font-src 'self'",
            "connect-src 'self' https://*.upstash.io",
            "frame-src 'none'",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'",
          ].join("; "),
        },
      ],
    },
  ],
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "akash-pl",

  project: "nextflow",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
});
