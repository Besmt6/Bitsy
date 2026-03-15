import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Skeleton } from '../components/ui/skeleton';
import { Calendar, MapPin, User, Mail, Phone, CreditCard, Copy, ExternalLink, ArrowLeft, AlertTriangle, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const GuestBookingDetails = () => {
  const { ref } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const guestAuth = sessionStorage.getItem('guestAuth');
    if (!guestAuth) {
      navigate('/guest');
      return;
    }

    fetchBookingDetails();
  }, [ref]);

  const fetchBookingDetails = async () => {
    try {
      // TODO: Implement actual API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock booking
      setBooking({
        _id: '1',
        bookingRef: ref,
        hotelId: { 
          hotelName: 'Ocean View Resort',
          contactPhone: '+1 555 123 4567',
          contactEmail: 'info@oceanview.com'
        },
        guestId: { name: 'John Doe', email: 'john@example.com', phone: '+1 555 987 6543' },
        roomType: 'Deluxe Suite',
        checkIn: '2026-04-15',
        checkOut: '2026-04-18',
        nights: 3,
        totalUsd: 450,
        paymentMethod: 'crypto',
        cryptoType: 'ethereum',
        status: 'confirmed',
        confirmedAt: new Date(),
        web3Data: {
          txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
          chain: 'ethereum',
          explorerUrl: 'https://etherscan.io/tx/0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
        },
        date: new Date()
      });
    } catch (error) {
      toast.error('Failed to load booking details');
      console.error('Fetch booking error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    try {
      // TODO: Implement cancel API call
      toast.success('Booking cancelled successfully');
      navigate('/guest/bookings');
    } catch (error) {
      toast.error('Failed to cancel booking');
    }
  };

  const handleListForTransfer = () => {
    navigate(`/guest/marketplace/list?bookingRef=${ref}`);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  if (loading) {
    return (
      <div data-theme="guest" className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div data-theme="guest" className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="p-12 text-center">
            <h3 className="text-lg font-heading font-semibold mb-2">Booking not found</h3>
            <Link to="/guest/bookings">
              <Button variant="outline" className="mt-4">Back to My Bookings</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isCryptoPayment = booking.paymentMethod === 'crypto';
  const canCancel = booking.status === 'pending_confirmation' || (booking.status === 'confirmed' && !booking.listedForTransfer);
  const canList = isCryptoPayment && booking.status === 'confirmed' && !booking.listedForTransfer;

  return (
    <div data-theme="guest" className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-6xl">
          <Link to="/guest/bookings" className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to My Bookings
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Summary */}
            <Card className="shadow-[var(--shadow-md)]">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl">{booking.hotelId?.hotelName}</CardTitle>
                    <p className="text-muted-foreground mt-1">{booking.roomType}</p>
                  </div>
                  <StatusBadge status={booking.status} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Check-in</p>
                    <p className="font-medium">{new Date(booking.checkIn).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Check-out</p>
                    <p className="font-medium">{new Date(booking.checkOut).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Nights</span>
                    <span className="font-medium">{booking.nights}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Payment Method</span>
                    <Badge variant="secondary">
                      {isCryptoPayment ? `💎 Crypto (${booking.cryptoType})` : '🏨 Pay at Property'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-lg font-heading font-bold">
                    <span>Total</span>
                    <span>${booking.totalUsd.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Guest Details */}
            <Card>
              <CardHeader>
                <CardTitle>Guest Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{booking.guestId?.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{booking.guestId?.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{booking.guestId?.phone}</span>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {booking.status === 'pending_confirmation' && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Action Required:</strong> Call {booking.hotelId?.contactPhone} to confirm your booking by{' '}
                      {booking.confirmationDeadlineAt && new Date(booking.confirmationDeadlineAt).toLocaleString()}
                    </AlertDescription>
                  </Alert>
                )}

                {isCryptoPayment && booking.status === 'confirmed' && (
                  <Alert>
                    <AlertDescription>
                      ⚠️ <strong>Crypto payments are non-refundable.</strong> If your plans change, you can list this booking on our marketplace to recover your cost.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex flex-wrap gap-3">
                  {canList && (
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={handleListForTransfer}
                      data-testid="guest-booking-list-transfer-button"
                    >
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      List for Transfer
                    </Button>
                  )}

                  {canCancel && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          className="flex-1"
                          data-testid="guest-booking-cancel-button"
                        >
                          Cancel Booking
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Cancel Booking?</AlertDialogTitle>
                          <AlertDialogDescription>
                            {isCryptoPayment ? (
                              <span>
                                This booking was paid with crypto and is <strong>non-refundable</strong>. Consider listing it on the marketplace instead to recover your cost.
                              </span>
                            ) : (
                              'This will cancel your reservation. The hotel will be notified.'
                            )}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                          <AlertDialogAction onClick={handleCancelBooking} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Cancel Booking
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Trust Panel */}
          <div className="space-y-6">
            {/* Hotel Contact */}
            <Card className="lg:sticky lg:top-6">
              <CardHeader>
                <CardTitle>Hotel Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${booking.hotelId?.contactPhone}`} className="hover:text-primary transition-colors">
                    {booking.hotelId?.contactPhone}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${booking.hotelId?.contactEmail}`} className="hover:text-primary transition-colors">
                    {booking.hotelId?.contactEmail}
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Payment Proof (for crypto bookings) */}
            {isCryptoPayment && booking.web3Data?.txHash && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Payment Proof
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="rounded-lg bg-muted px-3 py-2">
                    <p className="text-xs text-muted-foreground mb-1">Transaction Hash</p>
                    <div className="flex items-center justify-between gap-2">
                      <code className="text-xs font-mono truncate" data-testid="guest-booking-tx-hash-value">
                        {booking.web3Data.txHash.slice(0, 10)}...{booking.web3Data.txHash.slice(-8)}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => copyToClipboard(booking.web3Data.txHash)}
                        data-testid="guest-booking-copy-tx-button"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-lg bg-muted px-3 py-2">
                    <p className="text-xs text-muted-foreground mb-1">Blockchain</p>
                    <p className="text-sm font-medium capitalize">{booking.web3Data.chain}</p>
                  </div>

                  {booking.web3Data.explorerUrl && (
                    <a href={booking.web3Data.explorerUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" className="w-full" data-testid="guest-booking-view-explorer-button">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View on Explorer
                      </Button>
                    </a>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Booking Reference */}
            <Card>
              <CardHeader>
                <CardTitle>Booking Reference</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg bg-muted px-3 py-2">
                  <code className="text-sm font-mono font-medium">{booking.bookingRef}</code>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Share this reference with the hotel when checking in
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const variants = {
    pending_confirmation: { bg: 'bg-[hsl(var(--warning)/0.14)]', text: 'text-[hsl(var(--warning))]', border: 'border-[hsl(var(--warning)/0.30)]', label: 'Pending' },
    confirmed: { bg: 'bg-[hsl(var(--success)/0.14)]', text: 'text-[hsl(var(--success))]', border: 'border-[hsl(var(--success)/0.30)]', label: 'Confirmed' },
    cancelled: { bg: 'bg-[hsl(var(--destructive)/0.12)]', text: 'text-[hsl(var(--destructive))]', border: 'border-[hsl(var(--destructive)/0.28)]', label: 'Cancelled' },
    listed_for_transfer: { bg: 'bg-[hsl(var(--accent)/0.14)]', text: 'text-[hsl(var(--accent))]', border: 'border-[hsl(var(--accent)/0.30)]', label: 'Listed' },
    completed: { bg: 'bg-muted', text: 'text-muted-foreground', border: 'border-border', label: 'Completed' }
  };

  const variant = variants[status] || variants.confirmed;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border ${variant.bg} ${variant.text} ${variant.border}`}>
      {variant.label}
    </span>
  );
};

export default GuestBookingDetails;
