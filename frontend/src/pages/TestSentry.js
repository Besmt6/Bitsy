import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import * as Sentry from '@sentry/react';
import { AlertTriangle, CheckCircle } from 'lucide-react';

const TestSentry = () => {
  const [testResults, setTestResults] = useState([]);

  const addResult = (message, success = true) => {
    setTestResults(prev => [...prev, { message, success, time: new Date().toLocaleTimeString() }]);
  };

  const testErrorCapture = () => {
    try {
      addResult('Triggering error...', true);
      throw new Error('🧪 Frontend test error - this is intentional!');
    } catch (error) {
      Sentry.captureException(error);
      addResult('Error captured and sent to Sentry', true);
    }
  };

  const testErrorBoundary = () => {
    addResult('Triggering error boundary...', true);
    // This will be caught by the error boundary
    throw new Error('🧪 Error boundary test - this is intentional!');
  };

  const testMessage = () => {
    Sentry.captureMessage('🧪 Test message from Bitsy frontend', 'info');
    addResult('Message sent to Sentry', true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-blue-600" />
              Sentry Integration Test
            </CardTitle>
            <CardDescription>
              Test error monitoring and verify errors appear in your Sentry dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Test Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                onClick={testErrorCapture}
                className="w-full"
                data-testid="test-error-capture"
              >
                Test Error Capture
              </Button>
              
              <Button 
                onClick={testMessage}
                variant="outline"
                className="w-full"
                data-testid="test-message"
              >
                Test Message
              </Button>
              
              <Button 
                onClick={testErrorBoundary}
                variant="destructive"
                className="w-full"
                data-testid="test-error-boundary"
              >
                Test Error Boundary
              </Button>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
              <h3 className="font-semibold text-blue-900">How to verify:</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                <li>Click any test button above</li>
                <li>Wait 10-30 seconds for Sentry to process</li>
                <li>Go to <a href="https://sentry.io" target="_blank" className="underline font-medium">sentry.io</a> → Projects → <strong>bitsy-frontend</strong></li>
                <li>You should see the test errors appear in the Issues list</li>
                <li>Click on an error to see full stack trace and session replay</li>
              </ol>
            </div>

            {/* Backend Test */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
              <h3 className="font-semibold text-slate-900">Backend Test:</h3>
              <p className="text-sm text-slate-700 mb-2">
                Run this command in your terminal:
              </p>
              <code className="block bg-slate-900 text-green-400 p-3 rounded text-sm font-mono">
                curl https://bitsy-tools.preview.emergentagent.com/api/test-sentry
              </code>
              <p className="text-xs text-slate-600 mt-2">
                Then check <strong>bitsy-backend</strong> project in Sentry
              </p>
            </div>

            {/* Results Log */}
            {testResults.length > 0 && (
              <div className="border rounded-lg p-4 bg-white">
                <h3 className="font-semibold mb-3">Test Results:</h3>
                <div className="space-y-2">
                  {testResults.map((result, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      {result.success ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      )}
                      <span className="text-slate-600">[{result.time}]</span>
                      <span>{result.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestSentry;
