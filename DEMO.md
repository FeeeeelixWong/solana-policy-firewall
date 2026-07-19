# Live demo plan

The submission video is a continuous capture of working software. It contains
no pitch deck, title-card sequence, mock wallet, or prerecorded fake terminal.
Every receipt shown is produced by the official ZeroClaw host from the current
WASM build.

## Capture surfaces

- Telegram conversation with the real allowlisted ZeroClaw bot.
- Official ZeroClaw host log at commit `a80ddb64`.
- Solana Explorer pages for the durable nonce account and creation transaction.
- Terminal calls for the durable SOL and v0 ATA + SPL fixtures.
- Test, Clippy, WASM release build, and component SHA-256 output.
- Official upstream PR 81.

## Final cut: 1 minute 44 seconds

1. **0:00-0:16** - Show the real Telegram tool approval and compact durable-v0
   `ALLOW` summary from the bound peer.
2. **0:16-0:24** - Open the nonce account in Explorer.
   Show that the same exact bytes pass after the recent-blockhash window.
3. **0:24-0:45** - Show the WASM durable SOL `ALLOW` receipt: nonce authority,
   1,000,000 lamports, exact 5,000-lamport transaction fee, simulation slot,
   transaction hash, policy hash, and receipt hash.
4. **0:45-1:05** - Show the durable-nonce v0 ATA + `TransferChecked` fixture.
   Show the same proven nonce, resolved wallet owner, mint, raw amount, ATA
   rent, exact fee, total native outflow, cross-slot stable receipt, and `ALLOW`.
5. **1:05-1:15** - Show one forged transaction with a mismatched nonce authority.
   Show `DENY`, stable violation codes, skipped simulation, zero signatures,
   and zero broadcasts.
6. **1:15-1:24** - Run `./scripts/verify.sh`; show 29 tests, Clippy, locked
   release build, WASM size, and SHA-256.
7. **1:24-1:33** - Open PR 81 and the self-contained plugin README. Show the
   manifest permissions are only `http_client` and `config_read`.
8. **1:33-1:44** - Re-run the public no-key evidence verifier and state the
   boundary: the plugin proves bytes; signing remains separate.

## Recording invariant

Narration and burned-in captions are generated from one cue sheet. Each visual
cut starts at the cue's timestamp; captions use the same start/end values, so
the spoken and written claims cannot drift apart.
