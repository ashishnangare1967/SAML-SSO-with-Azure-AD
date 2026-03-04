// generate-pfx.mjs
// import { execSync } from "child_process";
import fs from "fs";
import forge from "node-forge";

// Read PEM files
const privateKeyPem = fs.readFileSync("sp-private-key.pem", "utf8");
const certPem = fs.readFileSync("sp-cert.pem", "utf8");

// Parse
const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
const cert = forge.pki.certificateFromPem(certPem);

// Create PKCS12 / PFX
const p12Asn1 = forge.pkcs12.toPkcs12Asn1(privateKey, [cert], "1", {
  algorithm: "3des", // encryption algorithm
});

const p12Der = forge.asn1.toDer(p12Asn1).getBytes();
const p12Buffer = Buffer.from(p12Der, "binary");

fs.writeFileSync("sp-cert.pfx", p12Buffer);
console.log("✅ sp-cert.pfx generated successfully!");