/**
 * Step 4.1 — API Response Helpers
 *
 * Standard JSON response envelope, error formatting (4xx/5xx),
 * and typed request/response helpers for all API route handlers.
 *
 * Response envelope:
 *   { data: T }                         — success (single item)
 *   { data: T[], meta: PaginationMeta } — success (list)
 *   { error: { code, message, details?, correlationId } } — error
 */

import { NextRequest, NextResponse } from "next/server";
import { ZodError, type ZodSchema } from "zod";
import { randomUUID } from "crypto";

// ── Types ───────────────────────────────────────────────────────────────────

/** Envelope for a single-item success response. */
export interface ApiSuccessResponse<T> {
  data: T;
}

/** Pagination metadata for list responses. */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/** Envelope for a paginated list success response. */
export interface ApiListResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/** Standard error body. */
export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
    correlationId: string;
  };
}

// ── Success Helpers ─────────────────────────────────────────────────────────

/** 200 OK with single item. */
export function ok<T>(data: T): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json({ data }, { status: 200 });
}

/** 201 Created with single item. */
export function created<T>(data: T): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json({ data }, { status: 201 });
}

/** 200 OK with paginated list. */
export function list<T>(data: T[], meta: PaginationMeta): NextResponse<ApiListResponse<T>> {
  return NextResponse.json({ data, meta }, { status: 200 });
}

/** 204 No Content (e.g. after DELETE). */
export function noContent(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

// ── Error Helpers ───────────────────────────────────────────────────────────

function errorResponse(
  status: number,
  code: string,
  message: string,
  details?: Record<string, string[]>
): NextResponse<ApiErrorBody> {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        ...(details ? { details } : {}),
        correlationId: randomUUID(),
      },
    },
    { status }
  );
}

/** 400 Bad Request — validation or malformed input. */
export function badRequest(
  message: string,
  details?: Record<string, string[]>
): NextResponse<ApiErrorBody> {
  return errorResponse(400, "BAD_REQUEST", message, details);
}

/** 401 Unauthorized — missing or invalid authentication. */
export function unauthorized(message = "Authentication required"): NextResponse<ApiErrorBody> {
  return errorResponse(401, "UNAUTHORIZED", message);
}

/** 403 Forbidden — authenticated but not permitted. */
export function forbidden(message = "Permission denied"): NextResponse<ApiErrorBody> {
  return errorResponse(403, "FORBIDDEN", message);
}

/** 404 Not Found. */
export function notFound(message = "Resource not found"): NextResponse<ApiErrorBody> {
  return errorResponse(404, "NOT_FOUND", message);
}

/** 409 Conflict — duplicate or state conflict. */
export function conflict(message: string): NextResponse<ApiErrorBody> {
  return errorResponse(409, "CONFLICT", message);
}

/** 500 Internal Server Error — unexpected failure. */
export function internalError(message = "Internal server error"): NextResponse<ApiErrorBody> {
  return errorResponse(500, "INTERNAL_ERROR", message);
}

// ── Validation ──────────────────────────────────────────────────────────────

/**
 * Parse and validate a request body against a Zod schema.
 * Returns the parsed data or a 400 response with field-level details.
 */
export async function parseBody<T>(
  request: Request,
  schema: ZodSchema<T>
): Promise<{ data: T } | { error: NextResponse<ApiErrorBody> }> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return { error: badRequest("Invalid JSON body") };
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    return { error: zodError(result.error) };
  }

  return { data: result.data };
}

/** Convert a ZodError into a 400 response with per-field details. */
export function zodError(err: ZodError): NextResponse<ApiErrorBody> {
  const details: Record<string, string[]> = {};
  for (const issue of err.issues) {
    const path = issue.path.join(".") || "_root";
    if (!details[path]) details[path] = [];
    details[path].push(issue.message);
  }
  return badRequest("Validation failed", details);
}

// ── Route Handler Wrapper ───────────────────────────────────────────────────

/**
 * Wraps a route handler with error catching.
 * Catches thrown errors and returns a standardised 500 response.
 * Use this to avoid unhandled promise rejections in route handlers.
 *
 * @example
 * export const GET = withErrorHandler(async (req) => {
 *   const items = await db.select().from(table);
 *   return ok(items);
 * });
 */
export function withErrorHandler<
  TContext extends { params: Promise<Record<string, string>> } = {
    params: Promise<Record<string, string>>;
  },
>(
  handler: (request: NextRequest, context: TContext) => Promise<Response>
): (request: NextRequest, context?: TContext) => Promise<Response> {
  return async (
    request: NextRequest,
    context: TContext = { params: Promise.resolve({}) } as TContext
  ): Promise<Response> => {
    try {
      return await handler(request, context);
    } catch (err) {
      // Log the actual error for observability — will be replaced with Pino in Phase 8+
      console.error("[API Error]", err);
      return internalError();
    }
  };
}
