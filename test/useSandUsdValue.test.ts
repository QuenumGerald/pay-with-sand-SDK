import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { useSandUsdValue } from '../src/useSandUsdValue';

const mkResponse = (body: any, contentType = 'application/json') => {
  const payload = typeof body === 'string' ? body : JSON.stringify(body);
  return {
    ok: true,
    headers: new Headers({ 'content-type': contentType }),
    json: async () => (typeof body === 'string' ? JSON.parse(body) : body),
    text: async () => payload,
  } as unknown as Response;
};

describe('useSandUsdValue', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    delete (process as any).env.PRICE_API_URL;
    delete (process as any).env.PRICE_API_JSON_PATH;
  });

  it('parses CoinGecko shape', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      mkResponse({ 'the-sandbox': { usd: 0.5 } })
    );
    const { result } = renderHook(() => useSandUsdValue('1000000000000000000', 18));
    await waitFor(() => expect(result.current.priceUsd).toBe(0.5));
    expect(result.current.usdValue).toContain('$');
  });

  it('parses plain text number', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      mkResponse('0.42', 'text/plain')
    );
    const { result } = renderHook(() => useSandUsdValue('1000000000000000000', 18));
    await waitFor(() => expect(result.current.priceUsd).toBe(0.42));
  });

  it('parses root-level JSON number', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      mkResponse(0.99)
    );
    const { result } = renderHook(() => useSandUsdValue('1000000000000000000', 18));
    await waitFor(() => expect(result.current.priceUsd).toBe(0.99));
  });

  it('parses using custom JSON path', async () => {
    (process as any).env.PRICE_API_URL = 'https://example.test/price';
    (process as any).env.PRICE_API_JSON_PATH = 'data.token.usd';
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      mkResponse({ data: { token: { usd: 1.23 } } })
    );
    const { result } = renderHook(() => useSandUsdValue('2000000000000000000', 18));
    await waitFor(() => expect(result.current.priceUsd).toBe(1.23));
    // 2 * 1.23 = 2.46 => formatted (locale-aware: allow , or . and any currency symbol)
    await waitFor(() => expect(result.current.usdValue.replace(/\s/g, '')).toMatch(/2[\.,]46/));
  });
});
