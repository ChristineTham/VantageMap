/**
 * Phase 12.1 — Interactive API Documentation (Swagger UI)
 *
 * Serves a Swagger UI page at /api/docs using the scalar/api-reference
 * CDN build (no npm install required — loaded via script tag).
 */

export default function ApiDocsPage() {
  return (
    <html lang="en">
      <head>
        <title>VantageMap API Documentation</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <div
          id="api-reference"
          data-url="/api/docs/openapi.json"
          data-configuration={JSON.stringify({
            theme: "purple",
            layout: "modern",
            hiddenClients: true,
            darkMode: false,
          })}
        />
        {/* Scalar API Reference — lightweight OpenAPI viewer loaded from CDN */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference" />
      </body>
    </html>
  );
}
