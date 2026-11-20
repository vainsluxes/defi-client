import { NATIVE_SENTINEL, ODOS_NATIVE, CHAIN_MAP } from './config.mjs';

const ODOS_API = 'https://api.odos.xyz';

export async function getOdosQuote({ chainId, fromToken, toToken, amount, userAddress, slippage = 100 }) {
  // ODOS uses native 0x0000000000000000000000000000000000000000
  const inputToken = fromToken.toLowerCase() === NATIVE_SENTINEL.toLowerCase() ? ODOS_NATIVE : fromToken;
  const outputToken = toToken.toLowerCase() === NATIVE_SENTINEL.toLowerCase() ? ODOS_NATIVE : toToken;

  const payload = {
    chainId: parseInt(chainId),
    inputTokens: [
      {
        tokenAddress: inputToken,
        amount: amount.toString()
      }
    ],
    outputTokens: [
      {
        tokenAddress: outputToken,
        proportion: 1
      }
    ],
    userAddr: userAddress || '0x0000000000000000000000000000000000000001',
    slippageLimitPercent: slippage / 100,
    referralCode: 0,
    disableRFQs: false,
    compact: true
  };

  const resp = await fetch(`${ODOS_API}/sor/quote/v2`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`ODOS error HTTP ${resp.status}: ${errText}`);
  }

  const data = await resp.json();
  return {
    aggregator: 'ODOS',
    chainId: parseInt(chainId),
    fromToken,
    toToken,
    srcAmount: amount.toString(),
    destAmount: data.outAmounts ? data.outAmounts[0] : '0',
    gasEstimate: data.gasEstimate,
    priceImpact: data.priceImpact,
    rawQuote: data
  };
}
