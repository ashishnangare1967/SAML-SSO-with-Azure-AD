import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";


const PUBLIC_PATHS = ["/api/auth/saml", "/login"]; // remove bare "/"
const PUBLIC_EXACT = ["/"]; // exact matches only

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_EXACT.includes(pathname)) {
    return NextResponse.next();
  }

  // Prefix match for /api/auth/saml, /login, etc.
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/api/auth/saml/login", req.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/api/auth/saml/login", req.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static, _next/image (Next.js internals)
     * - favicon.ico
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};