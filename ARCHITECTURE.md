# Architecture

## Security objective

Prevent an autonomous agent from converting a misleading natural-language
description into an unsafe wallet approval. The firewall evaluates the exact
bytes presented for signing against policy that the model cannot modify.

## Runtime pipeline

```mermaid
flowchart LR
    A["Agent or transaction builder"] --> B["Serialized unsigned transaction"]
    B --> C["Strict legacy / v0 parser"]
    C --> D["ALT and SPL account resolver"]
    D --> N["Durable nonce state proof"]
    N --> E["Instruction semantics"]
    P["Operator-owned config"] --> E
    E --> F["Amounts + fees + rent + total outflow"]
    F -->|"policy passes"| G["Exact RPC simulation"]
    F -->|"any violation"| H["DENY receipt"]
    G -->|"success"| I["ALLOW receipt"]
    G -->|"error or unavailable"| H
    I --> J["Separate host / wallet approval"]
```

## Pure core

The code under `src/firewall.rs`, `src/transaction.rs`, `src/programs.rs`, and
`src/rpc.rs` has no WIT, WASI, HTTP, clock, random, filesystem, or process
dependency. Tests drive the same policy path with a deterministic RPC mock.

The parser accepts only canonical transaction wire formats up to Solana's
1,232-byte packet limit. It resolves v0 accounts in Solana's canonical order:
static keys, writable lookup keys, then readonly lookup keys.

For durable transactions, the first instruction must be canonical
`AdvanceNonceAccount`. The nonce account must be operator-allowlisted,
System-owned, initialized with the declared signer as authority, and contain
the exact nonce used as the transaction's recent blockhash. The RPC-proven
message fee must also be at least the nonce account's signature-fee floor.

Native outflow accounting includes transferred lamports, the exact
`getFeeForMessage` result, and worst-case rent for every allowed ATA creation.
Priority fee is independently bounded from compute-budget instructions but is
not added twice because it is already included in the RPC transaction fee.

## Thin component shim

`src/lib.rs` exports the ZeroClaw `tool-plugin` WIT v0 world. It:

1. decodes the JSON tool call;
2. receives the jailed operator config as `__config`;
3. performs HTTPS JSON-RPC through `waki` and host-mediated `wasi:http`;
4. invokes the pure core; and
5. emits a structured `approve` or `reject` log containing only the receipt
   hash, verdict, and violation count.

## Receipt integrity

`transactionHash` is SHA-256 over complete transaction wire bytes.
`policyHash` is SHA-256 over canonical JSON of the security policy, excluding
the RPC URL so credentials never enter evidence. `receiptHash` covers the
complete receipt with its hash field blank, except for the observational RPC
slot. The slot remains visible for correlation but is excluded from the
canonical hash. Repeating the same transaction, policy, RPC account state, and
simulation result therefore reproduces the same hash across later RPC slots.

## Production replacement points

- Replace one RPC with a quorum adapter and compare account state plus
  simulation results.
- Add Token-2022 extension proofs before allowing any Token-2022 transfer.
- Add stateful daily and rolling limits when the tool-plugin world exposes
  durable storage.
- Feed an `ALLOW` receipt into the ZeroClaw host approval gate or a Squads
  proposal builder. Keep signing outside this component.
