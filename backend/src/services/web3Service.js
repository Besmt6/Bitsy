import { createPublicClient, http, parseUnits, formatUnits, decodeEventLog } from 'viem';
import { mainnet, polygon, base, arbitrum, optimism, bsc } from 'viem/chains';

// Chain configurations
export const CHAINS = {
  ethereum: {
    id: 1,
    name: 'Ethereum',
    viemChain: mainnet,
    rpcUrl: process.env.ETHEREUM_RPC || 'https://eth.llamarpc.com',
    explorer: 'https://etherscan.io',
    nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
    tokens: {
      USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F'
    }
  },
  polygon: {
    id: 137,
    name: 'Polygon',
    viemChain: polygon,
    rpcUrl: process.env.POLYGON_RPC || 'https://polygon-rpc.com',
    explorer: 'https://polygonscan.com',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    tokens: {
      USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F'
    }
  },
  base: {
    id: 8453,
    name: 'Base',
    viemChain: base,
    rpcUrl: process.env.BASE_RPC || 'https://mainnet.base.org',
    explorer: 'https://basescan.org',
    nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
    tokens: {
      USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
    }
  },
  arbitrum: {
    id: 42161,
    name: 'Arbitrum',
    viemChain: arbitrum,
    rpcUrl: process.env.ARBITRUM_RPC || 'https://arb1.arbitrum.io/rpc',
    explorer: 'https://arbiscan.io',
    nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
    tokens: {
      USDC: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
      USDT: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9'
    }
  },
  optimism: {
    id: 10,
    name: 'Optimism',
    viemChain: optimism,
    rpcUrl: process.env.OPTIMISM_RPC || 'https://mainnet.optimism.io',
    explorer: 'https://optimistic.etherscan.io',
    nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
    tokens: {
      USDC: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
      USDT: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58'
    }
  },
  bsc: {
    id: 56,
    name: 'BNB Chain',
    viemChain: bsc,
    rpcUrl: process.env.BSC_RPC || 'https://bsc-dataseed.binance.org',
    explorer: 'https://bscscan.com',
    nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
    tokens: {
      USDT: '0x55d398326f99059fF775485246999027B3197955',
      USDC: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d'
    }
  }
};

// ERC20 ABI for token transfers
const ERC20_ABI = [
  {
    type: 'function',
    name: 'transfer',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'balanceOf',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'decimals',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view'
  },
  {
    type: 'event',
    name: 'Transfer',
    inputs: [
      { name: 'from', type: 'address', indexed: true },
      { name: 'to', type: 'address', indexed: true },
      { name: 'value', type: 'uint256', indexed: false }
    ]
  }
];

export class Web3Service {
  constructor(chainKey) {
    if (!CHAINS[chainKey]) {
      throw new Error(`Unsupported chain: ${chainKey}`);
    }
    
    this.chain = CHAINS[chainKey];
    this.chainKey = chainKey;
    
    // Create public client (replaces ethers JsonRpcProvider)
    this.client = createPublicClient({
      chain: this.chain.viemChain,
      transport: http(this.chain.rpcUrl)
    });
  }

  /**
   * Verify native currency transaction (ETH, MATIC, BNB, etc.)
   */
  async verifyNativeTransaction(txHash, expectedAmountUSD, recipientAddress) {
    try {
      console.log(`🔍 Verifying native tx: ${txHash} on ${this.chain.name}`);
      
      // Get transaction details
      const tx = await this.client.getTransaction({ 
        hash: txHash 
      });
      
      if (!tx) {
        return { verified: false, error: 'Transaction not found' };
      }

      // Wait for confirmation (1 block)
      const receipt = await this.client.waitForTransactionReceipt({ 
        hash: txHash,
        confirmations: 1
      });
      
      if (!receipt || receipt.status !== 'success') {
        return { verified: false, error: 'Transaction failed' };
      }

      // Verify recipient (viem returns checksummed addresses)
      if (tx.to.toLowerCase() !== recipientAddress.toLowerCase()) {
        return { 
          verified: false, 
          error: `Wrong recipient. Expected: ${recipientAddress}, Got: ${tx.to}` 
        };
      }

      // Convert amount from wei to token units (viem uses bigint)
      const actualAmount = parseFloat(formatUnits(tx.value, this.chain.nativeCurrency.decimals));

      // For crypto payments, we accept the amount sent (not verifying USD equivalent)
      // Hotels should use stablecoins for USD-pegged pricing
      
      console.log(`✅ Native payment verified: ${actualAmount} ${this.chain.nativeCurrency.symbol}`);

      return {
        verified: true,
        txHash: tx.hash,
        from: tx.from,
        to: tx.to,
        amount: actualAmount,
        currency: this.chain.nativeCurrency.symbol,
        blockNumber: Number(receipt.blockNumber),
        confirmations: 1,
        explorerUrl: `${this.chain.explorer}/tx/${tx.hash}`,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Native tx verification error:', error);
      return { verified: false, error: error.message };
    }
  }

  /**
   * Verify token transaction (USDC, USDT, DAI, etc.)
   */
  async verifyTokenTransaction(txHash, tokenSymbol, expectedAmountUSD, recipientAddress) {
    try {
      console.log(`🔍 Verifying token tx: ${txHash} (${tokenSymbol}) on ${this.chain.name}`);
      
      const tokenAddress = this.chain.tokens[tokenSymbol];
      
      if (!tokenAddress) {
        return { 
          verified: false, 
          error: `Token ${tokenSymbol} not supported on ${this.chain.name}` 
        };
      }

      // Get transaction receipt
      const receipt = await this.client.waitForTransactionReceipt({ 
        hash: txHash,
        confirmations: 1
      });
      
      if (!receipt) {
        return { verified: false, error: 'Transaction not found' };
      }
      
      if (receipt.status !== 'success') {
        return { verified: false, error: 'Transaction failed' };
      }

      // Find Transfer event in logs
      let transferEvent = null;
      
      for (const log of receipt.logs) {
        // Only process logs from the token contract
        if (log.address.toLowerCase() !== tokenAddress.toLowerCase()) {
          continue;
        }
        
        try {
          const decoded = decodeEventLog({
            abi: ERC20_ABI,
            data: log.data,
            topics: log.topics
          });
          
          if (decoded.eventName === 'Transfer') {
            transferEvent = decoded;
            break;
          }
        } catch {
          continue;
        }
      }

      if (!transferEvent) {
        return { verified: false, error: 'No Transfer event found' };
      }

      const { from, to, value } = transferEvent.args;

      // Verify recipient
      if (to.toLowerCase() !== recipientAddress.toLowerCase()) {
        return { 
          verified: false, 
          error: `Wrong recipient. Expected: ${recipientAddress}, Got: ${to}` 
        };
      }

      // Get token decimals (USDC/USDT = 6, DAI = 18)
      const decimals = tokenSymbol === 'DAI' ? 18 : 6;
      const actualAmount = parseFloat(formatUnits(value, decimals));

      // For stablecoins, verify amount matches expected USD (with 2% tolerance)
      const expected = parseFloat(expectedAmountUSD);
      const tolerance = expected * 0.02; // 2% tolerance

      if (Math.abs(actualAmount - expected) > tolerance) {
        return { 
          verified: false, 
          error: `Amount mismatch. Expected: ${expected} ${tokenSymbol}, Got: ${actualAmount} ${tokenSymbol}` 
        };
      }

      console.log(`✅ Token payment verified: ${actualAmount} ${tokenSymbol}`);

      return {
        verified: true,
        txHash,
        from,
        to,
        amount: actualAmount,
        currency: tokenSymbol,
        token: tokenAddress,
        blockNumber: Number(receipt.blockNumber),
        explorerUrl: `${this.chain.explorer}/tx/${txHash}`,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Token tx verification error:', error);
      return { verified: false, error: error.message };
    }
  }

  /**
   * Get current gas price for the chain
   */
  async getGasPrice() {
    try {
      // viem's getGasPrice returns gas price in wei as bigint
      const gasPrice = await this.client.getGasPrice();
      
      // Convert to gwei for display
      const gasPriceGwei = formatUnits(gasPrice, 9); // gwei = 9 decimals
      
      // For EIP-1559 chains, get fee data
      try {
        const block = await this.client.getBlock({ blockTag: 'latest' });
        
        if (block.baseFeePerGas) {
          const baseFeeGwei = formatUnits(block.baseFeePerGas, 9);
          // Estimate max priority fee (typically 1-2 gwei)
          const maxPriorityFeeGwei = '2';
          const maxFeeGwei = (parseFloat(baseFeeGwei) + parseFloat(maxPriorityFeeGwei)).toString();
          
          return {
            gasPrice: gasPriceGwei,
            maxFeePerGas: maxFeeGwei,
            maxPriorityFeePerGas: maxPriorityFeeGwei
          };
        }
      } catch (err) {
        // Chain doesn't support EIP-1559, fallback to legacy
      }
      
      return {
        gasPrice: gasPriceGwei,
        maxFeePerGas: gasPriceGwei,
        maxPriorityFeePerGas: '0'
      };
    } catch (error) {
      console.error('Gas price fetch error:', error);
      return { gasPrice: 'N/A', maxFeePerGas: 'N/A', maxPriorityFeePerGas: 'N/A' };
    }
  }

  /**
   * Get supported payment methods for this chain
   */
  getPaymentMethods() {
    return {
      native: {
        symbol: this.chain.nativeCurrency.symbol,
        name: this.chain.nativeCurrency.name,
        type: 'native'
      },
      tokens: Object.keys(this.chain.tokens).map(symbol => ({
        symbol,
        address: this.chain.tokens[symbol],
        type: 'token'
      }))
    };
  }
}

/**
 * Factory function to get Web3 service for a specific chain
 */
export const getWeb3Service = (chainKey) => {
  return new Web3Service(chainKey);
};

/**
 * Get all supported chains
 */
export const getSupportedChains = () => {
  return Object.keys(CHAINS).map(key => ({
    key,
    id: CHAINS[key].id,
    name: CHAINS[key].name,
    nativeCurrency: CHAINS[key].nativeCurrency,
    tokens: Object.keys(CHAINS[key].tokens),
    explorer: CHAINS[key].explorer
  }));
};

/**
 * Verify a payment transaction (simplified wrapper)
 * @param {string} txHash - Transaction hash
 * @param {string} recipientAddress - Expected recipient address
 * @param {number} expectedAmountUSD - Expected amount in USD
 * @param {string} chain - Blockchain network
 * @returns {Promise<Object>} Verification result
 */
export const verifyPayment = async (txHash, recipientAddress, expectedAmountUSD, chain) => {
  try {
    const web3Service = getWeb3Service(chain.toLowerCase());
    
    // For now, verify native transaction (most common)
    // In production, detect token transfers vs native
    const result = await web3Service.verifyNativeTransaction(
      txHash,
      expectedAmountUSD,
      recipientAddress
    );
    
    return {
      isValid: result.verified,
      txHash: result.txHash,
      amount: result.amount,
      from: result.from,
      to: result.to,
      timestamp: result.timestamp,
      error: result.error || null
    };
  } catch (error) {
    console.error('Payment verification error:', error);
    return {
      isValid: false,
      error: error.message || 'Verification failed'
    };
  }
};
