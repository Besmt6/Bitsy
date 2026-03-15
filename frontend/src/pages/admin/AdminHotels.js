import React, { useState, useEffect } from 'react';
import { AdminShell } from '../../components/admin/AdminShell';
import { StatusPill } from '../../components/admin/StatusPill';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Search, MoreVertical, CheckCircle, XCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const AdminHotels = () => {
  const [hotels, setHotels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [billingFilter, setBillingFilter] = useState('all');

  useEffect(() => {
    fetchHotels();
  }, [statusFilter, billingFilter, searchQuery]);

  const fetchHotels = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (billingFilter !== 'all') params.append('billingStatus', billingFilter);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/admin/hotels?${params}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (!response.ok) throw new Error('Failed to fetch hotels');

      const data = await response.json();
      setHotels(data.hotels || []);
    } catch (error) {
      toast.error('Failed to load hotels');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (hotelId, currentStatus) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/admin/hotels/${hotelId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ isActive: !currentStatus })
        }
      );

      if (!response.ok) throw new Error('Failed to update status');

      toast.success(`Hotel ${currentStatus ? 'suspended' : 'activated'} successfully`);
      fetchHotels();
    } catch (error) {
      toast.error('Failed to update hotel status');
    }
  };

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight" data-testid="admin-hotels-title">
            Hotel Management
          </h1>
          <p className="text-muted-foreground mt-2">
            View and manage all hotels on the platform
          </p>
        </div>

        {/* Filters */}
        <Card className="rounded-xl">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search hotels by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="hotels-search-input"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]" data-testid="hotels-status-filter">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={billingFilter} onValueChange={setBillingFilter}>
                <SelectTrigger className="w-full md:w-[180px]" data-testid="hotels-billing-filter">
                  <SelectValue placeholder="Billing" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Billing</SelectItem>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="active">Paid</SelectItem>
                  <SelectItem value="grace">Grace Period</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Hotels Table */}
        <Card className="rounded-xl border bg-card shadow-[var(--shadow-sm)] overflow-hidden" data-testid="hotels-table-card">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-card/95 backdrop-blur border-b">
                <TableRow>
                  <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide">Hotel</TableHead>
                  <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide">Email</TableHead>
                  <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide">Status</TableHead>
                  <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide">Billing</TableHead>
                  <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-right">Revenue</TableHead>
                  <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-right">Commission</TableHead>
                  <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-right">Bookings</TableHead>
                  <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={8}>
                        <Skeleton className="h-10 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : hotels.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No hotels found
                    </TableCell>
                  </TableRow>
                ) : (
                  hotels.map((hotel) => (
                    <TableRow key={hotel.id} className="group hover:bg-muted/60" data-testid={`hotel-row-${hotel.id}`}>
                      <TableCell className="px-3 py-2.5 text-sm font-medium">
                        <Link to={`/admin/hotels/${hotel.id}`} className="hover:text-primary">
                          {hotel.hotelName}
                        </Link>
                      </TableCell>
                      <TableCell className="px-3 py-2.5 text-sm font-mono text-muted-foreground">
                        {hotel.email}
                      </TableCell>
                      <TableCell className="px-3 py-2.5 text-sm">
                        {hotel.isActive ? (
                          <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-muted text-muted-foreground border-border">
                            <XCircle className="mr-1 h-3 w-3" />
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="px-3 py-2.5 text-sm">
                        <StatusPill status={hotel.billingStatus} testId={`billing-status-${hotel.id}`} />
                      </TableCell>
                      <TableCell className="px-3 py-2.5 text-sm text-right font-mono">
                        ${hotel.revenue?.toLocaleString()}
                      </TableCell>
                      <TableCell className="px-3 py-2.5 text-sm text-right font-mono font-semibold">
                        ${hotel.commission?.toLocaleString()}
                      </TableCell>
                      <TableCell className="px-3 py-2.5 text-sm text-right tabular-nums">
                        {hotel.bookingCount}
                      </TableCell>
                      <TableCell className="px-3 py-2.5 text-sm">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" data-testid={`hotel-actions-${hotel.id}`}>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleToggleStatus(hotel.id, hotel.isActive)}>
                              {hotel.isActive ? 'Suspend Hotel' : 'Activate Hotel'}
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to={`/admin/hotels/${hotel.id}`}>View Details</Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </AdminShell>
  );
};

export default AdminHotels;
