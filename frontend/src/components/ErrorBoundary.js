import React from 'react';
import * as Sentry from '@sentry/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

class ErrorBoundaryFallback extends React.Component {
  render() {
    const { error, resetError } = this.props;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50/30 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <CardTitle>Something went wrong</CardTitle>
                <CardDescription>An unexpected error occurred</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-slate-100 rounded-lg p-4">
                <p className="text-sm text-slate-700 font-mono">
                  {error.toString()}
                </p>
              </div>
            )}
            
            <div className="flex gap-3">
              <Button
                onClick={resetError}
                className="flex-1"
                data-testid="error-boundary-reset"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              <Button
                onClick={() => window.location.href = '/'}
                variant="outline"
                className="flex-1"
                data-testid="error-boundary-home"
              >
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Button>
            </div>
            
            <p className="text-xs text-center text-muted-foreground">
              This error has been reported to our team.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
}

const ErrorBoundary = Sentry.withErrorBoundary(
  ({ children }) => children,
  {
    fallback: ErrorBoundaryFallback,
    showDialog: false,
  }
);

export default ErrorBoundary;
