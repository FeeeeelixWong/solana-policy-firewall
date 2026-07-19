# Demo narration source

This is the single source for both voiceover and captions. Final timestamps are
locked only after the live capture is complete.

1. "This is a real Telegram conversation connected to official ZeroClaw, not a
   mocked chat interface."
2. "The agent receives only final transaction bytes. Operator policy is
   injected by the host, and the model cannot replace it."
3. "The request uses a durable nonce account on Solana devnet. The same exact
   bytes remain valid without replacing the blockhash."
4. "For the first path, the firewall proves the nonce owner, authority, stored
   value, recipient, amount, and exact message fee."
5. "Exact simulation passes at three hundred compute units. One million
   lamports plus the five thousand lamport fee produce a hash-linked ALLOW
   receipt."
6. "The stronger path is a durable-nonce version-zero transaction. It creates
   the recipient associated token account and performs classic SPL
   TransferChecked."
7. "The receipt accounts for two million thirty-nine thousand two hundred
   eighty lamports of rent, the exact fee, and total native outflow before
   approval."
8. "Change the nonce authority and the same official host returns critical DENY
   before simulation. Ambiguous or unproven semantics fail closed."
9. "Twenty-nine deterministic and bounded-random tests pass with warning-free
   Clippy and a locked WASI Preview Two release build."
10. "The implementation is open as pull request eighty-one in the official
    ZeroClaw plugin registry, with a public five-minute reproduction path."
11. "The component has no private key, signing method, or submit method. Agents
    propose; exact bytes and operator policy decide what may reach a separate
    signer."
