import React from 'react';
import { Badge } from '../ui/badge';
import { CheckCircle, AlertTriangle, XCircle, Clock } from 'lucide-react';

const statusConfig = {
  active: {
    label: 'Active',
    icon: CheckCircle,
    className: 'bg-success/10 text-success border-success/20 hover:bg-success/15'
  },
  trial: {
    label: 'Trial',
    icon: Clock,
    className: 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/15'
  },
  grace: {
    label: 'Grace Period',
    icon: AlertTriangle,
    className: 'bg-warning/10 text-warning border-warning/20 hover:bg-warning/15'
  },
  blocked: {
    label: 'Blocked',
    icon: XCircle,
    className: 'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/15'
  },
  inactive: {
    label: 'Inactive',
    icon: XCircle,
    className: 'bg-muted text-muted-foreground border-border hover:bg-muted/80'
  }
};

export const StatusPill = ({ status, testId }) => {
  const config = statusConfig[status] || statusConfig.inactive;
  const Icon = config.icon;

  return (
    <Badge 
      variant="outline" 
      className={`inline-flex items-center gap-1.5 ${config.className}`}
      data-testid={testId}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
};
