import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

export function initializeSentry(app) {
  const dsn = process.env.SENTRY_DSN_BACKEND;
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
      // Automatic instrumentation
      Sentry.httpIntegration({ tracing: true }),
      Sentry.expressIntegration({ app }),
      Sentry.mongooseIntegration(),
      nodeProfilingIntegration(),
    ],
    
    // Performance Monitoring
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
    
    // Profiling
    profilesSampleRate: environment === 'production' ? 0.1 : 1.0,
    
    // Filter sensitive data
    beforeSend(event, hint) {
      // Remove sensitive headers
      if (event.request?.headers) {
        delete event.request.headers.authorization;
        delete event.request.headers.cookie;
      }
      
      // Redact passwords from request bodies
      if (event.request?.data) {
        try {
          const data = JSON.parse(event.request.data);
          if (data.password) data.password = '[REDACTED]';
          if (data.passwordHash) data.passwordHash = '[REDACTED]';
          event.request.data = JSON.stringify(data);
        } catch (e) {
          // Not JSON, leave as is
        }
      }
      
      return event;
    },
  });

  console.log(`✅ Sentry initialized for ${environment}`);
}

export function sentryErrorHandler() {
  const dsn = process.env.SENTRY_DSN_BACKEND;
  const environment = process.env.NODE_ENV || 'development';
  
  // Return no-op middleware if Sentry not initialized
  if (!dsn || environment === 'test') {
    return (err, req, res, next) => next(err);
  }
  
  return Sentry.Handlers.errorHandler({
    shouldHandleError(error) {
      // Capture all 5xx errors
      if (error.status >= 500) return true;
      
      // Capture specific 4xx errors
      if (error.status === 401 || error.status === 403) return false;
      
      return true;
    },
  });
}

export function sentryRequestHandler() {
  const dsn = process.env.SENTRY_DSN_BACKEND;
  const environment = process.env.NODE_ENV || 'development';
  
  // Return no-op middleware if Sentry not initialized
  if (!dsn || environment === 'test') {
    return (req, res, next) => next();
  }
  
  return Sentry.Handlers.requestHandler();
}

export function sentryTracingHandler() {
  const dsn = process.env.SENTRY_DSN_BACKEND;
  const environment = process.env.NODE_ENV || 'development';
  
  // Return no-op middleware if Sentry not initialized
  if (!dsn || environment === 'test') {
    return (req, res, next) => next();
  }
  
  return Sentry.Handlers.tracingHandler();
}
