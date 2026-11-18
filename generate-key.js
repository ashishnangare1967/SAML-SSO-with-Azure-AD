const forge = require("node-forge");
const fs = require("fs");

const keys = forge.pki.rsa.generateKeyPair(2048);
const cert = forge.pki.createCertificate();

cert.publicKey = keys.publicKey;
cert.serialNumber = "01";
cert.validity.notBefore = new Date();
cert.validity.notAfter = new Date();
cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 10);

const attrs = [{ name: "commonName", value: "saml-sp" }];
cert.setSubject(attrs);
cert.setIssuer(attrs);
cert.setExtensions([
  { name: "basicConstraints", cA: false },
  {
    name: "keyUsage",
    digitalSignature: true,
    keyEncipherment: true,
  },
]);
cert.sign(keys.privateKey, forge.md.sha256.create());

fs.writeFileSync("sp-private-key.pem", forge.pki.privateKeyToPem(keys.privateKey));
fs.writeFileSync("sp-cert.pem", forge.pki.certificateToPem(cert));

console.log("Keys generated successfully");
