import { ethers } from 'ethers';

// Chain configurations
export const CHAINS = {
  ethereum: {
    id: 1,
    name: 'Ethereum',
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
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'event Transfer(address indexed from, address indexed to, uint256 value)'
];

export class Web3Service {
  constructor(chainKey) {
    if (!CHAINS[chainKey]) {
      throw new Error(`Unsupported chain: ${chainKey}`);
    }
    
    this.chain = CHAINS[chainKey];
    this.chainKey = chainKey;
    this.provider = new ethers.JsonRpcProvider(this.chain.rpcUrl);
  }

  /**
   * Verify native currency transaction (ETH, MATIC, BNB, etc.)
   */
  async verifyNativeTransaction(txHash, expectedAmountUSD, recipientAddress) {
    try {
      console.log(`🔍 Verifying native tx: ${txHash} on ${this.chain.name}`);
      
      const tx = await this.provider.getTransaction(txHash);
      
      if (!tx) {
        return { verified: false, error: 'Transaction not found' };
      }

      // Wait for confirmation
      const receipt = await tx.wait(1); // 1 confirmation
      
      if (!receipt || receipt.status !== 1) {
        return { verified: false, error: 'Transaction failed' };
      }

      // Verify recipient
      if (tx.to.toLowerCase() !== recipientAddress.toLowerCase()) {
        return { 
          verified: false, 
          error: `Wrong recipient. Expected: ${recipientAddress}, Got: ${tx.to}` 
        };
      }

      // Convert amount from wei to token units
      const actualAmount = parseFloat(ethers.formatEther(tx.value));

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
        blockNumber: receipt.blockNumber,
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

      const receipt = await this.provider.getTransactionReceipt(txHash);
      
      if (!receipt) {
        return { verified: false, error: 'Transaction not found' };
      }
      
      if (receipt.status !== 1) {
        return { verified: false, error: 'Transaction failed' };
      }

      // Parse Transfer event
      const iface = new ethers.Interface(ERC20_ABI);
      let transferEvent = null;
      
      for (const log of receipt.logs) {
        try {
          const parsed = iface.parseLog(log);
          if (parsed && parsed.name === 'Transfer' && 
              log.address.toLowerCase() === tokenAddress.toLowerCase()) {
            transferEvent = { log, parsed };
            break;
          }
        } catch {
          continue;
        }
      }

      if (!transferEvent) {
        return { verified: false, error: 'No Transfer event found' };
      }

      const { parsed } = transferEvent;
      const to = parsed.args.to;
      const amount = parsed.args.value;

      // Verify recipient
      if (to.toLowerCase() !== recipientAddress.toLowerCase()) {
        return { 
          verified: false, 
          error: `Wrong recipient. Expected: ${recipientAddress}, Got: ${to}` 
        };
      }

      // Get token decimals (USDC/USDT = 6, DAI = 18)
      const decimals = tokenSymbol === 'DAI' ? 18 : 6;
      const actualAmount = parseFloat(ethers.formatUnits(amount, decimals));

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
        from: parsed.args.from,
        to,
        amount: actualAmount,
        currency: tokenSymbol,
        token: tokenAddress,
        blockNumber: receipt.blockNumber,
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
      const feeData = await this.provider.getFeeData();
      return {
        gasPrice: feeData.gasPrice ? ethers.formatUnits(feeData.gasPrice, 'gwei') : '0',
        maxFeePerGas: feeData.maxFeePerGas ? ethers.formatUnits(feeData.maxFeePerGas, 'gwei') : '0',
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ? ethers.formatUnits(feeData.maxPriorityFeePerGas, 'gwei') : '0'
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
