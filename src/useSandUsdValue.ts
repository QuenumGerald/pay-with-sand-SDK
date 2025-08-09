import { useEffect, useMemo, useState } from 'react';
import { ethers } from 'ethers';

/**
 * Compute and format the USD value of a SAND amount using a live price.
 * - Reads optional PRICE_API_URL env to override the price endpoint.
 * - Defaults to CoinGecko simple price for The Sandbox (id: the-sandbox).
 *
 * @param amountWei string | bigint | ethers.BigNumber — token amount in smallest units (wei-like)
 * @param decimals number — token decimals (default 18)
 * @returns { usdValue, priceUsd, loading, error }
 */
export function useSandUsdValue(
  amountWei: string | bigint | ethers.BigNumber,
  decimals: number = 18
): {
  usdValue: string; // formatted, e.g. "$6.80"
  priceUsd: number | null; // unit price in USD
  loading: boolean;
  error: Error | null;
} {
  const [priceUsd, setPriceUsd] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Amount in human-readable units (e.g., 1.23 SAND)
  const amount = useMemo(() => {
    try {
      if (amountWei == null) return 0;
      return parseFloat(ethers.utils.formatUnits(amountWei as any, decimals));
    } catch (_e) {
      return 0;
    }
  }, [amountWei, decimals]);

  useEffect(() => {
    let canceled = false;
    const controller = new AbortController();

    const fetchPrice = async () => {
      if (!isFinite(amount) || amount <= 0) {
        setPriceUsd(null);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const apiUrl =
          (process.env.PRICE_API_URL as string | undefined) ||
          'https://api.coingecko.com/api/v3/simple/price?ids=the-sandbox&vs_currencies=usd';
        const res = await fetch(apiUrl, { signal: controller.signal });
        if (!res.ok) throw new Error(`PRICE_HTTP_${res.status}`);
        const contentType = (res.headers.get('content-type') || '').toLowerCase();
        // Support endpoints that return a bare number (text/plain or JSON number)
        if (!contentType.includes('json')) {
          const txt = await res.text();
          const num = parseFloat(txt.trim());
          if (isFinite(num)) {
            if (!canceled) setPriceUsd(num);
            return;
          }
          throw new Error('BAD_PRICE_TEXT');
        }
        const data = await res.json();
        // 1) If PRICE_API_JSON_PATH is provided, use it as a dot-path selector
        const path = (process.env.PRICE_API_JSON_PATH as string | undefined) || '';
        const getByPath = (obj: any, p: string): any => {
          if (!p) return undefined;
          return p.split('.').reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
        };

        const tryParse = (obj: any): number | null => {
          // explicit JSON path
          if (path) {
            const v = getByPath(obj, path);
            if (typeof v === 'number' && isFinite(v)) return v;
          }
          // common shapes
          // CoinGecko simple price
          if (typeof obj?.['the-sandbox']?.usd === 'number') return obj['the-sandbox'].usd;
          // direct number at known keys
          if (typeof obj?.usd === 'number') return obj.usd;
          if (typeof obj?.price === 'number') return obj.price;
          if (typeof obj?.priceUsd === 'number') return obj.priceUsd;
          if (typeof obj?.data?.usd === 'number') return obj.data.usd;
          if (typeof obj?.data?.price === 'number') return obj.data.price;
          if (typeof obj?.market_data?.current_price?.usd === 'number') return obj.market_data.current_price.usd;
          // array forms: [{ id: 'the-sandbox', usd: 0.4 }] or [{ symbol: 'sand', priceUsd: 0.4 }]
          if (Array.isArray(obj)) {
            for (const it of obj) {
              if (typeof it?.usd === 'number') return it.usd;
              if (typeof it?.price === 'number') return it.price;
              if (typeof it?.priceUsd === 'number') return it.priceUsd;
              if ((it?.id === 'the-sandbox' || it?.symbol === 'sand') && typeof it?.current_price?.usd === 'number') {
                return it.current_price.usd;
              }
            }
          }
          return null;
        };

        // direct root-level JSON number
        const rootNum = typeof data === 'number' && isFinite(data) ? data : null;
        const parsed = rootNum ?? tryParse(data);
        if (typeof parsed !== 'number' || !isFinite(parsed)) throw new Error('BAD_PRICE_PAYLOAD');
        if (!canceled) setPriceUsd(parsed);
      } catch (e: any) {
        if (e?.name === 'AbortError') return;
        if (!canceled) {
          setError(e instanceof Error ? e : new Error(String(e)));
          setPriceUsd(null);
        }
      } finally {
        if (!canceled) setLoading(false);
      }
    };

    fetchPrice();
    return () => {
      canceled = true;
      controller.abort();
    };
  }, [amount]);

  const usdValue = useMemo(() => {
    if (!isFinite(amount) || amount <= 0 || priceUsd == null) return '~';
    const value = amount * priceUsd;
    return value.toLocaleString(undefined, {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    });
  }, [amount, priceUsd]);

  return { usdValue, priceUsd, loading, error };
}
