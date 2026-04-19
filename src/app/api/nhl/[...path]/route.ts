import { NextRequest } from "next/server";

export const runtime = "edge";

const DEFAULT_BASE = "https://api-web.nhle.com";

function getBase(): string {
  const b = process.env.NHL_API_BASE ?? DEFAULT_BASE;
  return b.replace(/\/$/, "");
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await ctx.params;
  const path = segments.join("/");
  const search = req.nextUrl.search;
  const url = `${getBase()}/${path}${search}`;

  try {
    const upstream = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "scoreboard-overlay/1.0",
      },
      cache: "no-store",
    });

    const body = await upstream.text();
    return new Response(body, {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("Content-Type") ?? "application/json",
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Upstream fetch failed";
    return Response.json({ error: message }, { status: 502 });
  }
}
