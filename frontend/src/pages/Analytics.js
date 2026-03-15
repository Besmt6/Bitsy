import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { analyticsAPI } from '../lib/api';
import { 
  TrendingUp, 
  Search, 
  Eye, 
  MapPin, 
  Calendar,
  BarChart3,
  Sparkles
} from 'lucide-react';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [period, setPeriod] = useState('30');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const data = await analyticsAPI.getMCPDiscovery(period);
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6" data-testid="analytics-loading">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load analytics</p>
      </div>
    );
  }

  const { summary, bySource, topLocations, dailyAppearances, recentSearches } = analytics;

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500" data-testid="analytics-page">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2">AI Discovery Analytics</h1>
          <p className="text-muted-foreground">Track how often your hotel appears in AI search results</p>
        </div>
        
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-40" data-testid="analytics-period-selector">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card 
          className="border-2 transition-all duration-200 hover:shadow-lg hover:-translate-y-1" 
          data-testid="analytics-total-card"
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Appearances</CardTitle>
              <Eye className="h-4 w-4 text-primary transition-transform duration-200 hover:scale-125" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-heading font-bold" data-testid="analytics-total-appearances">
              {summary.totalAppearances}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              in last {period} days
            </p>
          </CardContent>
        </Card>

        <Card 
          className="border-2 transition-all duration-200 hover:shadow-lg hover:-translate-y-1" 
          data-testid="analytics-month-card"
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">This Month</CardTitle>
              <Calendar className="h-4 w-4 text-accent transition-transform duration-200 hover:scale-125" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-heading font-bold text-accent" data-testid="analytics-month-appearances">
              {summary.thisMonth}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              searches returned your hotel
            </p>
          </CardContent>
        </Card>

        <Card 
          className="border-2 transition-all duration-200 hover:shadow-lg hover:-translate-y-1" 
          data-testid="analytics-average-card"
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Daily Average</CardTitle>
              <TrendingUp className="h-4 w-4 text-[hsl(var(--success))] transition-transform duration-200 hover:scale-125" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-heading font-bold text-[hsl(var(--success))]" data-testid="analytics-avg-appearances">
              {summary.averagePerDay}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              appearances per day
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By AI Source */}
        <Card data-testid="analytics-by-source-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Discoveries by AI Platform
            </CardTitle>
            <CardDescription>Which AI assistants are finding your hotel</CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(bySource).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(bySource).map(([source, count]) => (
                  <div key={source} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="capitalize">
                        {source}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all" 
                          style={{ width: `${(count / summary.totalAppearances) * 100}%` }}
                        />
                      </div>
                      <span className="font-heading font-semibold text-lg w-12 text-right">
                        {count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No AI searches recorded yet
              </p>
            )}
          </CardContent>
        </Card>

        {/* Top Search Locations */}
        <Card data-testid="analytics-top-locations-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-accent" />
              Top Search Locations
            </CardTitle>
            <CardDescription>Popular search queries finding your hotel</CardDescription>
          </CardHeader>
          <CardContent>
            {topLocations.length > 0 ? (
              <div className="space-y-4">
                {topLocations.map((loc, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/10 text-accent text-xs font-semibold flex items-center justify-center">
                        {i + 1}
                      </span>
                      <span className="font-medium">{loc.location}</span>
                    </div>
                    <Badge>{loc.count}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No search data yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Appearances Over Time */}
      <Card data-testid="analytics-timeline-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Appearances Over Time
          </CardTitle>
          <CardDescription>Daily AI search appearances (last {period} days)</CardDescription>
        </CardHeader>
        <CardContent>
          {dailyAppearances.length > 0 ? (
            <div className="space-y-3">
              <div className="h-48 flex items-end justify-between gap-1">
                {dailyAppearances.slice(-14).map((day, i) => {
                  const maxCount = Math.max(...dailyAppearances.map(d => d.count), 1);
                  const heightPercent = (day.count / maxCount) * 100;
                  
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                      <div 
                        className="w-full bg-primary/80 hover:bg-primary rounded-t transition-all duration-300 cursor-pointer group-hover:scale-110"
                        style={{ height: `${heightPercent}%`, minHeight: day.count > 0 ? '8px' : '2px' }}
                        title={`${day.date}: ${day.count} appearances`}
                      />
                      <span className="text-[10px] text-muted-foreground group-hover:text-foreground group-hover:font-semibold transition-all duration-200">
                        {new Date(day.date).getDate()}
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Showing last 14 days • Hover over bars for details
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              Not enough data to display chart
            </p>
          )}
        </CardContent>
      </Card>

      {/* Recent Searches */}
      <Card data-testid="analytics-recent-searches-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-accent" />
            Recent AI Searches
          </CardTitle>
          <CardDescription>Latest searches that included your hotel</CardDescription>
        </CardHeader>
        <CardContent>
          {recentSearches.length > 0 ? (
            <div className="space-y-3">
              {recentSearches.map((search, i) => (
                <div 
                  key={i} 
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all duration-200 hover:shadow-sm hover:translate-x-1 cursor-pointer"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-medium">{search.location}</span>
                      {search.blockchain && search.blockchain !== 'any' && (
                        <Badge variant="outline" className="text-xs">
                          {search.blockchain.toUpperCase()}
                        </Badge>
                      )}
                      <Badge variant="secondary" className="text-xs capitalize">
                        {search.source}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(search.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })} • {search.totalResults} results returned
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-sm font-medium text-foreground mb-2">No searches recorded yet</p>
              <p className="text-xs text-muted-foreground mb-4">
                Your hotel will appear here when AI assistants discover it
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open('https://chatgpt.com', '_blank')}
                className="transition-all duration-200 hover:scale-105"
              >
                Test with ChatGPT →
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Banner */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Sparkles className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-heading font-semibold text-lg mb-2">How AI Discovery Works</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                When travelers ask ChatGPT, Claude, or Perplexity for hotel recommendations, 
                our MCP endpoint automatically provides your hotel details if you match their criteria 
                (location, price, blockchain support).
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong>Tracked here:</strong> Every time your hotel appears in AI search results. 
                This gives you visibility into the new AI-driven booking channel.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
