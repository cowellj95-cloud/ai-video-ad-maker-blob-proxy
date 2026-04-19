import { get } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ pathname: string[] }> }
) {
  try {
    const { pathname } = await params;

    // Reconstruct full pathname from array
    let fullPathname = pathname.join("/");

    // Decode URL-encoded pathname (Next.js doesn't auto-decode catch-all params)
    try {
      fullPathname = decodeURIComponent(fullPathname);
    } catch {
      // If decoding fails, use as-is
    }

    if (!fullPathname) {
      return new NextResponse("Missing pathname", { status: 400 });
    }

    // Validate bypass token from query parameter
    const url = new URL(request.url);
    const providedToken = url.searchParams.get("token");
    const expectedToken = process.env.VERCEL_BYPASS_TOKEN;

    if (!expectedToken) {
      console.error("❌ Blob proxy: VERCEL_BYPASS_TOKEN not configured");
      return new NextResponse("Internal server error", { status: 500 });
    }

    if (!providedToken || providedToken !== expectedToken) {
      console.warn("❌ Blob proxy: Invalid or missing bypass token");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    console.log("✅ Blob proxy: Token validated, fetching blob:", fullPathname);

    // Fetch private blob using Vercel Blob SDK
    const result = await get(fullPathname, { access: "private" });

    if (!result) {
      console.warn("⚠️ Blob proxy: Blob not found:", fullPathname);
      return new NextResponse("Not found", { status: 404 });
    }

    // Return blob stream with correct content type
    return new NextResponse(result.stream, {
      headers: {
        "Content-Type": result.blob.contentType || "application/octet-stream",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, max-age=60",
      },
    });
  } catch (error) {
    console.error("❌ Blob proxy error:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
