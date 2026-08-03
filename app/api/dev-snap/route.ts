import { writeFile } from "node:fs/promises";
import { NextRequest, NextResponse } from "next/server";

// TEMPORARY dev-only route: dumps a canvas PNG to disk so export frames can be
// inspected as real images. Delete along with /frames-check.
export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const { name, data } = (await request.json()) as { name: string; data: string };
  const path = `/private/tmp/claude-501/-Users-void-code-hanu-sh/57620e71-f29b-4cd0-8f47-08f2b41bf34b/scratchpad/${name.replace(/[^a-z0-9._-]/gi, "")}`;

  await writeFile(path, Buffer.from(data.split(",")[1]!, "base64"));

  return NextResponse.json({ path });
}
