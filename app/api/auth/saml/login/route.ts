import { NextRequest } from "next/server";
import { sp, idp } from "@/lib/saml";

export async function GET(req: NextRequest) {
  try {
    const result = await sp.createLoginRequest(idp, "redirect");

    const redirectUrl = result.context?.toString();

    if (!redirectUrl) {
      return new Response("Missing redirect URL", { status: 500 });
    }

    return new Response(null, {
      status: 302,
      headers: {
        Location: redirectUrl,
      },
    });
  } catch (err) {
    console.error("SAML login error:", err);
    return new Response(`SAML Error: ${(err as Error).message}`, { status: 500 });
  }
}