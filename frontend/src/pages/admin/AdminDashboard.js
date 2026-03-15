import React, { useState, useEffect } from 'react';
import { AdminShell } from '../../components/admin/AdminShell';
import { KpiCard } from '../../components/admin/KpiCard';
import { StatusPill } from '../../components/admin/StatusPill';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { Building2, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [commissionsOwed, setCommissionsOwed] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/platform/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }

      const data = await response.json();
      setStats(data.stats);
      setCommissionsOwed(data.commissionsOwed || []);
      setRecentActivity(data.recentActivity || []);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminShell>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-heading font-bold tracking-tight" data-testid="admin-dashboard-title">
            Platform Overview
          </h1>
          <p className="text-muted-foreground mt-2">
            Monitor hotels, bookings, and commission payments across the Bitsy platform
          </p>
        </div>

        {/* KPI Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4" data-testid="admin-kpi-grid">
          <KpiCard
            label="Total Hotels"
            value={stats?.hotels?.total || 0}
            delta={`${stats?.hotels?.active || 0} active`}
            icon={Building2}
            isLoading={isLoading}
            testId="kpi-total-hotels"
          />
          <KpiCard
            label="Total Bookings"
            value={stats?.bookings?.total || 0}
            icon={TrendingUp}
            isLoading={isLoading}
            testId="kpi-total-bookings"
          />
          <KpiCard
            label="Platform Revenue"
            value={stats?.bookings?.revenue ? `$${stats.bookings.revenue.toLocaleString()}` : '$0'}
            icon={DollarSign}
            isLoading={isLoading}
            testId="kpi-platform-revenue"
          />
          <KpiCard
            label="Commission Owed"
            value={stats?.commissions?.totalOwed ? `$${stats.commissions.totalOwed.toLocaleString()}` : '$0'}
            delta={`${stats?.commissions?.hotelsOwing || 0} hotels`}
            deltaType={stats?.commissions?.hotelsOwing > 0 ? 'negative' : 'neutral'}
            icon={AlertTriangle}
            isLoading={isLoading}
            testId="kpi-commission-owed"
          />
        </div>

        {/* Two Column Layout */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Activity */}
          <Card className="rounded-xl border bg-card shadow-[var(--shadow-sm)]" data-testid="recent-activity-card">
            <CardHeader>
              <CardTitle className="text-lg font-heading">Recent Activity</CardTitle>
              <CardDescription>Latest bookings across all hotels</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
              ) : recentActivity.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No recent activity</p>
              ) : (
                <div className="space-y-3">
                  {recentActivity.slice(0, 8).map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                      data-testid={`activity-item-${activity.id}`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{activity.hotelName}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.guestName} • {activity.bookingRef}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold tabular-nums">${activity.totalUsd}</span>
                        <Badge variant={activity.status === 'confirmed' ? 'default' : 'secondary'} className={`text-xs ${activity.status === 'confirmed' ? 'bg-success/10 text-success border-success/20' : ''}`}>
                          {activity.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4">
                <Link to="/admin/activity">
                  <Button variant="outline" className="w-full" data-testid="view-all-activity-button">
                    View All Activity
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Billing Alerts */}
          <Card className="rounded-xl border bg-card shadow-[var(--shadow-sm)]" data-testid="billing-alerts-card">
            <CardHeader>
              <CardTitle className="text-lg font-heading">Billing Alerts</CardTitle>
              <CardDescription>Hotels requiring commission payment</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" />)}
                </div>
              ) : commissionsOwed.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No pending commissions</p>
              ) : (
                <div className="space-y-3">
                  {commissionsOwed.slice(0, 5).map((commission) => (
                    <div
                      key={commission.hotelId}
                      className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                      data-testid={`commission-alert-${commission.hotelId}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{commission.hotelName}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Revenue: ${commission.revenue?.toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-destructive tabular-nums">
                            ${commission.commissionOwed?.toLocaleString()}
                          </p>
                          <StatusPill status={commission.status} testId={`status-${commission.hotelId}`} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4">
                <Link to="/admin/commissions">
                  <Button variant="outline" className="w-full" data-testid="view-all-commissions-button">
                    View All Commissions
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminShell>
  );
};

export default AdminDashboard;
