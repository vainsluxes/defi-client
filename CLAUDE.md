# DeFi Client

Unified Node.js ESM DeFi multi-aggregator client for same-chain swapping and cross-chain bridging.

## Stack
- Node.js ESM (native `fetch`, `ethers` v6)
- Aggregators:
  1. **ParaSwap:** Same-chain swap (Primary, no API key required)
  2. **ODOS:** Same-chain swap with Smart Order Routing (Fallback)
  3. **LI.FI:** Cross-chain bridge & swap aggregator (15+ bridges, 20+ DEXes)

## Commands

```bash
# Get same-chain swap quote (ParaSwap or ODOS)
node cli.mjs quote paraswap 8453 0x0000000000000000000000000000000000000000 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913 10000000000000000

# Get cross-chain bridge quote (LI.FI)
node cli.mjs quote lifi 1 8453 0x0000000000000000000000000000000000000000 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913 10000000000000000

# Supported chains & tokens list
node cli.mjs chains
node cli.mjs tools
```

## Conventions
- Native token sentinel: `0x0000000000000000000000000000000000000000` (auto-mapped per aggregator).
- Slippage format: basis points (e.g. `100` = 1.0%, `50` = 0.5%).
- All amounts in atomic units (wei / smallest decimal units).

## Boundaries
- **NEVER** log raw private keys in stdout/logs.
- Transactions require active wallet credentials in `~/.hermes/credentials/wallet.env`.
