#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PLUGIN="$ROOT/plugins/solana-policy-firewall"

cd "$PLUGIN"
cargo fmt --check
cargo test --locked
cargo clippy --all-targets -- -D warnings
cargo build --locked --target wasm32-wasip2 --release

WASM="$PLUGIN/target/wasm32-wasip2/release/solana_policy_firewall.wasm"
test -s "$WASM"
printf 'verified %s (%s bytes)\n' "$WASM" "$(wc -c < "$WASM" | tr -d ' ')"

