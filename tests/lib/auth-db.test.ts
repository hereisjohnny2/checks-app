import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockGetUser = vi.fn();
const mockCookieStore = {
  getAll: vi.fn(() => []),
  set: vi.fn(),
};

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => mockCookieStore),
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
  })),
}));

describe("auth helpers", () => {
  const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const originalAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
  });

  afterEach(() => {
    if (originalUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    else process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;

    if (originalAnon === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    else process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalAnon;

    vi.resetModules();
  });

  it("detects JWT clock-skew errors", async () => {
    const { isJwtClockSkewError } = await import("../../src/lib/auth");

    expect(isJwtClockSkewError(new Error("JWT issued at future"))).toBe(true);
    expect(isJwtClockSkewError(new Error("random failure"))).toBe(false);
  });

  it("returns the signed-in user and nulls out skewed JWT failures", async () => {
    const { getAuthenticatedUser } = await import("../../src/lib/auth");

    mockGetUser.mockResolvedValueOnce({ data: { user: { id: "user-123" } }, error: null });
    await expect(getAuthenticatedUser()).resolves.toMatchObject({ id: "user-123" });

    mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: new Error("JWT issued at future") });
    await expect(getAuthenticatedUser()).resolves.toBeNull();
  });
});

describe("db sanitization helpers", () => {
  it("sanitizes incoming acordos into valid string fields", async () => {
    const { sanitizeAcordo } = await import("../../src/lib/db");

    const payload = {
      devedor: "Ana",
      emitente: "Banco",
      tipo: "Recorrente",
      valorParcela: 2500,
      qtd: "Mensal",
      valorTotal: "",
      parcelasPagas: 0,
      valorPago: "",
      vencimento: "10/12/2026",
      periodo: "Mensal",
      status: "Pendente",
      obs: undefined,
      anotacao: "",
    };

    const sanitized = sanitizeAcordo(payload);

    expect(sanitized.devedor).toBe("Ana");
    expect(sanitized.emitente).toBe("Banco");
    expect(sanitized.valorParcela).toBe("2500");
    expect(sanitized.qtd).toBe("Mensal");
    expect(sanitized.obs).toBe("");
    expect(sanitized.anotacao).toBe("");
  });

  it("keeps only patchable acordos fields and stringifies values", async () => {
    const { pickAcordoPatch } = await import("../../src/lib/db");

    const patch = pickAcordoPatch({
      devedor: "Bia",
      tipo: "Parcelado",
      status: "Pago",
      obs: "ok",
      extra: "ignored",
    } as any);

    expect(patch).toEqual({
      devedor: "Bia",
      tipo: "Parcelado",
      status: "Pago",
      obs: "ok",
    });
    expect(patch).not.toHaveProperty("extra");
  });
});
