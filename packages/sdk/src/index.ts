/**
 * LoyaltyVIP SDK — a small, typed, zero-dependency client for the LoyaltyVIP
 * REST API (https://loyaltyvip.com/developers). Works in Node 18+ and modern
 * browsers (uses the global `fetch`).
 *
 * The public casino directory needs no key. A player's own data requires a
 * personal API key (`lvip_live_...`) minted at
 * https://loyaltyvip.com/dashboard/developer.
 */

export const DEFAULT_BASE_URL = "https://nbhagdwegk.execute-api.us-east-1.amazonaws.com";

export interface LoyaltyVIPOptions {
  /** Personal API key (`lvip_live_...`). Optional for public directory calls. */
  apiKey?: string;
  /** Override the API base URL. Defaults to the production gateway. */
  baseUrl?: string;
  /** Optional custom fetch (e.g. for tests or non-global-fetch runtimes). */
  fetch?: typeof fetch;
}

export interface ListResponse<T> {
  data: T[];
  count?: number;
}

export interface Casino {
  id: string;
  slug: string;
  name_slug: string | null;
  state_slug: string | null;
  name: string;
  city: string | null;
  state: string | null;
  casino_type: string | null;
  brand: string | null;
  has_rewards_program: boolean;
  [key: string]: unknown;
}

export interface RewardsProgram {
  id: string;
  program_name: string;
  brand: string | null;
  property: string | null;
  region: string | null;
  url: string | null;
}

export interface Tier {
  id: string;
  name: string;
  level: number;
  qualification: string | null;
  benefits: unknown[];
  verified: boolean;
  [key: string]: unknown;
}

export interface Account {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

export interface ApiErrorBody {
  error: { code: string; message: string; status: number; docs?: string };
}

/** Thrown on any non-2xx API response. Carries the typed error envelope. */
export class LoyaltyVIPError extends Error {
  readonly status: number;
  readonly code: string;
  readonly docs?: string;
  constructor(status: number, body: Partial<ApiErrorBody["error"]> & { message: string }) {
    super(body.message);
    this.name = "LoyaltyVIPError";
    this.status = status;
    this.code = body.code ?? "error";
    this.docs = body.docs;
  }
}

export interface CasinoSearchParams {
  q?: string;
  /** Two-letter state code, e.g. "NV". */
  state?: string;
  /** casino_type: commercial | tribal | racino. */
  type?: string;
  has_rewards?: boolean;
  limit?: number;
  offset?: number;
}

export class LoyaltyVIP {
  private readonly apiKey?: string;
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;

  constructor(options: LoyaltyVIPOptions = {}) {
    this.apiKey = options.apiKey;
    this.baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, "");
    const f = options.fetch ?? globalThis.fetch;
    if (!f) {
      throw new Error("No fetch available. Use Node 18+ or pass options.fetch.");
    }
    this.fetchImpl = f;
  }

  // ── Public directory (no key) ───────────────────────────────────────────

  /** Search the public U.S. casino directory. */
  searchCasinos(params: CasinoSearchParams = {}): Promise<ListResponse<Casino>> {
    return this.get<ListResponse<Casino>>("/v1/casinos", params as Record<string, unknown>);
  }

  /** Casino detail including rewards program and full tier ladder. */
  getCasino(slug: string): Promise<{ data: Casino & { rewards_program?: RewardsProgram; tiers?: Tier[] } }> {
    return this.get(`/v1/casinos/${encodeURIComponent(slug)}`);
  }

  /** List casino rewards / players-club programs. */
  listRewardsPrograms(params: { search?: string; brand?: string; limit?: number } = {}): Promise<ListResponse<RewardsProgram>> {
    return this.get<ListResponse<RewardsProgram>>("/v1/rewards-programs", params as Record<string, unknown>);
  }

  /** A single rewards program with its tier ladder. */
  getRewardsProgram(id: string): Promise<{ data: RewardsProgram & { tiers?: Tier[] } }> {
    return this.get(`/v1/rewards-programs/${encodeURIComponent(id)}`);
  }

  // ── Account (scope: read) ───────────────────────────────────────────────

  /** The API-key owner's profile. */
  me(): Promise<{ data: Account }> {
    return this.get("/v1/me", undefined, true);
  }

  /** Your casino tiers. */
  tiers(): Promise<ListResponse<Record<string, unknown>>> {
    return this.get("/v1/tiers", undefined, true);
  }

  /** Your trips. */
  trips(): Promise<ListResponse<Record<string, unknown>>> {
    return this.get("/v1/trips", undefined, true);
  }

  /** Your offers. */
  offers(): Promise<ListResponse<Record<string, unknown>>> {
    return this.get("/v1/offers", undefined, true);
  }

  // ── Full action API + features ──────────────────────────────────────────

  /**
   * Invoke any of the ~70 player/host actions (`POST /v1/player`).
   * Reads need `read`, writes `write`, tax actions `tax`, host actions `host`.
   */
  player<T = unknown>(action: string, params: Record<string, unknown> = {}): Promise<T> {
    return this.post<T>("/v1/player", { action, ...params }, true);
  }

  /** Comp calculator (`/v1/comp/calculate`). */
  comp<T = unknown>(action: string, params: Record<string, unknown> = {}): Promise<T> {
    return this.post<T>("/v1/comp/calculate", { action, ...params }, true);
  }

  /** Comp / offer prediction (`/v1/comp/predict`). */
  predict<T = unknown>(action: string, params: Record<string, unknown> = {}): Promise<T> {
    return this.post<T>("/v1/comp/predict", { action, ...params }, true);
  }

  /** Tier-match suggestions + letters (`/v1/tier-match`). */
  tierMatch<T = unknown>(action: string, params: Record<string, unknown> = {}): Promise<T> {
    return this.post<T>("/v1/tier-match", { action, ...params }, true);
  }

  /** IRS gambling tax documents (`/v1/tax-report`, scope `tax`). */
  taxReport<T = unknown>(action: string, params: Record<string, unknown> = {}): Promise<T> {
    return this.post<T>("/v1/tax-report", { action, ...params }, true);
  }

  // ── Internals ───────────────────────────────────────────────────────────

  private headers(auth: boolean): Record<string, string> {
    const h: Record<string, string> = { accept: "application/json" };
    if (auth) {
      if (!this.apiKey) {
        throw new LoyaltyVIPError(401, {
          code: "invalid_token",
          message: "This call requires an API key. Pass { apiKey } to the constructor.",
          status: 401,
        });
      }
      h.authorization = `Bearer ${this.apiKey}`;
    } else if (this.apiKey) {
      h.authorization = `Bearer ${this.apiKey}`;
    }
    return h;
  }

  private async get<T>(path: string, query?: Record<string, unknown>, auth = false): Promise<T> {
    const qs = query
      ? Object.entries(query)
          .filter(([, v]) => v !== undefined && v !== null && v !== "")
          .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
          .join("&")
      : "";
    const url = `${this.baseUrl}${path}${qs ? `?${qs}` : ""}`;
    const res = await this.fetchImpl(url, { headers: this.headers(auth) });
    return this.parse<T>(res);
  }

  private async post<T>(path: string, body: Record<string, unknown>, auth = false): Promise<T> {
    const res = await this.fetchImpl(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: { ...this.headers(auth), "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    return this.parse<T>(res);
  }

  private async parse<T>(res: Response): Promise<T> {
    const text = await res.text();
    let json: unknown;
    try {
      json = text ? JSON.parse(text) : {};
    } catch {
      throw new LoyaltyVIPError(res.status, { message: `Non-JSON response (${res.status}): ${text.slice(0, 200)}`, status: res.status });
    }
    if (!res.ok) {
      const err = (json as Partial<ApiErrorBody>)?.error;
      throw new LoyaltyVIPError(res.status, {
        code: err?.code,
        message: err?.message ?? `Request failed with ${res.status}`,
        status: res.status,
        docs: err?.docs,
      });
    }
    return json as T;
  }
}

export default LoyaltyVIP;
