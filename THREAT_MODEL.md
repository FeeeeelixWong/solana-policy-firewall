# Threat Model

## Protected assets

- wallet authority and signatures;
- SOL and SPL balances;
- operator allowlists and amount limits;
- the meaning of the approval shown to a human; and
- evidence that a particular policy evaluated particular transaction bytes.

## Adversaries

- prompt injection in a website, message, invoice, tool result, or memo;
- a coerced or malfunctioning model;
- a transaction builder that hides extra instructions;
- malicious address lookup table contents;
- malformed transaction bytes intended to confuse a parser;
- an expired blockhash or transaction that fails only at runtime; and
- a compromised or dishonest RPC provider.

## Controls

| Threat | Control | Failure behavior |
| --- | --- | --- |
| Prompt changes recipient or limit | Policy only from host-injected config | DENY |
| Builder adds authority/delegate instruction | Decode every top-level instruction | DENY |
| Builder hides account in ALT | Resolve official ALT account and every index | DENY on any gap |
| Builder splits a transfer to bypass cap | Aggregate SOL and token amounts | DENY |
| Unknown CPI semantics | Only prove a narrow top-level program set | DENY |
| Token-2022 extension side effects | Token-2022 unsupported until extension proof exists | DENY |
| Signed transaction arrives after policy step | Zero-signature requirement | DENY |
| Stale blockhash or runtime error | Exact simulation without blockhash replacement | DENY |
| Parser differential | Canonical lengths, bounds, no trailing bytes | DENY |
| Audit evidence edited | SHA-256 transaction, policy, and receipt hashes | Detectable |

## Trust boundaries

The operator's ZeroClaw config and configured RPC are trusted. ZeroClaw must
preserve its documented behavior of stripping caller-provided `__config`
before injecting the plugin's jailed section. The signer must sign exactly the
transaction hash evaluated by the firewall.

One RPC can misreport account state or simulation. This is documented residual
risk, not silently treated as solved. A production signer should independently
simulate and compare the transaction hash immediately before signature.

## Non-goals

- private-key storage or signing;
- transaction submission;
- proving arbitrary DeFi or custom-program CPI behavior;
- sanctions or identity screening;
- cumulative daily limits without persistent host state; and
- replacing operator or wallet review.

