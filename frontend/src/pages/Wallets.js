import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { PageLoadingSkeleton } from '../components/LoadingSkeletons';
import { walletAPI } from '../lib/api';
import { toast } from 'sonner';
import { Bitcoin, Wallet, AlertCircle, Save, CheckCircle2 } from 'lucide-react';

const cryptoInfo = [
  { key: 'bitcoin', label: 'Bitcoin', placeholder: 'bc1q...' },
  { key: 'ethereum', label: 'Ethereum', placeholder: '0x...' },
  { key: 'polygon', label: 'Polygon (USDC)', placeholder: '0x...' },
  { key: 'solana', label: 'Solana', placeholder: '...' },
  { key: 'tron', label: 'Tron (USDT)', placeholder: 'T...' }
];

const Wallets = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [wallets, setWallets] = useState({
    bitcoin: '',
    ethereum: '',
    polygon: '',
    solana: '',
    tron: ''
  });

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    try {
      setLoading(true);
      const response = await walletAPI.getWallets();
      setWallets(response.data.wallets);
    } catch (error) {
      console.error('Failed to fetch wallets:', error);
      toast.error('Failed to load wallets');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await walletAPI.updateWallets(wallets);
      toast.success('Wallet addresses saved successfully');
    } catch (error) {
      console.error('Failed to save wallets:', error);
      toast.error('Failed to save wallet addresses');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <PageLoadingSkeleton type="wallets" />;
  }

  return (
    <div className="max-w-4xl space-y-6 animate-in fade-in-50 duration-500">
      <div>
        <h2 className="text-2xl font-heading font-semibold">Crypto Wallets</h2>
        <p className="text-muted-foreground mt-1">Configure your cryptocurrency wallet addresses for payments</p>
      </div>

      <Alert>
        <Wallet className="h-4 w-4" />
        <AlertDescription className="text-sm leading-relaxed">
          <strong className="text-base">🦊 One MetaMask for All Chains (2026)</strong>
          <p className="mt-2">MetaMask now supports <strong>all chains</strong> in one wallet! Switch networks in MetaMask to get addresses for each chain:</p>
          
          <div className="mt-3 space-y-2 text-xs">
            <div className="flex items-start gap-2">
              <span className="font-mono bg-primary/10 px-2 py-0.5 rounded">0x...</span>
              <span><strong>EVM chains</strong> (Ethereum, Polygon, Base, Arbitrum, Optimism, BSC) → Use the <strong>SAME</strong> address for all</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-mono bg-purple-500/10 px-2 py-0.5 rounded">9Wz...</span>
              <span><strong>Solana</strong> → Switch MetaMask to Solana network → Copy the <strong>Solana address</strong> (different format)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-mono bg-orange-500/10 px-2 py-0.5 rounded">bc1...</span>
              <span><strong>Bitcoin</strong> → Switch MetaMask to Bitcoin network → Copy the <strong>Bitcoin address</strong> (different format)</span>
            </div>
          </div>
          
          <p className="mt-3 text-xs"><strong>✅ Guest Compatibility:</strong> Guests can pay using <strong>any wallet</strong> (Phantom, Coinbase, Trust Wallet, etc.) as long as they send to the correct chain. Bitsy's QR codes automatically show the right address per chain.</p>
          
          <p className="mt-2 text-xs text-muted-foreground">💡 You only need to enter <strong>public addresses</strong> (receive addresses). Never share private keys or recovery phrases.</p>
        </AlertDescription>
      </Alert>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="bitcoin" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            {cryptoInfo.map((crypto) => (
              <TabsTrigger key={crypto.key} value={crypto.key} className="text-xs">
                {crypto.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {cryptoInfo.map((crypto) => (
            <TabsContent key={crypto.key} value={crypto.key} className="mt-6">
              <Card className="transition-all duration-200 hover:shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-primary" />
                    {crypto.label} Wallet
                  </CardTitle>
                  <CardDescription>
                    Enter your {crypto.label} wallet address to receive payments
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={crypto.key}>Wallet Address</Label>
                    <Input
                      id={crypto.key}
                      placeholder={crypto.placeholder}
                      value={wallets[crypto.key] || ''}
                      onChange={(e) => setWallets({...wallets, [crypto.key]: e.target.value})}
                      className="font-mono text-sm transition-all duration-200 focus:scale-[1.01]"
                      data-testid={`wallet-${crypto.key}-input`}
                    />
                    <p className="text-xs text-muted-foreground">
                      Guests selecting {crypto.label} will send payment to this address
                    </p>
                  </div>

                  {wallets[crypto.key] && (
                    <Alert className="border-[hsl(var(--success))]/30 bg-[hsl(var(--success))]/5 animate-in fade-in-50 duration-300">
                      <CheckCircle2 className="h-4 w-4 text-[hsl(var(--success))]" />
                      <AlertDescription className="text-xs font-mono break-all text-[hsl(var(--success))]">
                        ✅ Address configured: {wallets[crypto.key]}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        <div className="flex justify-end mt-6">
          <Button 
            type="submit" 
            disabled={saving} 
            data-testid="wallets-save-button"
            className="transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Wallet Addresses'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Wallets;
