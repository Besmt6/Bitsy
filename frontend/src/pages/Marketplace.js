import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ShieldCheck, TrendingDown, Zap, Calendar, MapPin, ArrowRight, Search, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const Marketplace = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('savings');

  useEffect(() => {
    fetchListings();
  }, [sortBy]);

  const fetchListings = async () => {
    try {
      const response = await fetch(`${API_URL}/api/marketplace/listings?status=active&sortBy=${sortBy}`);
      const data = await response.json();
      
      if (data.success) {
        setListings(data.listings);
      } else {
        toast.error('Failed to load marketplace listings');
      }
    } catch (error) {
      toast.error('Failed to load marketplace listings');
      console.error('Fetch listings error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredListings = listings.filter(listing => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      listing.hotelName.toLowerCase().includes(query) ||
      listing.roomType.toLowerCase().includes(query) ||
      listing.bookingRef.toLowerCase().includes(query)
    );
  });

  return (
    <div data-theme="marketplace" className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-7xl">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-heading font-bold text-lg">B</span>
            </div>
            <span className="font-heading font-bold text-xl">Bitsy Marketplace</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/guest">
              <Button variant="outline" size="sm">My Bookings</Button>
            </Link>
            <Link to="/">
              <Button variant="ghost" size="sm">Home</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b bg-gradient-to-br from-primary/5 to-accent/5 relative">
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          <div className="max-w-3xl">
            <Badge className="mb-4">Secondary Marketplace</Badge>
            <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tight mb-4">
              Transfer Crypto Bookings, Risk-Free
            </h1>
            <p className="text-lg text-muted-foreground">
              Browse verified bookings from other guests. All transfers are on-chain verifiable. Zero commission.
            </p>
          </div>

          {/* Trust Indicators */}
          <div className="grid sm:grid-cols-3 gap-4 mt-8">
            <Card className="border-border/50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Verified Ownership</p>
                  <p className="text-xs text-muted-foreground">On-chain proof required</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Zap className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="font-semibold text-sm">No Commission</p>
                  <p className="text-xs text-muted-foreground">100% to seller</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                  <TrendingDown className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Best Discounts</p>
                  <p className="text-xs text-muted-foreground">Save up to 40%</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Filters & Listings */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by hotel or room type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="marketplace-search-input"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40" data-testid="marketplace-sort-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="savings">Best Savings</SelectItem>
                <SelectItem value="price_low">Price: Low to High</SelectItem>
                <SelectItem value="price_high">Price: High to Low</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-48 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredListings.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-heading font-semibold mb-2">No listings available</h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery ? 'Try a different search term' : 'Check back soon for new listings'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <Card 
                key={listing._id}
                className="hover:shadow-[var(--shadow-md)] transition-shadow cursor-pointer overflow-hidden"
                onClick={() => navigate(`/marketplace/${listing._id}`)}
                data-testid="marketplace-listing-card"
              >
                <div className="relative aspect-[16/10] bg-muted">
                  <img 
                    src="https://images.unsplash.com/photo-1652963426007-0d189dee3c56?w=600&q=80" 
                    alt={listing.hotelName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-success text-white border-0 shadow-lg">
                      <TrendingDown className="h-3 w-3 mr-1" />
                      {listing.savingsPercent}% OFF
                    </Badge>
                  </div>
                </div>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{listing.hotelName}</CardTitle>
                      <p className="text-sm text-muted-foreground truncate">{listing.roomType}</p>
                    </div>
                    <Badge variant="outline" className="flex-shrink-0">
                      <ShieldCheck className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(listing.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(listing.checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>

                  <div className="flex items-end justify-between pt-3 border-t">
                    <div>
                      <p className="text-xs text-muted-foreground line-through">${listing.originalPriceUsd}</p>
                      <p className="text-2xl font-heading font-bold text-primary">${listing.listingPriceUsd}</p>
                    </div>
                    <Button size="sm" variant="outline" data-testid="marketplace-view-listing-button">
                      View Deal
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs font-mono">
                      {listing.originalPaymentChain}
                    </Badge>
                    <span className="text-xs text-muted-foreground">Original payment</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Marketplace;
