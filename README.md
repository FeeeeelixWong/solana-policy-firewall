# Solana Policy Firewall

**A fail-closed pre-sign firewall that makes ZeroClaw agents prove what a
Solana transaction will actually do before a human or wallet approves it.**

An agent can describe a payment however it likes. Solana Policy Firewall does
not trust that description. It parses the final serialized transaction bytes,
resolves v0 address lookup tables and token-account owners from RPC, applies an
operator-owned policy, simulates the exact transaction, and returns a
hash-linked `ALLOW` or `DENY` receipt.

It never accepts policy overrides from the model. It never signs. It never
submits. Unknown semantics fail closed.

## Why this is different from a transaction decoder

A decoder explains. A firewall enforces.

| Surface | Decoder | Solana Policy Firewall |
| --- | --- | --- |
| Source of truth | Transaction or fetched signature | Final pre-sign wire bytes |
| Operator policy | No | Host-injected and hashed |
| v0 lookup tables | Often display-only | Resolved and included in account policy |
| SPL recipient | Token account | On-chain wallet owner |
| Authority/delegate changes | Displayed | Hard denial |
| Unknown programs | Named or summarized | Hard denial |
| Simulation failure | Informational | Hard denial |
| Output | Explanation | Reproducible approval receipt |

## Proven path

```text
unsigned transaction bytes
        |
        v
strict legacy / v0 parser --> ALT + token account resolution
        |
        v
durable nonce proof --> operator policy --> complete outflow accounting
        |
        v
exact RPC simulation
        |
        +--> ALLOW + receipt hash
        |
        +--> DENY + stable violation codes
```

The current release proves:

- legacy and v0 message parsing with canonical compact lengths;
- address lookup table owner, bounds, and address resolution;
- native SOL transfer semantics;
- canonical durable-nonce advancement, including first-instruction position,
  account owner, authority, stored nonce, and transaction blockhash proof;
- classic SPL `Transfer` and `TransferChecked`, with destination wallet-owner
  and mint resolution;
- classic associated-token-account creation;
- exact transaction-fee, compute-unit price, priority-fee, ATA rent, and total
  native-outflow bounds;
- fee payer, signer, program, recipient, mint, amount, instruction, and
  writable-account policy;
- hard denial for authority, delegate, mint, burn, freeze, close-account,
  Token-2022 extension, unknown-program, signed-input, stale-blockhash, and
  simulation failures; and
- deterministic policy and receipt hashes.

## Custody tier

**T0, read-only.** The plugin reads operator config and public Solana RPC data.
It receives no private key, produces no signature, and has no submit method.
An `ALLOW` result is evidence for a later approval step, not an execution.

## Quick verification

```bash
rustup target add wasm32-wasip2
cd plugins/solana-policy-firewall
cargo test --locked
cargo clippy --all-targets -- -D warnings
cargo build --locked --target wasm32-wasip2 --release
```

Re-check the published Solana devnet fixtures without a funded wallet or
private key:

```bash
node ./scripts/verify-devnet-evidence.mjs
```

This verifies the durable nonce account and its creation transaction, then
re-simulates the exact stored SOL and durable-v0 ATA + SPL transactions with
`replaceRecentBlockhash: false`.

The component is written to:

```text
plugins/solana-policy-firewall/target/wasm32-wasip2/release/solana_policy_firewall.wasm
```

See the self-contained [plugin README](./plugins/solana-policy-firewall/README.md)
for ZeroClaw configuration and a worked example.

## Live ZeroClaw proof

The release component was installed into official ZeroClaw commit
`a80ddb64998f81dc5b5b3f80611d0f3e538fab1c`, exposed as the agent's only WASM
tool, and exercised against Solana devnet. A fresh unsigned 1,000,000-lamport
durable-nonce transfer produced `ALLOW`, passed simulation at 300 compute units,
and returned transaction, policy, nonce, outflow, and receipt proofs. Replacing
the nonce authority produced critical `DENY` before simulation.

The strongest fixture is a durable-nonce v0 transaction that creates a
recipient ATA and performs SPL `TransferChecked`. The official host proved the
token owner and amount, charged exact ATA rent and transaction fees, bounded
aggregate native outflow, and simulated the final long-lived wire bytes.

The component was also exercised through ZeroClaw's real Telegram channel. A
bound peer sent the durable-nonce v0 ATA + SPL fixture, approved the inline T0
tool prompt, and received `ALLOW` with 13,773 compute units, 2,039,280 lamports
of rent, a 5,000-lamport fee, and 2,044,280 lamports of total native outflow.
The Telegram receipt hash
`26dcbc72ccdec0e05c557ee343a3ab99935465c705c363e9b0207c890be08279`
matches two separate official-host checks at different RPC slots.

See [Official host evidence](./EVIDENCE.md) for the exact public accounts,
hashes, results, and custody boundary. The merge-ready upstream contribution is
[zeroclaw-labs/zeroclaw-plugins#81](https://github.com/zeroclaw-labs/zeroclaw-plugins/pull/81).

## Repository map

```text
plugins/solana-policy-firewall/
  src/firewall.rs       pure policy engine and receipts
  src/transaction.rs    strict legacy/v0 wire parser
  src/programs.rs       proven instruction semantics
  src/rpc.rs            host-independent RPC trait
  src/lib.rs            thin ZeroClaw WASM component shim
  tests/firewall.rs     deterministic security and behavior suite
wit/v0/                 byte-identical ZeroClaw WIT contract
```

## Security documents

- [One-page judge brief](./ONE_PAGER.md)
- [Architecture](./ARCHITECTURE.md)
- [Threat model](./THREAT_MODEL.md)
- [Prompt-injection transcript](./PROMPT_INJECTION_TRANSCRIPT.md)
- [Official ZeroClaw evidence](./EVIDENCE.md)
- [Exact public devnet fixtures](./docs/devnet-evidence.json)
- [Demo plan](./DEMO.md)

## Hackathon

Built as an independent project for the Superteam Brasil bounty,
"Build Solana-native plugins for ZeroClaw." The upstream contribution is kept
merge-ready for `zeroclaw-labs/zeroclaw-plugins` and follows the canonical
`plugins/redact-text` component layout.

## License

MIT. ZeroClaw WIT files are vendored from the official plugin registry at the
commit recorded in `wit/UPSTREAM_REF` and retain their upstream terms.
