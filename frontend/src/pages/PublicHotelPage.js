import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Bed, 
  Sparkles,
  MessageSquare,
  ExternalLink,
  ArrowLeft
} from 'lucide-react';

const PublicHotelPage = () => {
  const { hotelSlug } = useParams();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        setLoading(true);
        const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
        const response = await fetch(`${backendUrl}/api/public/hotels/${hotelSlug}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Hotel not found');
          } else {
            setError('Failed to load hotel information');
          }
          return;
        }

        const data = await response.json();
        setHotel(data.hotel);
      } catch (err) {
        console.error('Error fetching hotel:', err);
        setError('Failed to load hotel information');
      } finally {
        setLoading(false);
      }
    };

    fetchHotel();
  }, [hotelSlug]);

  if (loading) {
    return (
      <div data-theme="marketplace" className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-96 w-full rounded-xl mb-8" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div data-theme="marketplace" className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full mx-4 p-8 text-center">
          <div className="text-5xl mb-4">🏨</div>
          <h1 className="text-2xl font-heading mb-2">Hotel Not Found</h1>
          <p className="text-muted-foreground mb-6">{error || 'This hotel page does not exist.'}</p>
          <Button asChild variant="default" data-testid="back-to-browse-button">
            <Link to="/browse">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Browse Hotels
            </Link>
          </Button>
        </Card>
      </div>
    );
  }

  const primaryPhoto = hotel.photos?.find(p => p.isPrimary)?.url || hotel.photos?.[0]?.url;
  const hasLocation = hotel.location?.city || hotel.location?.country;

  return (
    <div data-theme="marketplace" className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="text-2xl font-heading font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Bitsy
            </div>
          </Link>
          <Button asChild variant="ghost" size="sm" data-testid="browse-hotels-link">
            <Link to="/browse">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Browse Hotels
            </Link>
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Hero Section */}
        {primaryPhoto && (
          <div className="relative h-[300px] sm:h-[400px] rounded-xl overflow-hidden mb-8 shadow-[var(--shadow-md)]">
            <img 
              src={primaryPhoto} 
              alt={hotel.name}
              className="w-full h-full object-cover"
              data-testid="hotel-hero-image"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 text-white">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold mb-2" data-testid="hotel-name">
                {hotel.name}
              </h1>
              {hasLocation && (
                <div className="flex items-center gap-2 text-white/90">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm sm:text-base">
                    {hotel.location.city && `${hotel.location.city}, `}
                    {hotel.location.country}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* No hero photo fallback */}
        {!primaryPhoto && (
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold mb-2" data-testid="hotel-name">
              {hotel.name}
            </h1>
            {hasLocation && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span className="text-sm sm:text-base">
                  {hotel.location.city && `${hotel.location.city}, `}
                  {hotel.location.country}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Supported Chains */}
            {hotel.supportedChains && hotel.supportedChains.length > 0 && (
              <Card className="p-4 sm:p-6 shadow-[var(--shadow-sm)]">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-5 w-5 text-accent" />
                  <h2 className="text-lg font-heading font-semibold">Crypto Payments Accepted</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {hotel.supportedChains.map((chain) => (
                    <Badge 
                      key={chain} 
                      variant="secondary"
                      className="text-xs"
                      data-testid={`supported-chain-${chain.toLowerCase()}`}
                    >
                      {chain}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}

            {/* Available Rooms */}
            <div>
              <h2 className="text-2xl font-heading font-bold mb-4 flex items-center gap-2">
                <Bed className="h-6 w-6 text-primary" />
                Available Rooms
              </h2>
              
              {hotel.rooms.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">No rooms available at this time.</p>
                </Card>
              ) : (
                <div className="space-y-4" data-testid="rooms-list">
                  {hotel.rooms.map((room) => (
                    <Card 
                      key={room.id} 
                      className="overflow-hidden shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-shadow"
                      data-testid={`room-card-${room.id}`}
                    >
                      <div className="sm:flex">
                        {/* Room Photo */}
                        {room.photos && room.photos.length > 0 && (
                          <div className="sm:w-48 h-48 flex-shrink-0">
                            <img 
                              src={room.photos[0].url} 
                              alt={room.type}
                              className="w-full h-full object-cover"
                              data-testid={`room-photo-${room.id}`}
                            />
                          </div>
                        )}
                        
                        {/* Room Details */}
                        <div className="p-4 sm:p-6 flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-lg sm:text-xl font-heading font-semibold" data-testid={`room-type-${room.id}`}>
                              {room.type}
                            </h3>
                            <div className="text-right ml-4">
                              <div className="text-2xl font-heading font-bold tabular-nums" data-testid={`room-rate-${room.id}`}>
                                ${room.rate}
                              </div>
                              <div className="text-xs text-muted-foreground">per night</div>
                            </div>
                          </div>
                          
                          {room.description && (
                            <p className="text-sm text-muted-foreground mb-3">{room.description}</p>
                          )}
                          
                          {room.amenities && room.amenities.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {room.amenities.slice(0, 5).map((amenity, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {amenity}
                                </Badge>
                              ))}
                            </div>
                          )}
                          
                          <div className="text-xs text-muted-foreground">
                            {room.available} {room.available === 1 ? 'room' : 'rooms'} available
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Contact Info */}
            {(hotel.contact.phone || hotel.contact.email) && (
              <Card className="p-4 sm:p-6 shadow-[var(--shadow-sm)]">
                <h3 className="text-lg font-heading font-semibold mb-4">Contact Information</h3>
                <div className="space-y-3">
                  {hotel.contact.phone && (
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span data-testid="hotel-phone">{hotel.contact.phone}</span>
                    </div>
                  )}
                  {hotel.contact.email && (
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span data-testid="hotel-email">{hotel.contact.email}</span>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar - Booking CTA */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              <Card className="p-6 shadow-[var(--shadow-md)] border-2 border-primary/20">
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                    <MessageSquare className="h-6 w-6 text-accent" />
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-heading font-bold mb-2">Book with Bitsy</h3>
                    <p className="text-sm text-muted-foreground">
                      Chat with Bitsy AI to check availability and complete your booking
                    </p>
                  </div>

                  <Button 
                    asChild
                    className="w-full h-12 text-base font-semibold shadow-sm"
                    data-testid="book-with-bitsy-button"
                  >
                    <a 
                      href="https://chat.openai.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <MessageSquare className="mr-2 h-5 w-5" />
                      Open Bitsy Bot
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>

                  <div className="pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Say: "Book a room at {hotel.name}" and Bitsy will guide you through the process.
                    </p>
                  </div>

                  {/* Trust Indicators */}
                  <div className="pt-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Sparkles className="h-3 w-3" />
                      <span>Crypto payments verified on-chain</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Sparkles className="h-3 w-3" />
                      <span>No OTA commissions • Direct booking</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Logo */}
              {hotel.logoUrl && (
                <div className="mt-6 flex justify-center">
                  <img 
                    src={hotel.logoUrl} 
                    alt={`${hotel.name} logo`}
                    className="h-16 object-contain opacity-70"
                    data-testid="hotel-logo"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card/30 mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            Powered by <Link to="/" className="text-primary hover:underline font-semibold">Bitsy</Link> • Crypto-native hotel bookings
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PublicHotelPage;
