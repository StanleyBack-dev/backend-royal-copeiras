#!/usr/bin/env node
const http = require("http");
const crypto = require("crypto");
const fs = require("fs");

// Simple local webhook sender. Reads payload.json in scripts/ or uses default.
const payloadPath = process.argv[2] || "scripts/payload.json";
let body = JSON.stringify({
  id: "1028d54c1ef23aa41852a352ca6b",
  status: "signed",
  updated_at: new Date().toISOString(),
});
try {
  if (fs.existsSync(payloadPath)) body = fs.readFileSync(payloadPath, "utf8");
} catch (e) {}

const secret =
  process.env.ASSINAFY_WEBHOOK_SECRET || "a3f1c9e4d5b6f7a8c9d0e1f2a3b4c5d6";
const sig = crypto.createHmac("sha256", secret).update(body).digest("hex");

const options = {
  hostname: "localhost",
  port: process.env.PORT || 4000,
  path: "/signature/webhook/assinafy",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-assinafy-signature": sig,
    "Content-Length": Buffer.byteLength(body),
  },
};

const req = http.request(options, (res) => {
  console.log("status", res.statusCode);
  let d = "";
  res.on("data", (c) => (d += c));
  res.on("end", () => console.log("body", d));
});
req.on("error", (e) => console.error("error", e));
req.write(body);
req.end();
