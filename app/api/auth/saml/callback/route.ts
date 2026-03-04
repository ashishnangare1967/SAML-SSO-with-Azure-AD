import { sp, idp } from "@/lib/saml";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const body: any = {};
    formData.forEach((value, key) => {
      body[key] = value;
    });

    const { extract } = await sp.parseLoginResponse(idp, "post", { body });

    const user = extract.attributes;
    const nameID = extract.nameID;
    const sessionIndex = extract.sessionIndex.sessionIndex;
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
    return new Response(
      JSON.stringify({
        error: "SAML authentication failed",
        details: error.message,
      }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
