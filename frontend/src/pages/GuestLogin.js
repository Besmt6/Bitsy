import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Loader2, Mail, Phone, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

const GuestLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.email || !formData.phone) {
      setError('Please enter both email and phone number');
      return;
    }

    setLoading(true);

    try {
      // Store guest credentials in sessionStorage
      sessionStorage.setItem('guestAuth', JSON.stringify({
        email: formData.email.toLowerCase(),
        phone: formData.phone
      }));
      
      toast.success('Access granted! Loading your bookings...');
      navigate('/guest/bookings');
    } catch (err) {
      setError('Unable to access bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-theme="guest" className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-6xl">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-heading font-bold text-lg">B</span>
            </div>
            <span className="font-heading font-bold text-xl">Bitsy Guest</span>
          </div>
          <a href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Back to Home
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Login Form */}
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-heading font-bold tracking-tight">Access Your Bookings</h1>
              <p className="text-lg text-muted-foreground">
                Enter your email and phone number to view and manage your reservations
              </p>
            </div>

            <Card className="shadow-[var(--shadow-md)] border-border/50">
              <CardHeader>
                <CardTitle>Guest Lookup</CardTitle>
                <CardDescription>No account needed - just your booking details</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="pl-10"
                        data-testid="guest-lookup-email-input"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1 234 567 8900"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="pl-10"
                        data-testid="guest-lookup-phone-input"
                        required
                      />
                    </div>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-11"
                    disabled={loading}
                    data-testid="guest-lookup-submit-button"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Accessing...
                      </>
                    ) : (
                      'View My Bookings'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Info Panel */}
          <div className="space-y-6">
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  Why We Ask
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <p className="font-medium mb-1">Email</p>
                  <p className="text-muted-foreground">Used to identify your bookings across all hotels on Bitsy</p>
                </div>
                <div>
                  <p className="font-medium mb-1">Phone Number</p>
                  <p className="text-muted-foreground">Verifies your identity and matches your booking records</p>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">Privacy:</strong> We never share your details. No password or account creation required.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>What You Can Do</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-primary">1</span>
                  </div>
                  <p className="text-muted-foreground">View all your upcoming, past, and cancelled bookings</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-primary">2</span>
                  </div>
                  <p className="text-muted-foreground">Cancel bookings (if eligible based on payment method)</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-primary">3</span>
                  </div>
                  <p className="text-muted-foreground">List crypto bookings on our marketplace if plans change</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GuestLogin;
