import React from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Skeleton } from './ui/skeleton';

/**
 * Reusable loading skeleton components matching design guidelines
 */

// KPI Card Skeleton (for Stats, Analytics pages)
export const KPICardSkeleton = () => (
  <Card>
    <CardContent className="p-5">
      <div className="flex items-center justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-16" />
        </div>
        <Skeleton className="h-10 w-10 rounded-xl" />
      </div>
    </CardContent>
  </Card>
);

// Table Row Skeleton
export const TableRowSkeleton = ({ cols = 5 }) => (
  <tr className="border-b">
    {[...Array(cols)].map((_, i) => (
      <td key={i} className="py-3 px-4">
        <Skeleton className="h-4 w-full" />
      </td>
    ))}
  </tr>
);

// Form Field Skeleton
export const FormFieldSkeleton = () => (
  <div className="space-y-2">
    <Skeleton className="h-4 w-32" />
    <Skeleton className="h-10 w-full rounded-xl" />
    <Skeleton className="h-3 w-48" />
  </div>
);

// Room Card Skeleton
export const RoomCardSkeleton = () => (
  <Card>
    <Skeleton className="h-48 w-full rounded-t-2xl rounded-b-none" />
    <CardHeader>
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-4 w-full" />
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-12" />
        </div>
      </div>
    </CardContent>
  </Card>
);

// Chart Skeleton
export const ChartSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-48" />
    </CardHeader>
    <CardContent>
      <div className="h-64 flex items-end justify-between gap-2">
        {[...Array(7)].map((_, i) => (
          <Skeleton 
            key={i} 
            className="flex-1" 
            style={{ height: `${Math.random() * 60 + 40}%` }} 
          />
        ))}
      </div>
    </CardContent>
  </Card>
);

// Page Loading (full page skeleton)
export const PageLoadingSkeleton = ({ type = 'default' }) => {
  if (type === 'stats') {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <KPICardSkeleton key={i} />)}
        </div>
        <ChartSkeleton />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <table className="w-full">
              <tbody>
                {[...Array(5)].map((_, i) => <TableRowSkeleton key={i} cols={7} />)}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (type === 'rooms') {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <RoomCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (type === 'wallets') {
    return (
      <div className="max-w-4xl space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Card>
          <CardContent className="p-6 space-y-4">
            {[...Array(3)].map((_, i) => <FormFieldSkeleton key={i} />)}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Default loading
  return (
    <div className="space-y-6">
      <Skeleton className="h-12 w-64" />
      <Card>
        <CardContent className="p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
        </CardContent>
      </Card>
    </div>
  );
};
