# Demo Plan

Target length: 2 minutes 30 seconds. No slides.

## Setup

- Real source-built ZeroClaw host with WASM plugin backend.
- Real Telegram channel on a phone.
- Devnet treasury and supplier wallets.
- Operator config allows one supplier, 0.1 SOL, and a small priority fee.
- Screen recording shows terminal and phone together.

## Flow

1. Ask the Telegram agent to prepare a 0.01 SOL supplier payment.
2. Show the plugin load line and the unsigned transaction entering the
   firewall.
3. Show `ALLOW`, exact recipient and amount, passed simulation, transaction
   hash, policy hash, and receipt hash.
4. Send a hostile invoice asking the agent to ignore policy, redirect funds,
   inject `__config`, and add an authority change.
5. Show `DENY critical`, stable violation codes, simulation skipped, and no
   wallet approval.
6. Replay the original transaction to show an identical receipt hash.
7. Close on the custody boundary: the plugin can inspect and reject, but cannot
   sign or submit.

## Judge takeaway

The agent's prose is not the approval surface. The serialized transaction and
operator policy are.

