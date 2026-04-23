const fs = require("fs");
const { Client } = require("pg");

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
  const envelopeId = args[0] || "10295b109e29fd998913f49caa86";

  const env = loadEnv("./.env.development");

  const client = new Client({
    host: env.DB_HOST,
    port: Number(env.DB_PORT || 5432),
    user: env.DB_USER,
    password: env.DB_PASS,
    database: env.DB_NAME,
    ssl: env.DB_SSL === "true",
  });

  await client.connect();

  const sigRes = await client.query(
    `SELECT idtb_signatures, idtb_contracts, provider, envelope_id, status, signed_by_name, signed_by_document, signed_by_email, signature_url, provider_signer_id, signer_index, signed_at, created_at, updated_at FROM tb_signatures WHERE envelope_id = $1 ORDER BY signer_index NULLS LAST`,
    [envelopeId],
  );

  console.log("Signatures for envelope", envelopeId);
  console.table(sigRes.rows);

  if (sigRes.rows.length > 0) {
    const contractId = sigRes.rows[0].idtb_contracts;
    const cRes = await client.query(
      "SELECT idtb_contracts, contract_number, status, sent_via, sent_at, created_at, updated_at FROM tb_contracts WHERE idtb_contracts = $1",
      [contractId],
    );
    console.log("Contract:");
    console.table(cRes.rows);
  }

  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
