const fs = require("fs");
const crypto = require("crypto");
const fetch = require("node-fetch");

function loadEnv(path) {
  const content = fs.readFileSync(path, "utf8");
  const lines = content.split(/\r?\n/);
  const env = {};
  for (const line of lines) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2];
  }
  return env;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error(
      "Usage: node send_webhook.js <signerId> <signerIndex> [envelopeId]",
    );
    process.exit(1);
  }
  const signerId = args[0];
  const signerIndex = Number(args[1]);
  const envelopeId = args[2] || "10295b109e29fd998913f49caa86";

  const env = loadEnv("./.env.development");
  const secret = env.ASSINAFY_WEBHOOK_SECRET;
  const url =
    env.WEBHOOK_TARGET_URL || "http://localhost:4000/api/signatures/webhook";

  const payload = {
    requestId: envelopeId,
    event: "signer_signed_document",
    signerId: signerId,
    signerIndex: signerIndex,
    status: "signed",
    completedAt: new Date().toISOString(),
  };

  const body = JSON.stringify(payload);
  const sig = crypto
    .createHmac("sha256", secret)
    .update(Buffer.from(body))
    .digest("hex");

  console.log("POST", url);
  console.log("Payload:", body);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Assinafy-Signature": `sha256=${sig}`,
    },
    body,
  });

  const text = await res.text();
  console.log("Status", res.status);
  console.log("Response:", text);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
