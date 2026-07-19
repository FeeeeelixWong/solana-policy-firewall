# Official ZeroClaw host evidence

This evidence was captured on 2026-07-19 against official ZeroClaw commit
`a80ddb64998f81dc5b5b3f80611d0f3e538fab1c`, built with
`plugins-wasm,plugins-wasm-cranelift` and Rust 1.96.1.

The installed component SHA-256 was
`e0fe19dfc0999f6742e51e36fa1dc98811e409a4531fd1b0f988b3c596bed905`.
The host granted only `http_client` and `config_read`. The plugin had no wallet,
private key, signing method, or transaction submission method.

## End-to-end agent ALLOW

An official ZeroClaw agent running GPT-5.4 selected
`solana_transaction_policy_check`, passed one freshly constructed unsigned
legacy transaction, executed the installed WASM component, and returned:

```json
{
  "verdict": "ALLOW",
  "risk": "low",
  "transactionHash": "4a5ba7b81b8f27d6aae65de488c1a3b597ab2d1af9da1ef609e815f44b22d624",
  "policyHash": "0226f6f267f38aa81f39a3d3ef95c481f1a63e892df30c38b20fb58ddb82c9bb",
  "receiptHash": "8a7da1a2d29aa40568d06c09c4729e51d24eca9e40df01463e58da455ce35e71",
  "simulation": { "status": "passed", "unitsConsumed": 150 },
  "transfers": [
    {
      "asset": "SOL",
      "amountRaw": "1000",
      "recipient": "8HEB2Y1Cgj8pEkbBmVnR62BHYudp6cXKUhEu3wMD9rrz"
    }
  ],
  "violations": []
}
```

The unsigned fee payer was the public devnet account
`dv2eQHeP4RFrJZ6UeiZWoc3XTtmtZCUKxxCApCDcRNV`. The transaction was simulated
through `https://solana-devnet.api.onfinality.io/public`; it was never signed or
broadcast.

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

A fresh fixture reached the bot within 16 seconds. The Telegram agent selected
the WASM tool, devnet simulation passed at 150 compute units, and the bot
delivered this result to the conversation:

```json
{
  "verdict": "ALLOW",
  "risk": "low",
  "transactionHash": "7dda935c713df487d1397f3ea98f30f5d2596849f4cdd0df4680063b2d9aad35",
  "policyHash": "0226f6f267f38aa81f39a3d3ef95c481f1a63e892df30c38b20fb58ddb82c9bb",
  "receiptHash": "3bc83b7d2df727ace9a5bc2897a6c38306b7f892dbc19a0c3024b1506eec4aa0",
  "simulation": { "status": "passed", "unitsConsumed": 150 },
  "transfers": [
    {
      "asset": "SOL",
      "amountRaw": "1000",
      "recipient": "8HEB2Y1Cgj8pEkbBmVnR62BHYudp6cXKUhEu3wMD9rrz"
    }
  ],
  "violations": []
}
```

An earlier stale Telegram fixture returned `DENY`, `simulation_failed`, and
`BlockhashNotFound`, proving the same channel path also fails closed. Telegram
credentials and peer identifiers are intentionally excluded from this
repository.

## Independent verification

The pure core and the WASM component are verified by the repository's locked
test, lint, and build matrix. The upstream integration is available as
[zeroclaw-labs/zeroclaw-plugins#81](https://github.com/zeroclaw-labs/zeroclaw-plugins/pull/81).
