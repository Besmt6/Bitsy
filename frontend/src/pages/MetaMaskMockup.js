import React from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { CheckCircle2 } from 'lucide-react';

const MetaMaskMockup = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-8">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, #6366f1 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }}></div>
      </div>

      <div className="relative z-10 space-y-6" style={{ transform: 'scale(1.1)' }}>
        {/* Payment Options Card */}
        <Card className="w-[480px] shadow-2xl border-2 p-6">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-heading font-bold mb-2">Choose Payment Method</h3>
            <p className="text-sm text-muted-foreground">Complete your booking for Deluxe Suite</p>
          </div>

          {/* Web3 Wallet Option - HIGHLIGHTED */}
          <div className="relative mb-4">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl blur opacity-30 animate-pulse"></div>
            <Button 
              className="relative w-full h-16 text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-xl"
            >
              <div className="flex items-center justify-center gap-3">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="2" y="5" width="20" height="14" rx="2"/>
                  <path d="M2 10h20"/>
                </svg>
                <span>Pay with Crypto Wallet</span>
              </div>
            </Button>
          </div>
          
          <div className="flex items-center gap-3 justify-center mb-4">
            <Badge variant="secondary" className="text-xs">MetaMask</Badge>
            <Badge variant="secondary" className="text-xs">Coinbase Wallet</Badge>
            <Badge variant="secondary" className="text-xs">WalletConnect</Badge>
          </div>

          {/* Connection Success State */}
          <div className="mt-6 p-4 bg-[hsl(var(--success))]/10 border-2 border-[hsl(var(--success))]/30 rounded-xl">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-[hsl(var(--success))] flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-sm mb-1">Wallet Connected</p>
                <p className="text-xs text-muted-foreground font-mono">0x742d35...5f0bEb1</p>
              </div>
            </div>
          </div>

          {/* Chain Selector */}
          <div className="mt-4 p-4 bg-muted/50 rounded-xl">
            <p className="text-xs font-medium text-muted-foreground mb-3">Select Blockchain:</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { name: 'Ethereum', selected: true },
                { name: 'Polygon', selected: false },
                { name: 'Base', selected: false },
                { name: 'Arbitrum', selected: false },
                { name: 'Optimism', selected: false },
                { name: 'BSC', selected: false }
              ].map((chain) => (
                <button
                  key={chain.name}
                  className={`p-2 rounded-lg text-xs font-medium transition-all ${
                    chain.selected 
                      ? 'bg-primary text-primary-foreground shadow-md' 
                      : 'bg-background border hover:border-primary/50'
                  }`}
                >
                  {chain.name}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Amount */}
          <div className="mt-4 p-4 bg-primary/5 rounded-xl border border-primary/20">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Amount to Pay</p>
              <p className="text-4xl font-heading font-bold text-primary">$398</p>
              <p className="text-xs text-muted-foreground mt-1">Booking Reference: #BTS-892K4</p>
            </div>
          </div>

          {/* Send Payment Button */}
          <Button className="w-full h-14 text-lg font-semibold mt-6 shadow-lg">
            Send Payment
          </Button>

          <p className="text-center text-xs text-muted-foreground mt-4">
            Secure on-chain verification • Instant confirmation
          </p>
        </Card>

        {/* MetaMask Extension Popup Overlay */}
        <div className="absolute -right-80 top-20">
          <Card className="w-[360px] shadow-2xl border-2 border-orange-200 bg-white">
            <div className="bg-gradient-to-r from-orange-400 to-orange-500 p-4 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21.5 8.5l-3-3L16 8l1.5 1.5L21 6l.5 2.5zM8.5 21.5l-3-3L8 16l1.5 1.5L6 21l2.5.5zM12 2L8 6l4 4 4-4-4-4zm0 20l-4-4 4-4 4 4-4 4zM2 12l4-4 4 4-4 4-4-4zm20 0l-4-4-4 4 4 4 4-4z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="font-bold text-lg">MetaMask</div>
                  <div className="text-xs opacity-90">Ethereum Mainnet</div>
                </div>
              </div>
            </div>

            <div className="p-5">
              <div className="text-center mb-4">
                <p className="text-sm font-semibold mb-1">Signature Request</p>
                <p className="text-xs text-muted-foreground">Test Hotel Photo Upload is requesting your signature</p>
              </div>

              <div className="bg-slate-50 rounded-lg p-4 mb-4 font-mono text-xs break-all">
                <p className="text-slate-600">Booking Payment</p>
                <p className="text-slate-800 mt-1">Amount: $398 USD</p>
                <p className="text-slate-600 mt-1">Ref: BTS-892K4</p>
              </div>

              <div className="space-y-2">
                <Button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                  Sign Transaction
                </Button>
                <Button variant="outline" className="w-full">
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Watermark */}
      <div className="absolute bottom-8 right-8 text-sm text-muted-foreground">
        getbitsy.ai
      </div>
    </div>
  );
};

export default MetaMaskMockup;
