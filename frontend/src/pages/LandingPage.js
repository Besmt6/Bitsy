import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { 
  Zap, 
  Shield, 
  Coins, 
  Bot, 
  TrendingUp, 
  Globe, 
  CheckCircle2,
  ArrowRight,
  Sparkles,
  BarChart3,
  Users,
  DollarSign,
  Building2
} from 'lucide-react';
import { formatCurrency } from '../lib/utils';

const LandingPage = () => {
  const [bookings, setBookings] = useState(200000);
  const otaCommission = bookings * 0.2;
  const savings = otaCommission;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b" data-testid="landing-header">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2" data-testid="landing-logo-link">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-heading font-bold text-lg">B</span>
            </div>
            <span className="font-heading font-bold text-xl">Bitsy</span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-sm font-medium hover:text-primary transition-colors" data-testid="nav-features-link">Features</a>
            <a href="#pricing" className="text-sm font-medium hover:text-primary transition-colors" data-testid="nav-pricing-link">Pricing</a>
            <a href="#how-it-works" className="text-sm font-medium hover:text-primary transition-colors" data-testid="nav-how-it-works-link">How It Works</a>
          </nav>

          <div className="flex items-center space-x-4">
            <Link to="/login">
              <Button variant="ghost" size="sm" data-testid="landing-signin-button">Sign In</Button>
            </Link>
            <Link to="/register">
              <Button size="sm" data-testid="landing-get-started-button">Get Started Free</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden" data-testid="landing-hero-section">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-background bitsy-noise" />
        
        <div className="container mx-auto px-4 py-24 md:py-36 relative">
          <div className="max-w-5xl mx-auto text-center space-y-10">
            <Badge className="bg-accent/10 text-accent border-accent/20 hover:bg-accent/20 transition-colors" data-testid="hero-badge">
              <Sparkles className="h-3 w-3 mr-1" />
              First MCP-Enabled Hotel Platform
            </Badge>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold tracking-tight leading-[1.1]">
              Break Free From{' '}
              <span className="text-primary">OTA Commissions</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              The first booking platform discoverable in <span className="font-semibold text-foreground">ChatGPT</span>, <span className="font-semibold text-foreground">Claude</span> & <span className="font-semibold text-foreground">Perplexity</span>. Accept crypto payments. Pay zero commissions.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link to="/register">
                <Button 
                  size="lg" 
                  className="text-lg h-14 px-10 shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
                  data-testid="hero-cta-register-button"
                >
                  Try Free for 30 Days
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg h-14 px-10 hover:bg-muted/70 transition-colors"
                data-testid="hero-watch-demo-button"
              >
                Watch Demo
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 text-sm text-muted-foreground pt-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                <span>5-minute setup</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-12 border-y bg-muted/20" data-testid="landing-stats-section">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <div className="text-center space-y-1">
              <div className="text-3xl md:text-4xl font-heading font-bold text-primary" data-testid="stat-hotels">120+</div>
              <div className="text-sm text-muted-foreground">Hotels Live</div>
            </div>
            <div className="text-center space-y-1">
              <div className="text-3xl md:text-4xl font-heading font-bold text-primary" data-testid="stat-bookings">$2.4M</div>
              <div className="text-sm text-muted-foreground">Crypto Processed</div>
            </div>
            <div className="text-center space-y-1">
              <div className="text-3xl md:text-4xl font-heading font-bold text-primary" data-testid="stat-savings">0%</div>
              <div className="text-sm text-muted-foreground">Commission Rate</div>
            </div>
            <div className="text-center space-y-1">
              <div className="text-3xl md:text-4xl font-heading font-bold text-accent" data-testid="stat-chains">6</div>
              <div className="text-sm text-muted-foreground">Blockchains</div>
            </div>
          </div>
        </div>
      </section>

      {/* Calculator Section */}
      <section className="py-20 md:py-28 bg-muted/30" data-testid="landing-calculator-section">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="border-2 shadow-lg">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-3xl md:text-4xl font-heading mb-3">
                  How Much Are OTAs Costing You?
                </CardTitle>
                <CardDescription className="text-base">
                  Calculate your annual savings with Bitsy's zero-commission model
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8 px-6 md:px-10 pb-10">
                <div>
                  <label className="text-sm font-medium mb-3 block" htmlFor="revenue-input">
                    Annual Booking Revenue
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">$</span>
                    <Input
                      id="revenue-input"
                      type="number"
                      value={bookings}
                      onChange={(e) => setBookings(Number(e.target.value))}
                      className="pl-8 text-lg h-14 font-heading"
                      data-testid="calculator-revenue-input"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-6 rounded-xl bg-destructive/10 border-2 border-destructive/20">
                    <p className="text-sm text-muted-foreground mb-2 font-medium">OTA Commission (20%)</p>
                    <p className="text-3xl md:text-4xl font-heading font-bold text-destructive" data-testid="calculator-commission-amount">
                      -{formatCurrency(otaCommission)}
                    </p>
                  </div>

                  <div className="p-6 rounded-xl bg-[hsl(var(--success))]/10 border-2 border-[hsl(var(--success))]/20">
                    <p className="text-sm text-muted-foreground mb-2 font-medium">Your Savings with Bitsy</p>
                    <p className="text-3xl md:text-4xl font-heading font-bold text-[hsl(var(--success))]" data-testid="calculator-savings-amount">
                      +{formatCurrency(savings)}
                    </p>
                  </div>
                </div>

                <div className="text-center pt-6">
                  <Link to="/register">
                    <Button size="lg" className="h-12 px-8" data-testid="calculator-cta-button">
                      Start Saving Today
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-28" data-testid="landing-features-section">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <Badge className="mb-2" data-testid="features-badge">Why Bitsy</Badge>
            <h2 className="text-4xl md:text-5xl font-heading font-bold">
              Everything You Need to Escape OTAs
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              AI-powered, crypto-native, commission-free booking platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card className="border-2 hover:shadow-lg hover:border-primary/20 transition-all" data-testid="feature-card-commissions">
              <CardHeader>
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Zap className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="text-xl">Zero Commissions</CardTitle>
                <CardDescription className="text-base leading-relaxed pt-2">
                  Keep 100% of every booking. No hidden fees, no percentage cuts. Ever.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:shadow-lg hover:border-accent/20 transition-all" data-testid="feature-card-ai-discovery">
              <CardHeader>
                <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                  <Bot className="h-7 w-7 text-accent" />
                </div>
                <CardTitle className="text-xl">AI-Discoverable (MCP)</CardTitle>
                <CardDescription className="text-base leading-relaxed pt-2">
                  First MCP-enabled platform. Get found when travelers ask ChatGPT, Claude, or Perplexity for hotels.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:shadow-lg hover:border-[hsl(var(--warning))]/20 transition-all" data-testid="feature-card-crypto">
              <CardHeader>
                <div className="w-14 h-14 rounded-xl bg-[hsl(var(--warning))]/10 flex items-center justify-center mb-4">
                  <Coins className="h-7 w-7 text-[hsl(var(--warning))]" />
                </div>
                <CardTitle className="text-xl">Multi-Chain Crypto</CardTitle>
                <CardDescription className="text-base leading-relaxed pt-2">
                  Accept Bitcoin, Ethereum, USDC, USDT across 6 blockchains. Direct to your wallet.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:shadow-lg hover:border-[hsl(var(--success))]/20 transition-all" data-testid="feature-card-verification">
              <CardHeader>
                <div className="w-14 h-14 rounded-xl bg-[hsl(var(--success))]/10 flex items-center justify-center mb-4">
                  <Shield className="h-7 w-7 text-[hsl(var(--success))]" />
                </div>
                <CardTitle className="text-xl">On-Chain Verification</CardTitle>
                <CardDescription className="text-base leading-relaxed pt-2">
                  Automatic blockchain verification. No manual checking. Instant confirmation.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:shadow-lg hover:border-primary/20 transition-all" data-testid="feature-card-ai-assistant">
              <CardHeader>
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <TrendingUp className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="text-xl">AI Booking Assistant</CardTitle>
                <CardDescription className="text-base leading-relaxed pt-2">
                  Smart chatbot handles bookings 24/7. Natural conversation, instant quotes.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:shadow-lg hover:border-accent/20 transition-all" data-testid="feature-card-global">
              <CardHeader>
                <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                  <Globe className="h-7 w-7 text-accent" />
                </div>
                <CardTitle className="text-xl">Global Reach</CardTitle>
                <CardDescription className="text-base leading-relaxed pt-2">
                  Attract crypto-wealthy travelers worldwide. Direct bookings, no intermediaries.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 md:py-28 bg-muted/30" data-testid="landing-how-it-works-section">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <Badge className="mb-2" data-testid="how-it-works-badge">Simple Setup</Badge>
            <h2 className="text-4xl md:text-5xl font-heading font-bold">
              Live in 5 Minutes
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              No technical expertise required. Copy, paste, and start accepting bookings.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-6">
              {[
                { step: 1, title: 'Sign Up', desc: 'Create your account with email and hotel name. No credit card required.', icon: Users },
                { step: 2, title: 'Add Rooms & Rates', desc: 'Configure room types, nightly rates, and availability in minutes.', icon: Building2 },
                { step: 3, title: 'Connect Wallets', desc: 'Add your crypto wallet addresses for 6 chains (BTC, ETH, Polygon, Base, Arbitrum, Optimism).', icon: Coins },
                { step: 4, title: 'Embed Widget', desc: 'Copy one line of code and paste into your website. Works with any CMS.', icon: Sparkles },
                { step: 5, title: 'Go Live', desc: 'Start accepting bookings instantly. Get discovered in ChatGPT and Claude via MCP.', icon: TrendingUp }
              ].map((item) => (
                <Card 
                  key={item.step} 
                  className="border-2 hover:shadow-md transition-all" 
                  data-testid={`how-it-works-step-${item.step}`}
                >
                  <CardContent className="flex gap-6 items-start p-6">
                    <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-heading font-bold text-xl shadow-sm">
                      {item.step}
                    </div>
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mt-1">
                      <item.icon className="h-6 w-6 text-accent" />
                    </div>
                    <div className="flex-1 pt-2">
                      <h3 className="text-xl font-heading font-semibold mb-2">{item.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 md:py-28" data-testid="landing-pricing-section">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <Badge className="mb-2" data-testid="pricing-badge">Pricing</Badge>
            <h2 className="text-4xl md:text-5xl font-heading font-bold">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-muted-foreground">
              No hidden fees. No commission. Ever.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="border-2 hover:shadow-lg transition-all" data-testid="pricing-card-free">
              <CardHeader className="space-y-4">
                <CardTitle className="text-2xl font-heading">Free</CardTitle>
                <CardDescription>Perfect for trying out Bitsy</CardDescription>
                <div className="pt-2">
                  <span className="text-5xl font-heading font-bold">$0</span>
                  <span className="text-muted-foreground text-lg">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {['Bitsy AI widget', 'Bitcoin payments', 'QR code generation', 'Max 10 bookings/month', 'Email notifications'].map(f => (
                    <li key={f} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/register">
                  <Button variant="outline" className="w-full h-11" data-testid="pricing-free-cta">Get Started</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary shadow-xl relative scale-105" data-testid="pricing-card-pro">
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground" data-testid="pricing-pro-badge">Most Popular</Badge>
              <CardHeader className="space-y-4">
                <CardTitle className="text-2xl font-heading">Pro</CardTitle>
                <CardDescription>For growing hotels</CardDescription>
                <div className="pt-2">
                  <span className="text-5xl font-heading font-bold">$99</span>
                  <span className="text-muted-foreground text-lg">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {['Everything in Free', '6 blockchains (ETH, BTC, Polygon, Base, Arbitrum, Optimism)', 'Web3 wallet integration', 'MCP AI discovery', 'Unlimited bookings', 'Analytics dashboard', 'Telegram notifications'].map(f => (
                    <li key={f} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/register">
                  <Button className="w-full h-11 shadow-md hover:shadow-lg transition-all" data-testid="pricing-pro-cta">Start Free Trial</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-all" data-testid="pricing-card-enterprise">
              <CardHeader className="space-y-4">
                <CardTitle className="text-2xl font-heading">Enterprise</CardTitle>
                <CardDescription>For hotel chains</CardDescription>
                <div className="pt-2">
                  <span className="text-5xl font-heading font-bold">$299</span>
                  <span className="text-muted-foreground text-lg">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {['Everything in Pro', 'White-label widget', 'Multi-property support', 'Custom integrations', 'Dedicated support', 'Priority features', 'Custom branding'].map(f => (
                    <li key={f} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm">{f}</span>
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="w-full h-11" data-testid="pricing-enterprise-cta">Contact Sales</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 bg-primary text-primary-foreground relative overflow-hidden" data-testid="landing-final-cta-section">
        <div className="absolute inset-0 bitsy-noise" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold leading-tight">
              Ready to Break Free?
            </h2>
            <p className="text-xl md:text-2xl opacity-90 max-w-2xl mx-auto leading-relaxed">
              Join hotels saving thousands on OTA commissions. Setup takes 5 minutes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link to="/register">
                <Button 
                  size="lg" 
                  variant="secondary" 
                  className="text-lg h-14 px-10 shadow-xl hover:shadow-2xl transition-all active:scale-[0.98]"
                  data-testid="final-cta-register-button"
                >
                  Try Free for 30 Days
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
            <p className="text-sm opacity-75 pt-2">
              No credit card • 5-min setup • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t" data-testid="landing-footer">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-heading font-bold">B</span>
              </div>
              <span className="font-heading font-bold text-xl">Bitsy</span>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="https://getbitsy.ai" className="hover:text-foreground transition-colors" data-testid="footer-home-link">getbitsy.ai</a>
              <span>•</span>
              <span>The first MCP-enabled hotel booking platform</span>
            </div>
            
            <p className="text-sm text-muted-foreground">
              © 2026 Bitsy. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
