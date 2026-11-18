// app/api/auth/saml/logout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { sp, idp } from "@/lib/saml";
import zlib from "zlib";

export async function GET(req: NextRequest) {
  const nameid = req.cookies.get("nameID")?.value;
  const sessionIndex = req.cookies.get("sessionIndex")?.value;

  if (!nameid) {
    return NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_BASE_URL!));
  }

  const { context } = await sp.createLogoutRequest(idp, "redirect", {
    logoutNameID: nameid,
    sessionIndex,
  });

  // 👇 Add this to see the XML
   // confirm XML has nameID value
  const url = new URL(context.toString());
  const samlRequest = url.searchParams.get("SAMLRequest")!;
  const xml = zlib.inflateRawSync(Buffer.from(samlRequest, "base64")).toString("utf8");
  console.log("Logout Request XML:\n", xml);


  return new Response(null, {
    status: 302,
    headers: { Location: context.toString() },
  });
}