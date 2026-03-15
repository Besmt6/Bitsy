import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { AlertCircle, CheckCircle2, Clock, XCircle } from 'lucide-react';

export const BillingStatusCard = ({ billing, className = '' }) => {
  if (!billing) return null;

  const { billingStatus, trial, grace, tier, commissionRate, isBlocked } = billing;

  // Determine status color and icon
  const getStatusConfig = () => {
    switch (billingStatus) {
      case 'trial':
        return {
          variant: 'default',
          icon: <CheckCircle2 className="h-4 w-4" />,
          label: 'Free Trial Active',
          color: 'text-green-600 dark:text-green-400'
        };
      case 'grace':
        return {
          variant: 'warning',
          icon: <Clock className="h-4 w-4" />,
          label: `Grace Period (${grace.daysRemaining}d left)`,
          color: 'text-orange-600 dark:text-orange-400'
        };
      case 'blocked':
        return {
          variant: 'destructive',
          icon: <XCircle className="h-4 w-4" />,
          label: 'Account Blocked',
          color: 'text-red-600 dark:text-red-400'
        };
      case 'active':
        return {
          variant: 'default',
          icon: <CheckCircle2 className="h-4 w-4" />,
          label: 'Active',
          color: 'text-green-600 dark:text-green-400'
        };
      default:
        return {
          variant: 'secondary',
          icon: <AlertCircle className="h-4 w-4" />,
          label: 'Unknown',
          color: 'text-muted-foreground'
        };
    }
  };

  const statusConfig = getStatusConfig();
  const progressPercent = parseFloat(trial.percentUsed);

  return (
    <Card className={`${className} border-l-4 ${
      billingStatus === 'trial' ? 'border-l-green-500' : 
      billingStatus === 'grace' ? 'border-l-orange-500' : 
      billingStatus === 'blocked' ? 'border-l-red-500' : 
      'border-l-primary'
    }`} data-testid="billing-status-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Free Trial Status</CardTitle>
          <Badge variant={statusConfig.variant} className="flex items-center gap-1">
            {statusConfig.icon}
            {statusConfig.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-heading font-bold">
              ${trial.usedUsd.toLocaleString()}
            </span>
            <span className="text-sm text-muted-foreground">
              of ${trial.limitUsd.toLocaleString()} free limit
            </span>
          </div>
          
          <Progress 
            value={progressPercent} 
            className="h-3"
            data-testid="billing-progress-bar"
          />
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{trial.percentUsed}% used</span>
            <span className="font-medium">${trial.remainingUsd.toLocaleString()} remaining</span>
          </div>
        </div>

        {/* Status Messages */}
        {billingStatus === 'trial' && progressPercent >= 90 && (
          <Alert variant="warning">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              You're approaching your free trial limit. After ${trial.limitUsd.toLocaleString()}, you'll have a 7-day grace period to submit commission payment.
            </AlertDescription>
          </Alert>
        )}

        {billingStatus === 'grace' && (
          <Alert variant="warning">
            <Clock className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <strong>Grace Period Active:</strong> You have <strong>{grace.daysRemaining} days</strong> to submit your commission payment. After that, new bookings will be blocked until payment is received.
              <br />
              <span className="text-xs mt-1 block">
                Commission owed: <strong>{commissionRate}%</strong> on bookings over $5k = ${((trial.usedUsd - trial.limitUsd) * (commissionRate / 100)).toFixed(2)}
              </span>
            </AlertDescription>
          </Alert>
        )}

        {billingStatus === 'blocked' && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <strong>Account Blocked:</strong> Your grace period has expired. New bookings are disabled. Please go to <strong>Settings → Billing</strong> to submit your commission payment and reactivate your account.
            </AlertDescription>
          </Alert>
        )}

        {billingStatus === 'active' && trial.usedUsd > trial.limitUsd && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Payment received! Your account is active. Commission: <strong>{commissionRate}%</strong> on future bookings.
            </AlertDescription>
          </Alert>
        )}

        {/* Plan Info */}
        <div className="pt-2 border-t text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Current Plan:</span>
            <span className="font-medium capitalize">{tier}</span>
          </div>
          <div className="flex justify-between mt-1">
            <span>Commission Rate:</span>
            <span className="font-medium">{commissionRate}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
