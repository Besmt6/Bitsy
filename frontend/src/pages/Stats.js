import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Skeleton } from '../components/ui/skeleton';
import { statsAPI } from '../lib/api';
import { formatCurrency, formatDateTime } from '../lib/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Calendar, DollarSign, Clock } from 'lucide-react';

const Stats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7d');

  useEffect(() => {
    fetchStats();
  }, [period]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await statsAPI.getStats(period);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-20" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-64" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="stats-kpi-bookings">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Total Bookings</p>
                <h3 className="text-2xl font-heading font-bold mt-1">{stats?.totalBookings || 0}</h3>
              </div>
              <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="stats-kpi-revenue">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Total Revenue</p>
                <h3 className="text-2xl font-heading font-bold mt-1">{formatCurrency(stats?.totalRevenue || 0)}</h3>
              </div>
              <div className="h-10 w-10 bg-[hsl(var(--success))]/10 rounded-xl flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-[hsl(var(--success))]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Avg. Stay</p>
                <h3 className="text-2xl font-heading font-bold mt-1">{stats?.avgStay || 0} nights</h3>
              </div>
              <div className="h-10 w-10 bg-accent/10 rounded-xl flex items-center justify-center">
                <Clock className="h-5 w-5 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Growth</p>
                <h3 className="text-2xl font-heading font-bold mt-1">+{((stats?.totalBookings || 0) * 12).toFixed(0)}%</h3>
              </div>
              <div className="h-10 w-10 bg-accent/10 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card data-testid="stats-revenue-chart">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Revenue Over Time</CardTitle>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {stats?.chartData && stats.chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={stats.chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(203, 90%, 40%)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(203, 90%, 40%)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.75rem'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="hsl(203, 90%, 40%)" 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              No booking data yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Bookings Table */}
      <Card data-testid="stats-recent-bookings-table">
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          {stats?.recentBookings && stats.recentBookings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Reference</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Guest</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Room</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Nights</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Crypto</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentBookings.map((booking) => (
                    <tr key={booking.bookingRef} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 font-mono text-sm">{booking.bookingRef}</td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          <div className="font-medium">{booking.guest?.name || 'N/A'}</div>
                          <div className="text-xs text-muted-foreground">{booking.guest?.email || 'N/A'}</div>
                          {booking.guest?.isReturning && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-accent/10 text-accent mt-1">
                              🔁 Returning
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">{formatDateTime(booking.date)}</td>
                      <td className="py-3 px-4 text-sm">{booking.roomType}</td>
                      <td className="py-3 px-4 text-sm">{booking.nights}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary uppercase">
                          {booking.crypto}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-right">{formatCurrency(booking.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No bookings yet</p>
              <p className="text-sm mt-1">Share your widget to start receiving bookings</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Stats;
