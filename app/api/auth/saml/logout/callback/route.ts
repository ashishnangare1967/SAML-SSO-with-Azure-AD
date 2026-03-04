// app/api/auth/saml/logout/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { sp, idp } from "@/lib/saml";

export async function GET(req: NextRequest) {
  try {
    // Parse the logout response from Azure
    const searchParams = req.nextUrl.searchParams;
    await sp.parseLogoutResponse(idp, "redirect", {
      query: Object.fromEntries(searchParams.entries()),
    });
  } catch (err) {
    // Even if parsing fails, still clear cookies and redirect
    console.error("Logout response parse error:", err);
  }

  const response = NextResponse.redirect(
    new URL("/", process.env.NEXT_PUBLIC_BASE_URL!)
  );

  // Clear all auth cookies
  response.cookies.set("token", "", { maxAge: 0, path: "/" });
  response.cookies.set("nameID", "", { maxAge: 0, path: "/" });
  response.cookies.set("sessionIndex", "", { maxAge: 0, path: "/" });
  response.cookies.set("nameIDFormat", "", { maxAge: 0, path: "/" });

  return response;
}