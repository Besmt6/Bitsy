import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const KpiCard = ({ 
  label, 
  value, 
  delta, 
  deltaType, 
  icon: Icon, 
  isLoading = false,
  testId 
}) => {
  if (isLoading) {
    return (
      <Card className="rounded-xl border bg-card shadow-[var(--shadow-sm)]">
        <CardContent className="p-6">
          <Skeleton className="h-4 w-24 mb-4" />
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-16" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-xl border bg-card shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-shadow duration-200" data-testid={testId}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {label}
            </p>
            <p className="mt-2 text-2xl sm:text-3xl font-semibold tabular-nums" data-testid={`${testId}-value`}>
              {value}
            </p>
            {delta !== undefined && (
              <div className={`mt-2 inline-flex items-center gap-1 text-xs font-medium ${
                deltaType === 'positive' ? 'text-success' : 
                deltaType === 'negative' ? 'text-destructive' : 
                'text-muted-foreground'
              }`}>
                {deltaType === 'positive' && <ArrowUpRight className="h-3 w-3" />}
                {deltaType === 'negative' && <ArrowDownRight className="h-3 w-3" />}
                <span>{delta}</span>
              </div>
            )}
          </div>
          {Icon && (
            <div className="rounded-lg bg-primary/10 p-2.5">
              <Icon className="h-5 w-5 text-primary" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
