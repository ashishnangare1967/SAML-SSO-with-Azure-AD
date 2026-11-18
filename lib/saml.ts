import * as saml from "samlify";
import fs from "fs";

saml.setSchemaValidator({
  validate: () => Promise.resolve("skipped"),
});

function signingCertificates(extra: string[] = []) {
  const fromEnv = (process.env.IDP_SIGNING_CERT ?? "").replace(/\\n/g, "\n").trim();
  const certs = [fromEnv, ...extra].filter((cert) => cert.length > 0);
  return certs.length === 1 ? certs[0] : certs;
}

export function createIdp(extraSigningCerts: string[] = []) {
  return saml.IdentityProvider({
    entityID: `https://sts.windows.net/${process.env.TENANT_ID}/`,
    wantAuthnRequestsSigned: false,

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

    signingCert: signingCertificates(extraSigningCerts),
  });
}

export const idp = createIdp();

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

  // privateKey: fs.readFileSync("sp-private-key.pem"),
  // signingCert: fs.readFileSync("sp-cert.pem"),
});