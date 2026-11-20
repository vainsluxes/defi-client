import { NATIVE_SENTINEL } from './config.mjs';

const LIFI_API = 'https://li.quest/v1';

export async function getLifiQuote({ fromChain, toChain, fromToken, toToken, amount, userAddress, slippage = 300 }) {
  const params = new URLSearchParams({
    fromChain: fromChain.toString(),
    toChain: toChain.toString(),
    fromToken,
    toToken,
    fromAmount: amount.toString(),
    fromAddress: userAddress || '0x0000000000000000000000000000000000000001',
    slippage: (slippage / 10000).toString()
  });

  const url = `${LIFI_API}/quote?${params.toString()}`;
  const resp = await fetch(url);
  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`LI.FI error HTTP ${resp.status}: ${errText}`);
  }

  const data = await resp.json();
  const estimate = data.estimate || {};

  return {
    aggregator: 'LI.FI',
    fromChain: parseInt(fromChain),
    toChain: parseInt(toChain),
    fromToken,
    toToken,
    fromAmount: amount.toString(),
    toAmount: estimate.toAmount,
    toAmountMin: estimate.toAmountMin,
    executionDuration: estimate.executionDuration,
    tool: data.toolDetails?.name || data.tool,
    feeCosts: estimate.feeCosts,
    gasCosts: estimate.gasCosts,
    rawQuote: data
  };
}

export async function getLifiChains() {
  const resp = await fetch(`${LIFI_API}/chains`);
  if (!resp.ok) throw new Error(`LI.FI chains error HTTP ${resp.status}`);
  const data = await resp.json();
  return data.chains;
}

export async function getLifiTools() {
  const resp = await fetch(`${LIFI_API}/tools`);
  if (!resp.ok) throw new Error(`LI.FI tools error HTTP ${resp.status}`);
  const data = await resp.json();
  return data;
}
