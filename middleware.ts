import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0];
  const isUiSubdomain = host === "ui.hanu.sh";

  if (isUiSubdomain && request.nextUrl.pathname === "/") {
    return NextResponse.rewrite(new URL("/ui", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/((?!_next|favicon.ico|image.png|me.png|tpot.png).*)",
};
