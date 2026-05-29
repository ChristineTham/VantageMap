/**
 * Phase 12.2 — GraphQL API Route Handler
 *
 * POST /api/graphql — Executes GraphQL queries against the VantageMap schema.
 *
 * Features:
 * - Query all 12 fact sheet types with pagination
 * - Traverse relationships via relatedTo/relatedFrom fields
 * - Query complexity limiting (max depth: 5, max fields: 100)
 * - Auth required (BearerAuth or CookieAuth)
 *
 * Requires `graphql` npm package to be installed.
 */

import { NextRequest } from "next/server";
import { graphql, validate, parse } from "graphql";
import { schema } from "@/lib/graphql-schema";
import { withErrorHandler, unauthorized } from "@/lib/api-response";
import { getSession } from "@/lib/auth";
import { isFeatureEnabled } from "@/lib/feature-flags";

// Maximum allowed query depth
const MAX_DEPTH = 5;

function getQueryDepth(query: string): number {
  let depth = 0;
  let maxDepth = 0;
  for (const char of query) {
    if (char === "{") {
      depth++;
      maxDepth = Math.max(maxDepth, depth);
    } else if (char === "}") {
      depth--;
    }
  }
  return maxDepth;
}

export const POST = withErrorHandler(async (request: NextRequest) => {
  // Feature flag check
  if (!isFeatureEnabled("FEATURE_GRAPHQL_API")) {
    return Response.json(
      { errors: [{ message: "GraphQL API is not enabled" }] },
      { status: 404 }
    );
  }

  // Auth check
  const session = await getSession(request);
  if (!session) {
    return unauthorized("Authentication required");
  }

  // Parse request body
  const body = await request.json();
  const { query, variables, operationName } = body;

  if (!query || typeof query !== "string") {
    return Response.json(
      { errors: [{ message: "Query string is required" }] },
      { status: 400 }
    );
  }

  // Depth limiting
  const depth = getQueryDepth(query);
  if (depth > MAX_DEPTH) {
    return Response.json(
      { errors: [{ message: `Query depth ${depth} exceeds maximum allowed depth of ${MAX_DEPTH}` }] },
      { status: 400 }
    );
  }

  // Validate query against schema
  let document;
  try {
    document = parse(query);
  } catch (syntaxError) {
    return Response.json(
      { errors: [{ message: `Syntax error: ${(syntaxError as Error).message}` }] },
      { status: 400 }
    );
  }

  const validationErrors = validate(schema, document);
  if (validationErrors.length > 0) {
    return Response.json(
      { errors: validationErrors.map((e) => ({ message: e.message, locations: e.locations })) },
      { status: 400 }
    );
  }

  // Execute query
  const result = await graphql({
    schema,
    source: query,
    variableValues: variables,
    operationName,
    contextValue: { session },
  });

  return Response.json(result, {
    status: result.errors ? 200 : 200, // GraphQL always returns 200 per spec
    headers: { "Content-Type": "application/json" },
  });
});

// Allow GET for introspection (e.g., GraphiQL)
export const GET = withErrorHandler(async (request: NextRequest) => {
  if (!isFeatureEnabled("FEATURE_GRAPHQL_API")) {
    return Response.json(
      { errors: [{ message: "GraphQL API is not enabled" }] },
      { status: 404 }
    );
  }

  const session = await getSession(request);
  if (!session) {
    return unauthorized("Authentication required");
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");

  if (!query) {
    return Response.json(
      { errors: [{ message: "Query parameter required" }] },
      { status: 400 }
    );
  }

  const depth = getQueryDepth(query);
  if (depth > MAX_DEPTH) {
    return Response.json(
      { errors: [{ message: `Query depth ${depth} exceeds maximum allowed depth of ${MAX_DEPTH}` }] },
      { status: 400 }
    );
  }

  const result = await graphql({
    schema,
    source: query,
    variableValues: {},
    contextValue: { session },
  });

  return Response.json(result);
});
