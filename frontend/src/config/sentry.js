import * as Sentry from '@sentry/react';

export function initializeSentry() {
  const dsn = process.env.REACT_APP_SENTRY_DSN;
  const environment = process.env.NODE_ENV || 'development';

  // Only initialize if DSN is provided
  if (!dsn || environment === 'test') {
    console.log('ℹ️  Sentry: Skipped (no DSN or test environment)');
    return;
  }

  Sentry.init({
    dsn,
    environment,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    
    // Performance Monitoring
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
    
    // Session Replay
    replaysSessionSampleRate: environment === 'production' ? 0.1 : 0.5,
    replaysOnErrorSampleRate: 1.0,
    
    // Filter sensitive data
    beforeSend(event, hint) {
      // Don't send authentication errors (expected behavior)
      if (event.exception?.values?.[0]?.value?.includes('401')) {
        return null;
      }
      
      return event;
    },
  });

  console.log(`✅ Sentry initialized for ${environment}`);
}
