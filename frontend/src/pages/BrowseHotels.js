import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { 
  Search, 
  MapPin, 
  ArrowRight,
  Sparkles,
  Hotel as HotelIcon
} from 'lucide-react';

const BrowseHotels = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
      const response = await fetch(
        `${backendUrl}/api/public/hotels/search?query=${encodeURIComponent(searchQuery)}`
      );

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setHotels(data.hotels || []);
      setSearched(true);
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search hotels. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-theme="marketplace" className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <Link to="/" className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="text-2xl font-heading font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Bitsy
            </div>
          </Link>
        </div>
      </header>

      {/* Hero Search Section */}
      <section className="border-b bg-gradient-to-br from-primary/5 via-background to-accent/5 relative">
        <div className="absolute inset-0 opacity-[0.06] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuOSIgbnVtT2N0YXZlcz0iNCIgLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgjbm9pc2UpIiAvPjwvc3ZnPg==')]" />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 relative">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold mb-3">
              Find Crypto-Accepting Hotels
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Search by city, town, or hotel name. Book with crypto through Bitsy AI.
            </p>
          </div>

          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Enter city, town, or hotel name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-32 h-14 text-base shadow-lg border-2"
                data-testid="hotel-search-input"
              />
              <Button 
                type="submit"
                disabled={loading || !searchQuery.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-10"
                data-testid="hotel-search-button"
              >
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </form>
        </div>
      </section>

      {/* Results Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-8 w-full" />
                </div>
              </Card>
            ))}
          </div>
        )}

        {error && (
          <Card className="p-8 text-center max-w-md mx-auto">
            <p className="text-destructive">{error}</p>
          </Card>
        )}

        {!loading && searched && hotels.length === 0 && (
          <Card className="p-12 text-center max-w-md mx-auto">
            <HotelIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-heading font-semibold mb-2">No Hotels Found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Try searching for a different city or location
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery('');
                setSearched(false);
                setHotels([]);
              }}
              data-testid="clear-search-button"
            >
              Clear Search
            </Button>
          </Card>
        )}

        {!loading && hotels.length > 0 && (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-heading font-semibold">
                Found {hotels.length} {hotels.length === 1 ? 'hotel' : 'hotels'}
              </h2>
            </div>

            <div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
              data-testid="hotel-results-grid"
            >
              {hotels.map((hotel) => (
                <Card 
                  key={hotel.id}
                  className="overflow-hidden shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all hover:-translate-y-1"
                  data-testid={`hotel-card-${hotel.slug}`}
                >
                  {/* Hotel Image */}
                  {hotel.primaryPhoto && (
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={hotel.primaryPhoto}
                        alt={hotel.name}
                        className="w-full h-full object-cover"
                      />
                      {hotel.lowestRate && (
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-background/95 backdrop-blur text-foreground border shadow-sm tabular-nums">
                            From ${hotel.lowestRate}/night
                          </Badge>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Hotel Info */}
                  <div className="p-4">
                    <h3 className="text-lg font-heading font-semibold mb-2 line-clamp-1" data-testid={`hotel-name-${hotel.slug}`}>
                      {hotel.name}
                    </h3>
                    
                    {(hotel.location?.city || hotel.location?.country) && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <MapPin className="h-3.5 w-3.5" />
                        <span className="line-clamp-1">
                          {hotel.location.city && `${hotel.location.city}, `}
                          {hotel.location.country}
                        </span>
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground mb-4">
                      {hotel.availableRooms} {hotel.availableRooms === 1 ? 'room type' : 'room types'} available
                    </div>

                    <Button 
                      asChild 
                      className="w-full"
                      data-testid={`view-hotel-button-${hotel.slug}`}
                    >
                      <Link to={`/book/${hotel.slug}`}>
                        View Hotel
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}

        {!searched && !loading && (
          <div className="text-center py-16 max-w-2xl mx-auto">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Search className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-2xl font-heading font-bold mb-3">Start Your Search</h2>
            <p className="text-muted-foreground mb-6">
              Enter a city, town, or hotel name above to discover crypto-accepting hotels worldwide.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {['Miami', 'New York', 'Tokyo', 'London', 'Dubai'].map((city) => (
                <Button
                  key={city}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery(city);
                    handleSearch({ preventDefault: () => {} });
                  }}
                  data-testid={`quick-search-${city.toLowerCase()}`}
                >
                  {city}
                </Button>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default BrowseHotels;
