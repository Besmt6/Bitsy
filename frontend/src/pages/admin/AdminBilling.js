import React, { useState, useEffect } from 'react';
import { AdminShell } from '../../components/admin/AdminShell';
import { StatusPill } from '../../components/admin/StatusPill';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, XCircle, Clock, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const AdminBilling = () => {
  const [graceAlerts, setGraceAlerts] = useState([]);
  const [blockedAlerts, setBlockedAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/admin/billing/alerts`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (!response.ok) throw new Error('Failed to fetch alerts');

      const data = await response.json();
      setGraceAlerts(data.grace || []);
      setBlockedAlerts(data.blocked || []);
    } catch (error) {
      toast.error('Failed to load billing alerts');
    } finally {
      setIsLoading(false);
    }
  };

  const AlertCard = ({ alert, type }) => {
    const isBlocked = type === 'blocked';
    const isUrgent = alert.severity === 'critical' || alert.daysRemaining <= 2;

    return (
      <Card 
        className={`rounded-xl border-2 ${
          isBlocked ? 'border-destructive/30 bg-destructive/5' : 
          isUrgent ? 'border-warning/30 bg-warning/5' : 
          'border-warning/20 bg-warning/5'
        }`}
        data-testid={`billing-alert-${alert.hotelId}`}
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3">
                <div className={`rounded-lg p-2 ${
                  isBlocked ? 'bg-destructive/10' : 'bg-warning/10'
                }`}>
                  {isBlocked ? (
                    <XCircle className="h-5 w-5 text-destructive" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-warning" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-heading font-semibold">{alert.hotelName}</h3>
                  <p className="text-sm text-muted-foreground font-mono">{alert.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Revenue</span>
                  <p className="font-mono font-semibold">${alert.revenue?.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Commission Owed</span>
                  <p className="font-mono font-semibold text-destructive">${alert.commission?.toLocaleString()}</p>
                </div>
                {!isBlocked && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Grace Period Ends</span>
                    <p className="font-mono text-sm">
                      {alert.graceEndsAt ? new Date(alert.graceEndsAt).toLocaleString() : 'N/A'}
                      {alert.daysRemaining !== undefined && (
                        <Badge variant="outline" className="ml-2 bg-warning/10 text-warning border-warning/30">
                          <Clock className="mr-1 h-3 w-3" />
                          {alert.daysRemaining} days left
                        </Badge>
                      )}
                    </p>
                  </div>
                )}
                {isBlocked && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Blocked Since</span>
                    <p className="font-mono text-sm">
                      {alert.blockedSince ? new Date(alert.blockedSince).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Link to={`/admin/hotels/${alert.hotelId}`}>
                <Button size="sm" variant="outline" data-testid={`view-hotel-${alert.hotelId}`}>
                  View Details
                </Button>
              </Link>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => toast.info('Email notification feature coming soon')}
                data-testid={`email-hotel-${alert.hotelId}`}
              >
                <Mail className="mr-1 h-3 w-3" />
                Email
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight" data-testid="admin-billing-title">
            Billing Alerts
          </h1>
          <p className="text-muted-foreground mt-2">
            Hotels requiring immediate attention for commission payments
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="rounded-xl">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Grace Period</p>
                <p className="text-3xl font-bold tabular-nums mt-2" data-testid="grace-count">{graceAlerts.length}</p>
              </div>
              <div className="rounded-lg bg-warning/10 p-3">
                <AlertTriangle className="h-6 w-6 text-warning" />
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-xl">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Blocked</p>
                <p className="text-3xl font-bold tabular-nums mt-2" data-testid="blocked-count">{blockedAlerts.length}</p>
              </div>
              <div className="rounded-lg bg-destructive/10 p-3">
                <XCircle className="h-6 w-6 text-destructive" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts Tabs */}
        <Tabs defaultValue="grace" className="space-y-6">
          <TabsList className="grid w-full max-w-[400px] grid-cols-2">
            <TabsTrigger value="grace" data-testid="tab-grace">
              Grace Period ({graceAlerts.length})
            </TabsTrigger>
            <TabsTrigger value="blocked" data-testid="tab-blocked">
              Blocked ({blockedAlerts.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="grace" className="space-y-4" data-testid="grace-alerts-list">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 w-full" />)
            ) : graceAlerts.length === 0 ? (
              <Card className="rounded-xl">
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">No hotels in grace period</p>
                </CardContent>
              </Card>
            ) : (
              graceAlerts.map(alert => <AlertCard key={alert.hotelId} alert={alert} type="grace" />)
            )}
          </TabsContent>

          <TabsContent value="blocked" className="space-y-4" data-testid="blocked-alerts-list">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 w-full" />)
            ) : blockedAlerts.length === 0 ? (
              <Card className="rounded-xl">
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">No blocked hotels</p>
                </CardContent>
              </Card>
            ) : (
              blockedAlerts.map(alert => <AlertCard key={alert.hotelId} alert={alert} type="blocked" />)
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminShell>
  );
};

export default AdminBilling;
