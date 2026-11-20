import { NATIVE_SENTINEL, PARASWAP_NATIVE } from './config.mjs';

const PARASWAP_API = 'https://api.paraswap.io';

export async function getParaswapQuote({ chainId, fromToken, toToken, amount, userAddress, slippage = 100 }) {
  const srcToken = fromToken.toLowerCase() === NATIVE_SENTINEL.toLowerCase() ? PARASWAP_NATIVE : fromToken;
  const destToken = toToken.toLowerCase() === NATIVE_SENTINEL.toLowerCase() ? PARASWAP_NATIVE : toToken;

  const params = new URLSearchParams({
    srcToken,
    destToken,
    amount: amount.toString(),
    srcDecimals: '18',
    destDecimals: '6',
    side: 'SELL',
    network: chainId.toString(),
    version: '6.2'
  });

  if (userAddress) {
    params.set('userAddress', userAddress);
  }

  const url = `${PARASWAP_API}/prices?${params.toString()}`;
  const resp = await fetch(url);
  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`ParaSwap error HTTP ${resp.status}: ${errText}`);
  }

  const data = await resp.json();
  const priceRoute = data.priceRoute;

  return {
    aggregator: 'ParaSwap',
    chainId: parseInt(chainId),
    fromToken,
    toToken,
    srcAmount: priceRoute.srcAmount,
    destAmount: priceRoute.destAmount,
    gasCostUSD: priceRoute.gasCostUSD,
    priceRoute
  };
}
