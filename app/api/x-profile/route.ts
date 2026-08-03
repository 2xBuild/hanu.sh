import { NextRequest, NextResponse } from "next/server";

import { fetchXProfile, toHandle } from "@/lib/x-profile";

/**
 * The upstream proxy allows `*`, so the browser could call it directly — going
 * through here instead buys a shared 5-minute cache across every visitor, one
 * normalized shape, and one place where the field bounds live.
 */
export async function GET(request: NextRequest) {
  const handle = toHandle(request.nextUrl.searchParams.get("user") ?? "");

  if (!handle) {
    return NextResponse.json({ error: "invalid_handle" }, { status: 400 });
  }

  const profile = await fetchXProfile(handle);

  if (!profile) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json(profile, {
    headers: { "Cache-Control": "public, max-age=60, s-maxage=300" },
  });
}
