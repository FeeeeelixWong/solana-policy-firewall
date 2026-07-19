# Submission demo script

The captions and narration are generated from the same segment text. Each
visual segment is padded to the measured narration duration before the tracks
are muxed, so the burned captions and spoken words share one timeline.

1. **Hook** - An agent can describe a payment however it wants. The wallet
   still signs bytes, not prose.
2. **Product** - Solana Policy Firewall is a T0 ZeroClaw plugin that inspects
   the complete unsigned transaction before any wallet or human is asked to
   approve it.
3. **Real Telegram path** - A real Telegram message enters official ZeroClaw.
   GPT-5.4 selects the WASM tool, while the host injects operator policy that
   the model cannot replace.
4. **ALLOW proof** - The plugin parses the transfer, checks policy, and
   simulates the exact bytes on Solana devnet. The real request passed at 150
   compute units and produced a hash-linked receipt.
5. **Custody** - The component never receives a private key. It cannot sign or
   submit. It proves selected SOL and SPL payment semantics only.
6. **Fail closed** - Authority changes, minting, burning, Token-2022,
   unresolved lookups, unknown programs, RPC errors, signed input, and expired
   blockhashes are denied.
7. **Injection defense** - A forged caller configuration claiming a new
   recipient and unlimited cap was stripped by ZeroClaw. The operator policy
   remained authoritative and the request was denied before simulation.
8. **Engineering** - Fifteen tests cover legacy and versioned transactions,
   SPL ownership, prompt injection, stale state, and deterministic receipts.
   The locked matrix also runs clippy and builds the WASM release component.
9. **Merge readiness** - The plugin is open and mergeable as PR 81 in the
   official ZeroClaw plugin registry.
10. **Close** - Autonomous agents can propose freely. Solana Policy Firewall
    proves the bytes, while signing stays outside the model.
