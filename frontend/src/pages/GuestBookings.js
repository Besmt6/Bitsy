import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { Calendar, Search, ShoppingBag, ArrowRight, Clock, CheckCircle2, XCircle, ArrowLeftRight } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const StatusBadge = ({ status }) => {
  const variants = {
    pending_confirmation: { bg: 'bg-[hsl(var(--warning)/0.14)]', text: 'text-[hsl(var(--warning))]', border: 'border-[hsl(var(--warning)/0.30)]', icon: Clock, label: 'Pending' },
    confirmed: { bg: 'bg-[hsl(var(--success)/0.14)]', text: 'text-[hsl(var(--success))]', border: 'border-[hsl(var(--success)/0.30)]', icon: CheckCircle2, label: 'Confirmed' },
    cancelled: { bg: 'bg-[hsl(var(--destructive)/0.12)]', text: 'text-[hsl(var(--destructive))]', border: 'border-[hsl(var(--destructive)/0.28)]', icon: XCircle, label: 'Cancelled' },
    listed_for_transfer: { bg: 'bg-[hsl(var(--accent)/0.14)]', text: 'text-[hsl(var(--accent))]', border: 'border-[hsl(var(--accent)/0.30)]', icon: ArrowLeftRight, label: 'Listed' },
    completed: { bg: 'bg-muted', text: 'text-muted-foreground', border: 'border-border', icon: CheckCircle2, label: 'Completed' }
  };

  const variant = variants[status] || variants.confirmed;
  const Icon = variant.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border ${variant.bg} ${variant.text} ${variant.border}`}>
      <Icon className="h-3.5 w-3.5" />
      {variant.label}
    </span>
  );
};

const GuestBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    // Check if guest is authenticated
    const guestAuth = sessionStorage.getItem('guestAuth');
    if (!guestAuth) {
      navigate('/guest');
      return;
    }

    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const guestAuth = JSON.parse(sessionStorage.getItem('guestAuth'));
      
      // TODO: Implement actual API call
      // For now, using mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock bookings
      setBookings([
        {
          _id: '1',
          bookingRef: 'BIT-1710512345-1234',
          hotelId: { hotelName: 'Ocean View Resort', logoUrl: '' },
          roomType: 'Deluxe Suite',
          checkIn: '2026-04-15',
          checkOut: '2026-04-18',
          nights: 3,
          totalUsd: 450,
          paymentMethod: 'crypto',
          cryptoType: 'ethereum',
          status: 'confirmed',
          confirmedAt: new Date(),
          date: new Date()
        },
        {
          _id: '2',
          bookingRef: 'BIT-1710512345-5678',
          hotelId: { hotelName: 'Mountain Lodge', logoUrl: '' },
          roomType: 'Standard Room',
          checkIn: '2026-05-20',
          checkOut: '2026-05-22',
          nights: 2,
          totalUsd: 280,
          paymentMethod: 'pay_at_property',
          status: 'pending_confirmation',
          confirmationDeadlineAt: new Date('2026-05-18T14:00:00Z'),
          date: new Date()
        }
      ]);
    } catch (error) {
      toast.error('Failed to load bookings');
      console.error('Fetch bookings error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = (booking) => {
    const now = new Date();
    const checkIn = new Date(booking.checkIn);
    const checkOut = new Date(booking.checkOut);

    if (activeTab === 'upcoming') {
      return booking.status !== 'cancelled' && booking.status !== 'completed' && checkIn >= now;
    } else if (activeTab === 'past') {
      return booking.status === 'completed' || (booking.status !== 'cancelled' && checkOut < now);
    } else {
      return booking.status === 'cancelled';
    }
  };

  const filteredBookings = bookings
    .filter(filterBookings)
    .filter(b => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        b.bookingRef.toLowerCase().includes(query) ||
        b.hotelId?.hotelName.toLowerCase().includes(query) ||
        b.roomType.toLowerCase().includes(query)
      );
    });

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
          <div className="flex items-center gap-3">
            <Link to="/marketplace">
              <Button variant="outline" size="sm" data-testid="guest-marketplace-link">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Marketplace
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                sessionStorage.removeItem('guestAuth');
                navigate('/guest');
              }}
              data-testid="guest-logout-button"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-heading font-bold tracking-tight">My Bookings</h1>
              <p className="text-muted-foreground mt-1">Manage your hotel reservations</p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search bookings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="guest-bookings-search-input"
              />
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} data-testid="guest-bookings-tabs">
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="upcoming" className="flex-1 sm:flex-none" data-testid="guest-bookings-tab-upcoming">
                Upcoming
              </TabsTrigger>
              <TabsTrigger value="past" className="flex-1 sm:flex-none" data-testid="guest-bookings-tab-past">
                Past
              </TabsTrigger>
              <TabsTrigger value="cancelled" className="flex-1 sm:flex-none" data-testid="guest-bookings-tab-cancelled">
                Cancelled
              </TabsTrigger>
            </TabsList>

            <div className="mt-6">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <Card key={i}>
                      <CardContent className="p-6">
                        <Skeleton className="h-20 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredBookings.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-heading font-semibold mb-2">No bookings found</h3>
                    <p className="text-sm text-muted-foreground">
                      {searchQuery ? 'Try a different search term' : `You don't have any ${activeTab} bookings yet`}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filteredBookings.map((booking) => (
                    <Card 
                      key={booking._id} 
                      className="hover:shadow-[var(--shadow-md)] transition-shadow cursor-pointer"
                      onClick={() => navigate(`/guest/bookings/${booking.bookingRef}`)}
                      data-testid="guest-booking-card"
                    >
                      <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div className="space-y-3 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <h3 className="text-lg font-heading font-semibold">{booking.hotelId?.hotelName}</h3>
                                <p className="text-sm text-muted-foreground">{booking.roomType}</p>
                              </div>
                              <StatusBadge status={booking.status} />
                            </div>

                            <div className="flex flex-wrap items-center gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>{new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}</span>
                              </div>
                              <Badge variant="outline" className="font-normal">
                                {booking.nights} {booking.nights === 1 ? 'night' : 'nights'}
                              </Badge>
                              <Badge variant="secondary" className="font-normal">
                                {booking.paymentMethod === 'crypto' ? `💎 ${booking.cryptoType}` : '🏨 Pay at property'}
                              </Badge>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t">
                              <div>
                                <span className="text-xs text-muted-foreground">Total</span>
                                <p className="text-lg font-heading font-bold">${booking.totalUsd.toFixed(2)}</p>
                              </div>
                              <div>
                                <span className="text-xs text-muted-foreground font-mono">{booking.bookingRef}</span>
                              </div>
                            </div>
                          </div>

                          <div className="sm:flex sm:items-center">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full sm:w-auto"
                              data-testid="guest-booking-view-details-button"
                            >
                              View Details
                              <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default GuestBookings;
