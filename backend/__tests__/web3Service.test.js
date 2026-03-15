import { describe, test, expect, beforeAll } from '@jest/globals';
import { getWeb3Service, getSupportedChains } from '../src/services/web3Service.js';

describe('Web3Service - viem Integration', () => {
  test('getSupportedChains returns 6 chains', () => {
    const chains = getSupportedChains();
    expect(chains).toHaveLength(6);
    expect(chains.map(c => c.key)).toEqual([
      'ethereum',
      'polygon',
      'base',
      'arbitrum',
      'optimism',
      'bsc'
    ]);
  });

  test('each chain has required properties', () => {
    const chains = getSupportedChains();
    chains.forEach(chain => {
      expect(chain).toHaveProperty('key');
      expect(chain).toHaveProperty('id');
      expect(chain).toHaveProperty('name');
      expect(chain).toHaveProperty('nativeCurrency');
      expect(chain).toHaveProperty('tokens');
      expect(chain).toHaveProperty('explorer');
    });
  });

  test('Web3Service initializes for Ethereum', () => {
    const service = getWeb3Service('ethereum');
    expect(service.chain.name).toBe('Ethereum');
    expect(service.chain.nativeCurrency.symbol).toBe('ETH');
    expect(service.chainKey).toBe('ethereum');
  });

  test('Web3Service throws error for unsupported chain', () => {
    expect(() => getWeb3Service('invalid-chain')).toThrow('Unsupported chain: invalid-chain');
  });

  test('getPaymentMethods returns native and token options', () => {
    const service = getWeb3Service('ethereum');
    const methods = service.getPaymentMethods();
    
    expect(methods.native.symbol).toBe('ETH');
    expect(methods.native.type).toBe('native');
    expect(methods.tokens).toBeInstanceOf(Array);
    expect(methods.tokens.length).toBeGreaterThan(0);
    expect(methods.tokens[0]).toHaveProperty('symbol');
    expect(methods.tokens[0]).toHaveProperty('address');
    expect(methods.tokens[0]).toHaveProperty('type', 'token');
  });

  test('getGasPrice returns gas data (requires network)', async () => {
    const service = getWeb3Service('ethereum');
    const gasData = await service.getGasPrice();
    
    expect(gasData).toHaveProperty('gasPrice');
    expect(gasData).toHaveProperty('maxFeePerGas');
    expect(gasData).toHaveProperty('maxPriorityFeePerGas');
    
    // If network is available, values should be numeric or 'N/A'
    expect(typeof gasData.gasPrice === 'string').toBe(true);
  }, 15000); // 15s timeout for network call

  test('verifyNativeTransaction rejects invalid tx hash', async () => {
    const service = getWeb3Service('ethereum');
    const result = await service.verifyNativeTransaction(
      '0xinvalidhash',
      100,
      '0x0000000000000000000000000000000000000000'
    );
    
    expect(result.verified).toBe(false);
    expect(result.error).toBeDefined();
  }, 15000);

  test('verifyTokenTransaction rejects unsupported token', async () => {
    const service = getWeb3Service('ethereum');
    const result = await service.verifyTokenTransaction(
      '0x1234',
      'INVALID_TOKEN',
      100,
      '0x0000000000000000000000000000000000000000'
    );
    
    expect(result.verified).toBe(false);
    expect(result.error).toContain('not supported');
  });
});
