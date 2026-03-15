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
import { PaymentMethodComparison } from '../components/PaymentMethodComparison';

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
            <Link to="/browse" className="text-sm font-medium hover:text-primary transition-colors" data-testid="nav-browse-link">Browse Hotels</Link>
            <a href="#features" className="text-sm font-medium hover:text-primary transition-colors" data-testid="nav-features-link">Features</a>
            <a href="#pricing" className="text-sm font-medium hover:text-primary transition-colors" data-testid="nav-pricing-link">Pricing</a>
            <a href="#how-it-works" className="text-sm font-medium hover:text-primary transition-colors" data-testid="nav-how-it-works-link">How It Works</a>
            <Link to="/guest" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors border-l pl-8 ml-2" data-testid="nav-guest-portal-link">
              👤 Guest Portal
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Link to="/login">
              <Button variant="ghost" size="sm" data-testid="landing-signin-button">Hotel Sign In</Button>
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
            {/* User Type Selector - Prominent at Top */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-8">
              <Link to="/register">
                <Card className="border-2 border-primary hover:border-primary hover:shadow-xl transition-all duration-300 cursor-pointer group h-full">
                  <CardContent className="pt-6 text-center">
                    <Building2 className="h-10 w-10 mx-auto text-primary mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="font-heading font-bold text-xl mb-1">I'm a Hotel Owner</h3>
                    <p className="text-sm text-muted-foreground mb-4">Start accepting crypto payments</p>
                    <Button size="lg" className="w-full" data-testid="hero-hotel-cta">
                      Get Started Free
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/guest">
                <Card className="border-2 border-muted hover:border-primary/50 hover:shadow-xl transition-all duration-300 cursor-pointer group h-full">
                  <CardContent className="pt-6 text-center">
                    <Users className="h-10 w-10 mx-auto text-primary mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="font-heading font-bold text-xl mb-1">I'm a Guest</h3>
                    <p className="text-sm text-muted-foreground mb-4">View or manage my booking</p>
                    <Button size="lg" variant="outline" className="w-full" data-testid="hero-guest-cta">
                      Guest Portal
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            </div>

            <Badge className="bg-accent/10 text-accent border-accent/20 hover:bg-accent/20 transition-colors" data-testid="hero-badge">
              <Sparkles className="h-3 w-3 mr-1" />
              MCP-Enabled • Zero Commission • Multi-Chain Crypto
            </Badge>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold tracking-tight leading-[1.1]">
              Your Hotel. Your Wallets.{' '}
              <span className="text-primary">Zero Commissions</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Accept crypto payments across 6 blockchains. Get discovered in <span className="font-semibold text-foreground">ChatGPT & Claude</span> via MCP. Keep 100% of every booking.
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
                onClick={() => {
                  const videoSection = document.getElementById('demo-video');
                  if (videoSection) {
                    videoSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
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
              <div className="text-3xl md:text-4xl font-heading font-bold text-primary" data-testid="stat-hotels">Built for Growth</div>
              <div className="text-sm text-muted-foreground">Independent Hotels</div>
            </div>
            <div className="text-center space-y-1">
              <div className="text-3xl md:text-4xl font-heading font-bold text-primary" data-testid="stat-savings">100%</div>
              <div className="text-sm text-muted-foreground">Revenue Retained</div>
            </div>
            <div className="text-center space-y-1">
              <div className="text-3xl md:text-4xl font-heading font-bold text-primary" data-testid="stat-commission">0%</div>
              <div className="text-sm text-muted-foreground">Commission Rate</div>
            </div>
            <div className="text-center space-y-1">


      {/* Demo Video Section */}
      <section id="demo-video" className="py-20 bg-gradient-to-br from-primary/5 to-accent/5" data-testid="landing-video-section">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12 space-y-4">
              <Badge className="mb-2">Product Demo</Badge>
              <h2 className="text-4xl md:text-5xl font-heading font-bold">
                See Bitsy in Action
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Watch how hotels are accepting crypto and getting discovered by AI assistants
              </p>
            </div>
            
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-primary/10 bg-black">
              <div className="aspect-video">
                <video
                  controls
                  className="w-full h-full object-contain bg-black"
                  data-testid="demo-video-player"
                  preload="metadata"
                >
                  <source src="https://customer-assets.emergentagent.com/job_bitsy-tools/artifacts/1aftjt2m_Bitsy_-_AI_Conversational_Booking_Demo_with_captions.mp4" type="video/mp4" />
                  Your browser doesn't support video playback.
                </video>
              </div>
            </div>
            
            <div className="text-center mt-8">
              <Link to="/register">
                <Button size="lg" className="h-12 px-8 shadow-md hover:shadow-lg transition-all">
                  Start Your Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

              <div className="text-3xl md:text-4xl font-heading font-bold text-accent" data-testid="stat-chains">6 Chains</div>
              <div className="text-sm text-muted-foreground">Crypto Networks</div>
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
                    Your Annual Booking Revenue (from OTAs)
                  </label>
                  <p className="text-xs text-muted-foreground mb-3">
                    Enter your total yearly revenue from platforms like Booking.com, Expedia, etc.
                  </p>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">$</span>
                    <Input
                      id="revenue-input"
                      type="number"
                      value={bookings}
                      onChange={(e) => setBookings(Number(e.target.value))}
                      className="pl-8 text-lg h-14 font-heading"
                      placeholder="200000"
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
              Built for Independent Hotels
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The only platform combining MCP AI discovery, multi-chain crypto, and zero commissions in one system
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
                <CardTitle className="text-xl">AI Discovery (MCP)</CardTitle>
                <CardDescription className="text-base leading-relaxed pt-2">
                  Get discovered when travelers ask ChatGPT or Claude for hotel recommendations. Direct bookings, no OTA fees.
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
                <CardTitle className="text-xl">8 Languages Supported</CardTitle>
                <CardDescription className="text-base leading-relaxed pt-2">
                  Widget speaks English, Spanish, French, German, Japanese, Chinese, Portuguese, Italian. AI responds in guest's language automatically.
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


      {/* Payment Methods Education */}
      <section id="payment-methods" className="py-20 md:py-28 bg-gradient-to-br from-primary/5 to-accent/5" data-testid="landing-payment-methods-section">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <Badge className="mb-2">Payment Options</Badge>
            <h2 className="text-4xl md:text-5xl font-heading font-bold">
              Choose What Works for You
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Crypto-first with traditional fallback. Hotels and guests both win.
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <PaymentMethodComparison variant="full" />
            
            <Card className="mt-8 bg-primary text-primary-foreground border-0">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-heading font-bold mb-3">💡 Pro Tip</h3>
                <p className="text-lg opacity-90 leading-relaxed">
                  Start with <strong>crypto-only</strong> to attract Web3 travelers and get instant settlements. 
                  Enable <strong>pay-at-property</strong> later if you want to serve traditional guests.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 md:py-28" data-testid="landing-pricing-section">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <Badge className="mb-2" data-testid="pricing-badge">Pricing</Badge>
            <h2 className="text-4xl md:text-5xl font-heading font-bold">
              Pay Only What You Save
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Try everything free for your first $5,000 in bookings. Then pay 2-4% per booking vs OTA's 20%.
            </p>
            <div className="inline-flex items-center gap-2 bg-[hsl(var(--success))]/10 border border-[hsl(var(--success))]/30 rounded-full px-6 py-3 mt-4">
              <CheckCircle2 className="h-5 w-5 text-[hsl(var(--success))]" />
              <span className="font-semibold text-[hsl(var(--success))]">First $5,000 in bookings completely FREE</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="border-2 hover:shadow-lg transition-all" data-testid="pricing-card-free">
              <CardHeader className="space-y-4">
                <CardTitle className="text-2xl font-heading">Starter</CardTitle>
                <CardDescription>For small independent hotels</CardDescription>
                <div className="pt-2">
                  <span className="text-5xl font-heading font-bold">2%</span>
                  <span className="text-muted-foreground text-lg">/booking</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  After first $5,000 free
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted/50 rounded-lg p-4 text-center border">
                  <p className="text-xs text-muted-foreground mb-1">Example: $100 booking</p>
                  <p className="text-2xl font-heading font-bold text-[hsl(var(--success))]">You keep $98</p>
                  <p className="text-xs text-muted-foreground mt-1">vs $80 with OTAs</p>
                </div>
                <ul className="space-y-3">
                  {['AI booking widget (conversational + calendar picker)', 'Bitcoin + Ethereum payments', 'Web3 wallet integration', 'Basic dashboard & stats', 'Email notifications', '1 hotel property'].map(f => (
                    <li key={f} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/register">
                  <Button variant="outline" className="w-full h-11" data-testid="pricing-free-cta">Start Free Trial</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary shadow-xl relative scale-105" data-testid="pricing-card-pro">
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground" data-testid="pricing-pro-badge">Most Popular</Badge>
              <CardHeader className="space-y-4">
                <CardTitle className="text-2xl font-heading">Pro</CardTitle>
                <CardDescription>For hotels maximizing AI discovery</CardDescription>
                <div className="pt-2">
                  <span className="text-5xl font-heading font-bold">3%</span>
                  <span className="text-muted-foreground text-lg">/booking</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  After first $5,000 free
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-primary/5 rounded-lg p-4 text-center border border-primary/20">
                  <p className="text-xs text-muted-foreground mb-1">Example: $200K/year</p>
                  <p className="text-2xl font-heading font-bold text-primary">Save $34,000</p>
                  <p className="text-xs text-muted-foreground mt-1">vs $40K in OTA fees</p>
                </div>
                <ul className="space-y-3">
                  {['Everything in Starter', '🔥 MCP AI Discovery (ChatGPT, Claude, Perplexity)', 'All 6 blockchains (ETH, BTC, Polygon, Base, Arbitrum, Optimism)', '🌍 8 languages (EN, ES, FR, DE, JA, ZH, PT, IT)', 'Analytics dashboard (track AI searches)', 'Photo/video uploads', 'Telegram notifications', 'Priority support'].map(f => (
                    <li key={f} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/register">
                  <Button className="w-full h-11 shadow-md hover:shadow-lg transition-all" data-testid="pricing-pro-cta">Start Free Trial</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-all relative overflow-hidden" data-testid="pricing-card-enterprise">
              <div className="absolute top-4 right-4 bg-accent text-white text-xs font-bold px-3 py-1 rounded-full">
                Coming Q2 2026
              </div>
              <CardHeader className="space-y-4">
                <CardTitle className="text-2xl font-heading">Enterprise</CardTitle>
                <CardDescription>For hotel chains & management companies</CardDescription>
                <div className="pt-2">
                  <span className="text-5xl font-heading font-bold">4%</span>
                  <span className="text-muted-foreground text-lg">/booking</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  After first $5,000 free per property
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-accent/5 rounded-lg p-4 text-center border border-accent/20">
                  <p className="text-xs text-muted-foreground mb-1">Example: $500K/year (5 properties)</p>
                  <p className="text-2xl font-heading font-bold text-accent">Save $80,000</p>
                  <p className="text-xs text-muted-foreground mt-1">vs $100K in OTA fees</p>
                </div>
                <ul className="space-y-3">
                  {['Everything in Pro', '✨ Unlimited hotel properties', 'Multi-property dashboard', 'Consolidated analytics', 'White-label widget', 'API access', 'Dedicated support'].map(f => (
                    <li key={f} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{f}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  variant="outline" 
                  className="w-full h-11" 
                  data-testid="pricing-enterprise-cta"
                  onClick={() => window.open('mailto:hello@getbitsy.ai?subject=Enterprise Pre-Order Interest', '_blank')}
                >
                  Join Waitlist
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>


      {/* FAQ Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-2xl font-heading font-bold text-center mb-12">Common Questions</h3>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">How does billing work?</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground leading-relaxed">
                  <p>Your first <strong>$5,000 in booking revenue is completely free</strong> (or 30 days, whichever comes first). After that, we track every booking and send you a monthly invoice. If you don't pay, your widget gets disabled after 30 days - but we know you will because Bitsy is saving you thousands! 😊</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Do I need to create crypto wallets?</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground leading-relaxed">
                  <p>You'll connect your existing wallet (MetaMask, Coinbase, Trust Wallet, etc.) directly through our <strong>secure in-app wizard</strong>. Just paste your <strong>public addresses</strong> into the Bitsy dashboard. Guests pay directly to YOUR wallets - we never touch your funds or private keys.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">How do I add Bitsy to my website?</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground leading-relaxed">
                  <p>After signing up, go to Dashboard → <strong>Widget</strong> tab. Copy the embed code (one line of JavaScript) and paste it into your website's HTML before the closing <code className="bg-muted px-2 py-0.5 rounded">&lt;/body&gt;</code> tag. Takes 2 minutes. Works with any website builder (WordPress, Wix, Squarespace, custom HTML).</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What happens after I reach $5,000 in bookings?</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground leading-relaxed">
                  <p>We'll send you an email with your usage summary and let you <strong>choose your plan</strong> (Starter 2%, Pro 3%, or Enterprise 4%). You pick based on which features you actually used during the trial. Then you'll get a monthly invoice going forward.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Can I manage multiple hotels?</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground leading-relaxed">
                  <p>Multi-property management is coming in our <strong>Enterprise tier (Q2 2026)</strong>. For now, each account can manage 1 hotel. If you operate multiple properties, <a href="mailto:hello@getbitsy.ai?subject=Enterprise Waitlist" className="text-primary hover:underline">join the waitlist</a> and we'll notify you when it launches!</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What languages does Bitsy support?</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground leading-relaxed">
                  <p>Bitsy speaks <strong>8 languages</strong>: English, Spanish, French, German, Japanese, Chinese, Portuguese, and Italian. The widget auto-detects your guest's browser language and the AI responds naturally in their language. Guests can also switch languages anytime using the dropdown in the chat widget.</p>
                </CardContent>
              </Card>
            </div>
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
              <span>Zero-commission crypto booking platform</span>
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
