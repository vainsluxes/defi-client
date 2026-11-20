#!/usr/bin/env node
import { getParaswapQuote } from './paraswap.mjs';
import { getOdosQuote } from './odos.mjs';
import { getLifiQuote, getLifiChains, getLifiTools } from './lifi.mjs';
import { CHAIN_MAP, COMMON_TOKENS, NATIVE_SENTINEL } from './config.mjs';

function printUsage() {
  console.log(`
Usage:
  node cli.mjs quote paraswap|odos <chainId> <fromToken> <toToken> <amount> [--slippage 100]
  node cli.mjs quote lifi <fromChain> <toChain> <fromToken> <toToken> <amount> [--slippage 300]
  node cli.mjs chains
  node cli.mjs tokens [chainId]
  node cli.mjs tools

Examples:
  # Base: Swap 0.01 ETH to USDC on ParaSwap
  node cli.mjs quote paraswap 8453 0x0000000000000000000000000000000000000000 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913 10000000000000000

  # Bridge: 0.01 ETH from Ethereum (1) to Base (8453) on LI.FI
  node cli.mjs quote lifi 1 8453 0x0000000000000000000000000000000000000000 0x0000000000000000000000000000000000000000 10000000000000000
`);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) {
    printUsage();
    process.exit(0);
  }

  // Service mode: keep process alive when started without arguments
  if (args.length === 0) {
    console.log('[DeFi Client] Running in service mode. Use --help for CLI usage.');
    setInterval(() => {}, 60_000);
    return;
  }

  const command = args[0].toLowerCase();

  try {
    if (command === 'chains') {
      console.log('\nSupported Primary Chains:');
      console.table(
        Object.entries(CHAIN_MAP).map(([id, info]) => ({
          ChainId: id,
          Name: info.name,
          NativeSymbol: info.symbol
        }))
      );
    } else if (command === 'tokens') {
      const chainId = args[1] || '8453';
      const tokens = COMMON_TOKENS[chainId];
      if (!tokens) {
        console.log(`No preset tokens for chainId ${chainId}. Standard native sentinel: ${NATIVE_SENTINEL}`);
      } else {
        console.log(`\nCommon Tokens on Chain ${chainId}:`);
        console.table(Object.entries(tokens).map(([sym, addr]) => ({ Symbol: sym, Address: addr })));
      }
    } else if (command === 'tools') {
      const tools = await getLifiTools();
      console.log(`\nLI.FI Aggregated Bridges: ${tools.bridges.length}, DEXes: ${tools.exchanges.length}`);
      console.log('Sample Bridges:', tools.bridges.slice(0, 8).map(b => b.name).join(', '));
      console.log('Sample DEXes:', tools.exchanges.slice(0, 8).map(e => e.name).join(', '));
    } else if (command === 'quote') {
      const agg = args[1]?.toLowerCase();
      if (agg === 'paraswap' || agg === 'odos') {
        const chainId = args[2];
        const fromToken = args[3];
        const toToken = args[4];
        const amount = args[5];
        if (!chainId || !fromToken || !toToken || !amount) {
          console.error('Error: Missing parameters for same-chain quote.');
          printUsage();
          process.exit(1);
        }

        console.log(`\n[QUOTING] ${agg.toUpperCase()} on Chain ${chainId}...`);
        const quoteFn = agg === 'paraswap' ? getParaswapQuote : getOdosQuote;
        const res = await quoteFn({ chainId, fromToken, toToken, amount });

        console.log('\n=== Quote Summary ===');
        console.log(`Aggregator:   ${res.aggregator}`);
        console.log(`Chain ID:     ${res.chainId}`);
        console.log(`From Amount:  ${res.srcAmount}`);
        console.log(`To Amount:    ${res.destAmount}`);
        if (res.gasCostUSD) console.log(`Gas Est USD:  $${res.gasCostUSD}`);
        if (res.priceImpact) console.log(`Price Impact: ${res.priceImpact}%`);
        console.log('=====================\n');
      } else if (agg === 'lifi') {
        const fromChain = args[2];
        const toChain = args[3];
        const fromToken = args[4];
        const toToken = args[5];
        const amount = args[6];
        if (!fromChain || !toChain || !fromToken || !toToken || !amount) {
          console.error('Error: Missing parameters for LI.FI bridge quote.');
          printUsage();
          process.exit(1);
        }

        console.log(`\n[QUOTING] LI.FI Bridge: Chain ${fromChain} -> Chain ${toChain}...`);
        const res = await getLifiQuote({ fromChain, toChain, fromToken, toToken, amount });

        console.log('\n=== Bridge Quote Summary ===');
        console.log(`Aggregator:    LI.FI`);
        console.log(`Route Tool:    ${res.tool}`);
        console.log(`Route:         Chain ${res.fromChain} -> Chain ${res.toChain}`);
        console.log(`From Amount:   ${res.fromAmount}`);
        console.log(`Est. Received: ${res.toAmount}`);
        console.log(`Min. Received: ${res.toAmountMin}`);
        console.log(`Est. Duration: ${res.executionDuration} seconds`);
        console.log('============================\n');
      } else {
        console.error(`Unknown aggregator: ${agg}`);
        printUsage();
        process.exit(1);
      }
    } else {
      console.error(`Unknown command: ${command}`);
      printUsage();
      process.exit(1);
    }
  } catch (err) {
    console.error(`\n[ERROR] ${err.message}\n`);
    process.exit(1);
  }
}

main();
