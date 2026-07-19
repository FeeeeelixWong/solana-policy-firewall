# Official ZeroClaw host evidence

This evidence was captured on 2026-07-19 against official ZeroClaw commit
`a80ddb64998f81dc5b5b3f80611d0f3e538fab1c`, built with
`plugins-wasm,plugins-wasm-cranelift` and Rust 1.96.1.

The installed component SHA-256 was
`32925d29c3f28f8f25a8e90125b4d6e956859b35746ba58894f7d5adbc20689c`.
The host granted only `http_client` and `config_read`. The plugin had no wallet,
private key, signing method, or transaction submission method.

The public fixture can be independently re-checked without a funded wallet or
private key:

```bash
node ./scripts/verify-devnet-evidence.mjs
```

The script verifies the nonce account owner, authority, stored nonce, and
creation transaction before re-simulating both exact unsigned transactions.

## End-to-end durable-nonce ALLOW

An official ZeroClaw agent running GPT-5.4 selected
`solana_transaction_policy_check`, passed an unsigned devnet durable-nonce
transaction, executed the installed WASM component, and returned:

```json
{
  "verdict": "ALLOW",
  "risk": "low",
  "transactionHash": "351ae2063fa2554a30402e4bb7f0e7911b91a7cdb57fe4edecbcb641449794e9",
  "policyHash": "283ffa29c568f9dd253564eadd31a4ba958a0e0beffe685b39c85ddee142070d",
  "receiptHash": "3a6196c326a6d6cd0e8cb4e344c1f2bb52fa90e9ad1595c2e02e4bc33c1edf90",
  "durableNonce": {
    "account": "7ig9WUwRoL8iQm9m6dUuBHx3379ntDKUKZJPufWCu1bY",
    "authority": "GjKQpbBMw6nbJGeDJeoygtQBS4hC6J7Lzp96aFNg8CEq",
    "nonce": "54doYFe44GiPtKEGQuJqhZF9qwftXbh7igU7sbjXMaem"
  },
  "nativeOutflow": {
    "transferLamports": 1000000,
    "transactionFeeLamports": 5000,
    "accountCreationLamports": 0,
    "totalLamports": 1005000
  },
  "simulation": { "status": "passed", "unitsConsumed": 300, "slot": 477395925 },
  "transfers": [
    {
      "asset": "SOL",
      "amountRaw": "1000000",
      "recipient": "8CrX5vR8BfCDTkhw7SdTeQ1W698KPcYw2aThPEebFd4t"
    }
  ],
  "violations": []
}
```

The unsigned fee payer was the public devnet account
`GjKQ...8CEq`. The transaction was simulated through
`https://solana-devnet.api.onfinality.io/public`; it was never signed or
broadcast.

## Durable nonce and SPL v0 proof

The current release adds two reproducible devnet fixtures. Their complete
unsigned wire bytes and public account references are committed in
[`docs/devnet-evidence.json`](./docs/devnet-evidence.json).

The durable fixture uses nonce account
[`7ig9...u1bY`](https://explorer.solana.com/address/7ig9WUwRoL8iQm9m6dUuBHx3379ntDKUKZJPufWCu1bY?cluster=devnet),
created at slot `477373573` in
[transaction `5mLo...G7P8`](https://explorer.solana.com/tx/5mLo4o1CgVzGSp8sMbt8JZo1rcL8xPrJiaZ6tu8wjBCEHAcw5yVmovJ5wENeNdWuqop4LQw8xUfsk8uBA6P6G7P8?cluster=devnet).
More than ten minutes later, the exact unsigned bytes still simulated at slot
`477375181`, consumed 300 compute units, and carried a 5,000-lamport message
fee. No blockhash replacement was used.

The second fixture is a durable-nonce v0 message that idempotently creates the
recipient ATA and transfers 1,500,000 raw units of devnet mint
[`CWGK...YXLm`](https://explorer.solana.com/address/CWGK6ndS8YonLTey2hWsRkC6pdXU1JJW3QCadf7CYXLm?cluster=devnet)
with classic SPL `TransferChecked`. The official host returned `ALLOW` at slot
`477395548`, consumed 13,773 compute units, and reported 2,039,280 lamports of
ATA rent, a 5,000-lamport exact message fee, and 2,044,280 lamports of total
native outflow:

```json
{
  "transactionHash": "d5d464af2618b07abb08d6a747b54b96b2c69d2a4bddebe1439c55267bf067b2",
  "receiptHash": "26dcbc72ccdec0e05c557ee343a3ab99935465c705c363e9b0207c890be08279",
  "version": "v0",
  "instructions": 3,
  "nativeOutflow": {
    "transactionFeeLamports": 5000,
    "accountCreationLamports": 2039280,
    "totalLamports": 2044280
  },
  "simulation": { "status": "passed", "unitsConsumed": 13773, "slot": 477395548 },
  "violations": []
}
```

This proves long-lived v0 bytes, rent-bearing ATA creation, token-owner
resolution, exact fee accounting, and aggregate native-outflow enforcement
against real accounts rather than mock data.

The official host repeated the same v0 bytes and operator policy at slot
`477395677`. The observational slot changed, but the receipt hash remained
`26dcbc72ccdec0e05c557ee343a3ab99935465c705c363e9b0207c890be08279`.
The canonical hash intentionally excludes only the RPC slot while the receipt
still reports it. This proves reproducibility across later verification slots
without hiding when each simulation occurred.

## Forged nonce authority DENY

An adversarial transaction kept the same real nonce account and value but
placed an unapproved key in the nonce-advance authority position. The official
host denied it before simulation:

```json
{
  "verdict": "DENY",
  "risk": "critical",
  "transactionHash": "dd44489443aec6babc8c18327c82bb51dcceaa72c671438fc2a2b7bfca177aa3",
  "receiptHash": "e3d1e26ea3b8ac901be17df064ad71a12340fc9a24367a5be70e2b416559731a",
  "simulation": { "status": "skipped-policy-denied" },
  "violations": [
    { "code": "signer_not_allowed" },
    { "code": "nonce_authority_mismatch" }
  ]
}
```

## Expired blockhash DENY

The same path with an expired blockhash returned `DENY`, `risk: high`,
`simulation_failed`, and `BlockhashNotFound`. This confirms that simulation
failure cannot degrade into approval.

```json
{
  "verdict": "DENY",
  "transactionHash": "affb74d87c7a0c939e1c5c12332b88201e1ffd4bed3eadcceb5e4ecc5b6717b2",
  "receiptHash": "487fee6eeefb82d16c96f93af3b76a9fde02245ae305fe76d906c4616e4061e7",
  "simulation": { "status": "failed", "unitsConsumed": 0 },
  "violations": [
    {
      "code": "simulation_failed",
      "detail": "Solana simulation returned BlockhashNotFound"
    }
  ]
}
```

## Caller-config forgery DENY

The official host test sent tool arguments containing a forged `__config` that
claimed an unapproved recipient and unlimited cap were allowed. ZeroClaw
stripped the caller field, injected the operator config, and the plugin returned
`recipient_not_allowed` without simulation:

```json
{
  "verdict": "DENY",
  "risk": "high",
  "transactionHash": "e141c327b90654e3d9215d1b702e39320ae870f89a8626a3b1e63d1dbba8e264",
  "policyHash": "14065806be2d99a509e74776d719b99761386e293184e3895b9eaa6e0ca14a8c",
  "receiptHash": "81f36b1987edb718c3f2998ef5d36a0ad27cb232324bbb961f3d3c541924742c",
  "simulation": { "status": "skipped-policy-denied" },
  "violations": [
    {
      "code": "recipient_not_allowed",
      "detail": "recipient not operator-approved"
    }
  ]
}
```

## Telegram channel proof

The same installed component was bound to a private allowlisted Telegram peer
through ZeroClaw's official channel server. A user sent an unsigned transaction
to the bot, GPT-5.4 selected the firewall tool, the WASM component executed, and
the bot delivered the structured result back to the same conversation.

A durable-nonce v0 transaction reached the bot, showed ZeroClaw's inline T0
approval prompt, and ran only after approval. The public-hash fields were
shortened in the chat summary so ZeroClaw's outbound credential guard did not
misclassify public Base58 values as secrets. The complete receipt is recorded
below:

```json
{
  "verdict": "ALLOW",
  "risk": "low",
  "transactionHash": "d5d464af2618b07abb08d6a747b54b96b2c69d2a4bddebe1439c55267bf067b2",
  "policyHash": "283ffa29c568f9dd253564eadd31a4ba958a0e0beffe685b39c85ddee142070d",
  "receiptHash": "26dcbc72ccdec0e05c557ee343a3ab99935465c705c363e9b0207c890be08279",
  "version": "v0",
  "nativeOutflow": {
    "transactionFeeLamports": 5000,
    "accountCreationLamports": 2039280,
    "totalLamports": 2044280
  },
  "simulation": { "status": "passed", "unitsConsumed": 13773, "slot": 477397422 },
  "transfers": [
    {
      "asset": "CWGK6ndS8YonLTey2hWsRkC6pdXU1JJW3QCadf7CYXLm",
      "amountRaw": "1500000",
      "recipient": "8CrX5vR8BfCDTkhw7SdTeQ1W698KPcYw2aThPEebFd4t"
    }
  ],
  "violations": []
}
```

The Telegram receipt hash is identical to the official CLI checks at slots
`477395548` and `477395677`, proving the same canonical evidence survives both
channel routing and later RPC slots. Telegram credentials and peer identifiers
are intentionally excluded from this repository.

## Independent verification

The pure core and the WASM component are verified by the repository's locked
test, lint, and build matrix. The upstream integration is available as
[zeroclaw-labs/zeroclaw-plugins#81](https://github.com/zeroclaw-labs/zeroclaw-plugins/pull/81).
