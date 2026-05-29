import { describe, it, expect } from "vitest";
import { z } from "zod";
import { NextRequest } from "next/server";
import {
  ok,
  created,
  list,
  noContent,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  internalError,
  zodError,
  parseBody,
  withErrorHandler,
} from "@/lib/api-response";

describe("api-response — success helpers", () => {
  it("ok() returns 200 with data envelope", async () => {
    const res = ok({ id: 1, name: "Test" });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ data: { id: 1, name: "Test" } });
  });

  it("created() returns 201 with data envelope", async () => {
    const res = created({ id: 2, name: "New" });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body).toEqual({ data: { id: 2, name: "New" } });
  });

  it("list() returns 200 with data array and pagination meta", async () => {
    const items = [{ id: 1 }, { id: 2 }];
    const meta = { page: 1, pageSize: 25, total: 2, totalPages: 1 };
    const res = list(items, meta);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ data: items, meta });
  });

  it("noContent() returns 204 with no body", () => {
    const res = noContent();
    expect(res.status).toBe(204);
    expect(res.body).toBeNull();
  });
});

describe("api-response — error helpers", () => {
  it("badRequest() returns 400 with BAD_REQUEST code", async () => {
    const res = badRequest("Name is required");
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe("BAD_REQUEST");
    expect(body.error.message).toBe("Name is required");
    expect(body.error.correlationId).toBeTypeOf("string");
  });

  it("badRequest() includes field-level details when provided", async () => {
    const details = { name: ["Required"], email: ["Invalid format"] };
    const res = badRequest("Validation failed", details);
    const body = await res.json();
    expect(body.error.details).toEqual(details);
  });

  it("unauthorized() returns 401 with UNAUTHORIZED code", async () => {
    const res = unauthorized();
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error.code).toBe("UNAUTHORIZED");
    expect(body.error.message).toBe("Authentication required");
  });

  it("unauthorized() accepts custom message", async () => {
    const res = unauthorized("Token expired");
    const body = await res.json();
    expect(body.error.message).toBe("Token expired");
  });

  it("forbidden() returns 403 with FORBIDDEN code", async () => {
    const res = forbidden();
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error.code).toBe("FORBIDDEN");
  });

  it("notFound() returns 404 with NOT_FOUND code", async () => {
    const res = notFound("Application not found");
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error.code).toBe("NOT_FOUND");
    expect(body.error.message).toBe("Application not found");
  });

  it("conflict() returns 409 with CONFLICT code", async () => {
    const res = conflict("Duplicate name");
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.error.code).toBe("CONFLICT");
  });

  it("internalError() returns 500 with INTERNAL_ERROR code", async () => {
    const res = internalError();
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error.code).toBe("INTERNAL_ERROR");
  });

  it("each error response includes a unique correlationId", async () => {
    const r1 = await badRequest("err").json();
    const r2 = await badRequest("err").json();
    expect(r1.error.correlationId).not.toBe(r2.error.correlationId);
  });
});

describe("api-response — zodError()", () => {
  it("converts ZodError into 400 with per-field details", async () => {
    const schema = z.object({
      name: z.string().min(1),
      age: z.number().int().min(0),
    });
    const result = schema.safeParse({ name: "", age: -1 });
    expect(result.success).toBe(false);

    const res = zodError((result as { success: false; error: z.ZodError }).error);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe("BAD_REQUEST");
    expect(body.error.details).toHaveProperty("name");
    expect(body.error.details).toHaveProperty("age");
  });
});

describe("api-response — parseBody()", () => {
  const schema = z.object({ name: z.string(), count: z.number() });

  it("returns parsed data for valid JSON body", async () => {
    const req = new Request("http://localhost/", {
      method: "POST",
      body: JSON.stringify({ name: "test", count: 5 }),
      headers: { "Content-Type": "application/json" },
    });
    const result = await parseBody(req, schema);
    expect("data" in result).toBe(true);
    if ("data" in result) {
      expect(result.data).toEqual({ name: "test", count: 5 });
    }
  });

  it("returns 400 error for invalid JSON", async () => {
    const req = new Request("http://localhost/", {
      method: "POST",
      body: "not-json",
      headers: { "Content-Type": "application/json" },
    });
    const result = await parseBody(req, schema);
    expect("error" in result).toBe(true);
    if ("error" in result) {
      expect(result.error.status).toBe(400);
    }
  });

  it("returns 400 error for schema validation failure", async () => {
    const req = new Request("http://localhost/", {
      method: "POST",
      body: JSON.stringify({ name: 42, count: "not-a-number" }),
      headers: { "Content-Type": "application/json" },
    });
    const result = await parseBody(req, schema);
    expect("error" in result).toBe(true);
  });
});

describe("api-response — withErrorHandler()", () => {
  it("passes through normal handler response", async () => {
    const handler = withErrorHandler(async () => ok({ success: true }));
    const req = new NextRequest("http://localhost/");
    const res = await handler(req, { params: Promise.resolve({}) });
    expect(res.status).toBe(200);
  });

  it("catches thrown errors and returns 500", async () => {
    const handler = withErrorHandler(async () => {
      throw new Error("Something exploded");
    });
    const req = new NextRequest("http://localhost/");
    const res = await handler(req, { params: Promise.resolve({}) });
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error.code).toBe("INTERNAL_ERROR");
  });
});
