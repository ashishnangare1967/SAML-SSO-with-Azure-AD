import * as saml from "samlify";
import fs from "fs";

saml.setSchemaValidator({
  validate: () => Promise.resolve("skipped"),
});

export const idp = saml.IdentityProvider({
  entityID: `https://sts.windows.net/${process.env.TENANT_ID}/`,
 wantAuthnRequestsSigned: false,
  // wantLogoutRequestSigned: false,   // 👈 add this
  // wantLogoutResponseSigned: false,

  singleSignOnService: [
    {
      Binding: "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect",
      Location: `https://login.microsoftonline.com/${process.env.TENANT_ID}/saml2`,
    },
  ],
  singleLogoutService: [
    {
      Binding: "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect",
      Location: `https://login.microsoftonline.com/${process.env.TENANT_ID}/saml2`,
    },
  ],

  signingCert: `${process.env.IDP_SIGNING_CERT.replace(/\\n/g, "\n")}`,
});

export const sp = saml.ServiceProvider({
  entityID: `${process.env.NEXT_PUBLIC_BASE_URL}api/auth/saml/metadata`,
  authnRequestsSigned: false,

  assertionConsumerService: [
    {
      Binding: `urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST`,
      Location: `${process.env.NEXT_PUBLIC_BASE_URL}api/auth/saml/callback`,
    },
  ],
  singleLogoutService: [
    {
      Binding: `urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect`,
      Location: `${process.env.NEXT_PUBLIC_BASE_URL}api/auth/saml/logout/callback`,
    },
  ],

  privateKey: fs.readFileSync("sp-private-key.pem"),
  signingCert: fs.readFileSync("sp-cert.pem"),
});