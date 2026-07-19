# Demo Plan

Target length: under 2 minutes 30 seconds. The recorded product path, terminal
evidence, and real Telegram conversation remain on screen; title cards are
used only as short transitions.

## Setup

- Real source-built ZeroClaw host with WASM plugin backend.
- Real Telegram channel.
- Fresh unsigned 1,000-lamport devnet fixture.
- Operator config allows one recipient and a bounded amount.
- Official host log, Telegram response, receipt hashes, and test output.

## Flow

1. Show the real Telegram request entering official ZeroClaw.
2. Show GPT-5.4 selecting `solana_transaction_policy_check` with only the
   serialized unsigned transaction supplied by the conversation.
3. Show the real Telegram `ALLOW`, passed devnet simulation, 150 compute units,
   1,000-lamport transfer, receipt hash, and zero violations.
4. Explain that the host injects the operator-owned policy after stripping any
   caller-supplied `__config`.
5. Show the forged-config denial and stale-blockhash denial from the official
   host evidence.
6. Show the locked verification matrix: 15 tests, clippy, and a
   `wasm32-wasip2` release build.
7. Show upstream PR 81 in the official ZeroClaw plugin registry.
8. Close on the custody boundary: T0 read-only, with no key, signing method, or
   transaction submission method.

## Judge takeaway

The agent's prose is not the approval surface. The serialized transaction and
operator policy are.
