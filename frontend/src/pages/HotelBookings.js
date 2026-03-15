import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import { Skeleton } from '../components/ui/skeleton';
import { CheckCircle2, XCircle, Clock, Calendar, Search, Phone, Mail } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const StatusBadge = ({ status }) => {
  const variants = {
    pending_confirmation: { bg: 'bg-[hsl(var(--warning)/0.14)]', text: 'text-[hsl(var(--warning))]', border: 'border-[hsl(var(--warning)/0.30)]', icon: Clock, label: 'Needs Confirmation' },
    confirmed: { bg: 'bg-[hsl(var(--success)/0.14)]', text: 'text-[hsl(var(--success))]', border: 'border-[hsl(var(--success)/0.30)]', icon: CheckCircle2, label: 'Confirmed' },
    cancelled: { bg: 'bg-[hsl(var(--destructive)/0.12)]', text: 'text-[hsl(var(--destructive))]', border: 'border-[hsl(var(--destructive)/0.28)]', icon: XCircle, label: 'Cancelled' },
    listed_for_transfer: { bg: 'bg-[hsl(var(--accent)/0.14)]', text: 'text-[hsl(var(--accent))]', border: 'border-[hsl(var(--accent)/0.30)]', icon: CheckCircle2, label: 'Listed on Marketplace' },
    completed: { bg: 'bg-muted', text: 'text-muted-foreground', border: 'border-border', icon: CheckCircle2, label: 'Completed' }
  };

  const variant = variants[status] || variants.confirmed;
  const Icon = variant.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border ${variant.bg} ${variant.text} ${variant.border}`}>
      <Icon className="h-3 w-3" />
      {variant.label}
    </span>
  );
};

const HotelBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_URL}/api/bookings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setBookings(data.bookings);
      }
    } catch (error) {
      toast.error('Failed to load bookings');
      console.error('Fetch bookings error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmBooking = async (bookingRef) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/bookings/${bookingRef}/confirm`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Booking confirmed successfully');
        fetchBookings(); // Refresh list
      } else {
        toast.error(data.error || 'Failed to confirm booking');
      }
    } catch (error) {
      toast.error('Failed to confirm booking');
      console.error('Confirm booking error:', error);
    }
  };

  const handleRejectBooking = async (bookingRef, reason) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/bookings/${bookingRef}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Booking rejected');
        fetchBookings();
      } else {
        toast.error(data.error || 'Failed to reject booking');
      }
    } catch (error) {
      toast.error('Failed to reject booking');
      console.error('Reject booking error:', error);
    }
  };

  const filterBookings = (booking) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return booking.status === 'pending_confirmation';
    if (activeTab === 'confirmed') return booking.status === 'confirmed' || booking.status === 'listed_for_transfer';
    if (activeTab === 'cancelled') return booking.status === 'cancelled';
    return true;
  };

  const filteredBookings = bookings
    .filter(filterBookings)
    .filter(b => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        b.bookingRef.toLowerCase().includes(query) ||
        b.guestId?.name.toLowerCase().includes(query) ||
        b.guestId?.email.toLowerCase().includes(query) ||
        b.roomType.toLowerCase().includes(query)
      );
    });

  const pendingCount = bookings.filter(b => b.status === 'pending_confirmation').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold tracking-tight">Bookings</h1>
        <p className="text-muted-foreground mt-1">Manage all your hotel reservations</p>
      </div>

      {pendingCount > 0 && (
        <Card className="bg-warning/5 border-warning/20">
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="h-5 w-5 text-warning flex-shrink-0" />
            <p className="text-sm">
              <strong>{pendingCount}</strong> booking{pendingCount > 1 ? 's' : ''} waiting for guest confirmation call
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>All Bookings</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="hotel-bookings-search-input"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
              <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>

            <div className="mt-6">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
              ) : filteredBookings.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-heading font-semibold mb-2">No bookings found</h3>
                  <p className="text-sm text-muted-foreground">Bookings will appear here once guests make reservations</p>
                </div>
              ) : (
                <div className="border rounded-lg">
                  <Table data-testid="hotel-bookings-table">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Reference</TableHead>
                        <TableHead>Guest</TableHead>
                        <TableHead>Check-in</TableHead>
                        <TableHead>Room</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBookings.map((booking) => (
                        <TableRow key={booking._id}>
                          <TableCell className="font-mono text-xs">{booking.bookingRef}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-medium text-sm">{booking.guestId?.name}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                {booking.guestId?.email}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Phone className="h-3 w-3" />
                                {booking.guestId?.phone}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="text-sm">{new Date(booking.checkIn).toLocaleDateString()}</p>
                              <p className="text-xs text-muted-foreground">{booking.nights}n</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{booking.roomType}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-xs">
                              {booking.paymentMethod === 'crypto' ? booking.cryptoType : 'Pay @ Property'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={booking.status} />
                          </TableCell>
                          <TableCell className="text-right">
                            {booking.status === 'pending_confirmation' && (
                              <div className="flex items-center gap-2 justify-end">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8"
                                  onClick={() => handleConfirmBooking(booking.bookingRef)}
                                  data-testid="hotel-booking-confirm-button"
                                >
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Confirm
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-8"
                                      data-testid="hotel-booking-reject-button"
                                    >
                                      <XCircle className="h-3 w-3 mr-1" />
                                      Reject
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Reject Booking?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This will cancel the booking for {booking.guestId?.name}. The guest will be notified.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction 
                                        onClick={() => handleRejectBooking(booking.bookingRef, 'Rejected by hotel')}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Reject Booking
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            )}
                            {booking.status === 'confirmed' && (
                              <span className="text-xs text-muted-foreground">Confirmed</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default HotelBookings;
