import { sp } from "@/lib/saml";

export async function GET() {
  const metadata = sp.getMetadata();

  return new Response(metadata, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}