import React, { useState, useEffect } from 'react';
import { AdminShell } from '../../components/admin/AdminShell';
import { StatusPill } from '../../components/admin/StatusPill';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Activity as ActivityIcon, Search, DollarSign, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

const AdminActivity = () => {
  const [activity, setActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchActivity();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchActivity, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchActivity = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/admin/activity?limit=100`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (!response.ok) throw new Error('Failed to fetch activity');

      const data = await response.json();
      setActivity(data.activity || []);
    } catch (error) {
      toast.error('Failed to load activity');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredActivity = activity.filter(item => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.hotel?.name?.toLowerCase().includes(query) ||
      item.guest?.name?.toLowerCase().includes(query) ||
      item.bookingRef?.toLowerCase().includes(query)
    );
  });

  const formatTime = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  };

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold tracking-tight" data-testid="admin-activity-title">
              Platform Activity
            </h1>
            <p className="text-muted-foreground mt-2">
              Real-time booking activity across all hotels
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
            <span>Live</span>
          </div>
        </div>

        {/* Search */}
        <Card className="rounded-xl">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by hotel, guest, or booking reference..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="activity-search-input"
              />
            </div>
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card className="rounded-xl border bg-card shadow-[var(--shadow-sm)]" data-testid="activity-feed-card">
          <CardContent className="p-6">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
              </div>
            ) : filteredActivity.length === 0 ? (
              <div className="text-center py-12">
                <ActivityIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchQuery ? 'No activity matches your search' : 'No recent activity'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredActivity.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-muted/40 transition-colors"
                    data-testid={`activity-item-${item.id}`}
                  >
                    {/* Timeline dot */}
                    <div className="mt-1 w-2 h-2 bg-primary rounded-full" />

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            New booking at <span className="font-semibold">{item.hotel?.name}</span>
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Guest: {item.guest?.name} ({item.guest?.email})
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground font-mono whitespace-nowrap">
                          {formatTime(item.createdAt)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-xs font-mono">
                          {item.bookingRef}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            item.paymentMethod === 'crypto' 
                              ? 'bg-primary/10 text-primary border-primary/30' 
                              : 'bg-muted text-muted-foreground border-border'
                          }`}
                        >
                          {item.paymentMethod === 'crypto' ? (
                            <><DollarSign className="mr-1 h-3 w-3" />Crypto</>
                          ) : (
                            <><CreditCard className="mr-1 h-3 w-3" />Pay at Property</>
                          )}
                        </Badge>
                        <span className="text-sm font-semibold tabular-nums ml-auto">
                          ${item.amount?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
};

export default AdminActivity;
