/**
 * Public X profile lookup, through the same proxy wiral.app uses.
 *
 * Everything here treats the upstream response as untrusted: the values land in
 * rendered text, in `<img src>`, and in a canvas that gets muxed into a video
 * file, so each field is bounded and coerced before it leaves this module.
 */

const ENDPOINT = "https://x-api.vrma.dev/profile";

/**
 * Hard ceiling on the upstream call. A hung third party would otherwise hold a
 * route handler open for as long as it likes; failing fast degrades to "profile
 * not found", which the caller already renders. Sized with headroom over the
 * ~0.6–1s the proxy actually takes.
 */
const TIMEOUT_MS = 6_000;

const NAME_MAX = 64;
const BIO_MAX = 320;
const LOCATION_MAX = 48;

/** X's own ceiling, and the ceiling on what the counter inputs accept. */
export const FOLLOWERS_MAX = 1_000_000_000;

export type XProfile = {
  username: string;
  name: string;
  bio: string | null;
  location: string | null;
  followers: number;
  following: number;
  isVerified: boolean;
  avatar: string | null;
  banner: string | null;
  /** Unix seconds, or null when upstream omits it. */
  createdAt: number | null;
};

type ApiResponse = {
  profile_picture_url?: string | null;
  profile_cover_url?: string | null;
  username?: string;
  name?: string;
  description?: string | null;
  location?: string | null;
  followers?: number;
  following?: number;
  is_verified?: boolean;
  created_at?: number;
  error?: string;
};

/**
 * X handles are 1–15 of `[A-Za-z0-9_]`. Validating before the call bounds both
 * the outbound request rate and the number of distinct cache entries a visitor
 * can create, and it means a bad handle costs nothing.
 */
export function toHandle(input: string): string | null {
  const handle = input.trim().replace(/^@+/, "").split(/[/?#]/)[0] ?? "";
  return /^[A-Za-z0-9_]{1,15}$/.test(handle) ? handle : null;
}

function clamp(value: unknown, max: number) {
  return String(value ?? "").trim().slice(0, max);
}

function count(value: unknown) {
  const n = Number(value ?? 0);
  return Number.isFinite(n) && n > 0 ? Math.min(Math.floor(n), FOLLOWERS_MAX) : 0;
}

/**
 * Only `pbs.twimg.com` images are kept. The avatar and banner are drawn into the
 * export canvas, so an attacker-chosen host would be a way to pull an arbitrary
 * cross-origin image into a file the visitor then shares — and any host that
 * omits CORS headers would taint the canvas and break the export outright.
 */
function image(value: unknown) {
  const raw = clamp(value, 512);
  if (!raw) return null;

  try {
    const url = new URL(raw);
    return url.protocol === "https:" && url.hostname === "pbs.twimg.com" ? url.toString() : null;
  } catch {
    return null;
  }
}

/** X serves the avatar at 400px; the export draws it at 224px on a 2× canvas. */
function avatarAt400(url: string | null) {
  return url?.replace(/_(normal|bigger|mini|200x200)\./, "_400x400.") ?? null;
}

/** Banners are served at their display width via a `/1500x500` suffix. */
function bannerAt1500(url: string | null) {
  return url ? `${url.replace(/\/\d+x\d+$/, "")}/1500x500` : null;
}

export async function fetchXProfile(handle: string): Promise<XProfile | null> {
  const username = toHandle(handle);
  if (!username) return null;

  try {
    const response = await fetch(`${ENDPOINT}?user=${encodeURIComponent(username)}`, {
      next: { revalidate: 300 },
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!response.ok) return null;

    const data = (await response.json()) as ApiResponse;
    if (data.error || (!data.username && !data.name)) return null;

    return {
      // Never trust the echoed handle over the one that was validated.
      username: toHandle(String(data.username ?? "")) ?? username,
      name: clamp(data.name, NAME_MAX) || data.username || username,
      bio: clamp(data.description, BIO_MAX) || null,
      location: clamp(data.location, LOCATION_MAX) || null,
      followers: count(data.followers),
      following: count(data.following),
      isVerified: Boolean(data.is_verified),
      avatar: avatarAt400(image(data.profile_picture_url)),
      banner: bannerAt1500(image(data.profile_cover_url)),
      createdAt: typeof data.created_at === "number" ? data.created_at : null,
    };
  } catch {
    return null;
  }
}

export function formatCount(value: number) {
  if (value >= 1_000_000) {
    const m = value / 1_000_000;
    return `${m >= 10 ? Math.round(m) : m.toFixed(1).replace(/\.0$/, "")}M`;
  }

  if (value >= 10_000) return `${Math.round(value / 1_000)}K`;

  return value.toLocaleString("en-US");
}

export function formatJoined(createdAt: number) {
  return new Date(createdAt * 1000).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}
