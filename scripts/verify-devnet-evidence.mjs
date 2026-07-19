#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const evidence = JSON.parse(
  await readFile(resolve(root, "docs/devnet-evidence.json"), "utf8"),
);

let requestId = 0;
const rpc = async (method, params) => {
  const response = await fetch(evidence.rpcUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: ++requestId, method, params }),
  });
  if (!response.ok) throw new Error(`${method}: HTTP ${response.status}`);
  const body = await response.json();
  if (body.error) throw new Error(`${method}: ${JSON.stringify(body.error)}`);
  return body.result;
};

const nonce = await rpc("getAccountInfo", [
  evidence.nonceAccount,
  { commitment: "confirmed", encoding: "jsonParsed" },
]);
if (!nonce.value) throw new Error("durable nonce account is missing");
if (nonce.value.owner !== "11111111111111111111111111111111") {
  throw new Error(`unexpected nonce account owner: ${nonce.value.owner}`);
}

const nonceInfo = nonce.value.data?.parsed?.info;
if (!nonceInfo) throw new Error("RPC did not return parsed durable nonce state");
if (nonceInfo.authority !== evidence.payer) {
  throw new Error(`nonce authority mismatch: ${nonceInfo.authority}`);
}
if (nonceInfo.blockhash !== evidence.durableNonce) {
  throw new Error(`durable nonce changed: ${nonceInfo.blockhash}`);
}

const creation = await rpc("getTransaction", [
  evidence.nonceCreationSignature,
  { commitment: "confirmed", encoding: "jsonParsed", maxSupportedTransactionVersion: 0 },
]);
if (!creation || creation.meta?.err) {
  throw new Error("nonce creation transaction is missing or failed");
}

const simulate = async (label, transactionBase64, expectedUnits) => {
  const result = await rpc("simulateTransaction", [
    transactionBase64,
    {
      commitment: "confirmed",
      encoding: "base64",
      innerInstructions: true,
      replaceRecentBlockhash: false,
      sigVerify: false,
    },
  ]);
  if (result.value.err) {
    throw new Error(`${label} simulation failed: ${JSON.stringify(result.value.err)}`);
  }
  if (result.value.unitsConsumed !== expectedUnits) {
    throw new Error(
      `${label} units changed: expected ${expectedUnits}, got ${result.value.unitsConsumed}`,
    );
  }
  return { slot: result.context.slot, unitsConsumed: result.value.unitsConsumed };
};

const durable = await simulate(
  "durable SOL",
  evidence.durableTransactionBase64,
  evidence.durableSimulation.unitsConsumed,
);
const durableV0 = await simulate(
  "durable v0 ATA + SPL",
  evidence.v0TokenTransactionBase64,
  evidence.v0TokenSimulation.unitsConsumed,
);

console.log("Public Solana devnet evidence verified");
console.log(`nonce account: ${evidence.nonceAccount}`);
console.log(`nonce value:   ${evidence.durableNonce}`);
console.log(`durable SOL:   passed at ${durable.unitsConsumed} CU (slot ${durable.slot})`);
console.log(`durable v0:    passed at ${durableV0.unitsConsumed} CU (slot ${durableV0.slot})`);
