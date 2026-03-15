import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AdminShell } from '../../components/admin/AdminShell';
import { StatusPill } from '../../components/admin/StatusPill';
import { KpiCard } from '../../components/admin/KpiCard';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { ArrowLeft, Building2, DollarSign, TrendingUp, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

const AdminHotelDetails = () => {
  const { hotelId } = useParams();
  const [hotel, setHotel] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHotelDetails();
  }, [hotelId]);

  const fetchHotelDetails = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/admin/hotels/${hotelId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (!response.ok) throw new Error('Failed to fetch hotel details');

      const data = await response.json();
      setHotel(data.hotel);
      setAnalytics(data.analytics);
    } catch (error) {
      toast.error('Failed to load hotel details');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <AdminShell>
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}
          </div>
        </div>
      </AdminShell>
    );
  }

  if (!hotel) {
    return (
      <AdminShell>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Hotel not found</p>
          <Link to="/admin/hotels">
            <Button variant="outline" className="mt-4">Back to Hotels</Button>
          </Link>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <Link to="/admin/hotels">
            <Button variant="ghost" size="sm" className="mb-4" data-testid="back-to-hotels-button">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Hotels
            </Button>
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-heading font-bold tracking-tight" data-testid="hotel-details-title">
                {hotel.hotelName}
              </h1>
              <p className="text-sm text-muted-foreground font-mono mt-2">{hotel.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <StatusPill status={hotel.billing?.billingStatus} testId="hotel-billing-status" />
              {hotel.isActive ? (
                <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                  Active
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-muted text-muted-foreground">
                  Inactive
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Analytics KPIs */}
        <div className="grid gap-6 md:grid-cols-3">
          <KpiCard
            label="Total Bookings"
            value={analytics?.totalBookings || 0}
            icon={Building2}
            testId="hotel-total-bookings"
          />
          <KpiCard
            label="Total Revenue"
            value={`$${analytics?.totalRevenue?.toLocaleString() || 0}`}
            icon={DollarSign}
            testId="hotel-total-revenue"
          />
          <KpiCard
            label="Avg Booking Value"
            value={`$${Math.round(analytics?.avgBookingValue || 0)}`}
            icon={TrendingUp}
            testId="hotel-avg-booking-value"
          />
        </div>

        {/* Payment Methods */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="rounded-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Crypto Payments</p>
                  <p className="text-2xl font-bold tabular-nums mt-2" data-testid="crypto-payments-count">
                    {analytics?.paymentMethods?.crypto || 0}
                  </p>
                </div>
                <div className="rounded-lg bg-primary/10 p-3">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Pay at Property</p>
                  <p className="text-2xl font-bold tabular-nums mt-2" data-testid="pay-at-property-count">
                    {analytics?.paymentMethods?.payAtProperty || 0}
                  </p>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Bookings Table */}
        <Card className="rounded-xl border bg-card shadow-[var(--shadow-sm)] overflow-hidden" data-testid="hotel-bookings-card">
          <CardContent className="p-6">
            <h2 className="text-lg font-heading font-semibold mb-4">Recent Bookings</h2>
            {analytics?.recentBookings?.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No bookings yet</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs uppercase">Reference</TableHead>
                      <TableHead className="text-xs uppercase">Guest</TableHead>
                      <TableHead className="text-xs uppercase">Room Type</TableHead>
                      <TableHead className="text-xs uppercase text-right">Amount</TableHead>
                      <TableHead className="text-xs uppercase">Status</TableHead>
                      <TableHead className="text-xs uppercase">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analytics?.recentBookings?.map((booking) => (
                      <TableRow key={booking.id} className="hover:bg-muted/60">
                        <TableCell className="font-mono text-xs">{booking.bookingRef}</TableCell>
                        <TableCell className="text-sm">{booking.guestInfo?.name || 'Guest'}</TableCell>
                        <TableCell className="text-sm">{booking.bookingDetails?.roomType || 'N/A'}</TableCell>
                        <TableCell className="text-sm text-right font-mono">${booking.totalUsd?.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={booking.bookingStatus === 'confirmed' ? 'bg-success/10 text-success border-success/20' : ''}>
                            {booking.bookingStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground">
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Hotel Info */}
        <Card className="rounded-xl" data-testid="hotel-info-card">
          <CardContent className="p-6">
            <h2 className="text-lg font-heading font-semibold mb-4">Hotel Information</h2>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Hotel ID</span>
                <p className="font-mono mt-1">{hotel.id}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Tier</span>
                <p className="mt-1 capitalize">{hotel.tier}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Location</span>
                <p className="mt-1">
                  {hotel.locationVerification?.city || 'Not set'}, {hotel.locationVerification?.country || ''}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Created</span>
                <p className="font-mono mt-1">{new Date(hotel.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Commission Rate</span>
                <p className="mt-1">{(hotel.billing?.commissionRateBps / 100)}%</p>
              </div>
              <div>
                <span className="text-muted-foreground">Trial Limit</span>
                <p className="mt-1">${hotel.billing?.trialLimitUsd?.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
};

export default AdminHotelDetails;
