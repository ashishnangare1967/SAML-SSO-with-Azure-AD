import { createIdp, sp } from "@/lib/saml";
import { X509Certificate } from "crypto";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

// Microsoft signed the login response with this certificate. It is not the
// certificate downloaded from the enterprise app (SecontSaml.cer).
const RESPONSE_SIGNING_FINGERPRINT =
  "2D:7E:14:A6:40:3C:AA:27:AC:74:2D:E5:89:A0:DF:34:2E:D6:35:7C:BD:F6:67:96:57:A8:30:3F:3F:53:E4:84";

function certificateBodies(samlResponse: FormDataEntryValue | undefined) {
  if (typeof samlResponse !== "string" || samlResponse.length === 0) {
    return [];
  }

  const xml = Buffer.from(samlResponse, "base64").toString("utf8");
  return [
    ...new Set(
      [...xml.matchAll(/<(?:[\w.-]+:)?X509Certificate>([^<]+)<\/(?:[\w.-]+:)?X509Certificate>/g)].map(
        (match) => match[1].replace(/\s/g, ""),
      ),
    ),
  ];
}

function trustedResponseCertificates(samlResponse: FormDataEntryValue | undefined) {
  return certificateBodies(samlResponse).filter((body) => {
    try {
      return (
        new X509Certificate(Buffer.from(body, "base64")).fingerprint256 ===
        RESPONSE_SIGNING_FINGERPRINT
      );
    } catch {
      return false;
    }
  });
}

function describedCertificates(samlResponse: FormDataEntryValue | undefined) {
  return certificateBodies(samlResponse).map((body) => {
    try {
      const certificate = new X509Certificate(Buffer.from(body, "base64"));
      return { subject: certificate.subject, fingerprint: certificate.fingerprint256 };
    } catch {
      return { subject: "unreadable", fingerprint: body.slice(0, 16) };
    }
  });
}

export async function POST(req: Request) {
  const body: Record<string, FormDataEntryValue> = {};
  let originalSamlResponse: FormDataEntryValue | undefined;
  try {
    const formData = await req.formData();

    formData.forEach((value, key) => {
      body[key] = value;
    });
    originalSamlResponse = body.SAMLResponse;

    const idp = createIdp(trustedResponseCertificates(originalSamlResponse));
    const { extract } = await sp.parseLoginResponse(idp, "post", { body });

    const user = extract.attributes ?? {};
    const nameID = extract.nameID ?? "";
    const rawSessionIndex = extract.sessionIndex?.sessionIndex;
    const sessionIndex = Array.isArray(rawSessionIndex)
      ? (rawSessionIndex[0] ?? "")
      : (rawSessionIndex ?? "");
    const nameIDFormat = extract.nameIDFormat;
    console.log("extract", extract);
    

    const token = jwt.sign(user, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    });

    // Redirect to dashboard and set cookie
    const response = NextResponse.redirect(
      new URL("/", process.env.NEXT_PUBLIC_BASE_URL!),
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60, // 1 hour
      path: "/",
    });
    response.cookies.set("nameID", nameID);
    response.cookies.set("sessionIndex", sessionIndex);
    // response.cookies.set("nameIDFormat", nameIDFormat);

    return response;
  } catch (error: any) {
    const responseCertificates = describedCertificates(originalSamlResponse);
    console.error("SAML callback failed", {
      details: error.message,
      responseCertificates,
    });
    return new Response(
      JSON.stringify({
        error: "SAML authentication failed",
        details: error.message,
        responseCertificates,
      }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
