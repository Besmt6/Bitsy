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

  try {
    Sentry.init({
      dsn,
      environment,
      integrations: [],
      tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
      profilesSampleRate: environment === 'production' ? 0.1 : 1.0,
      beforeSend(event, hint) {
        if (event.request?.headers) {
          delete event.request.headers.authorization;
          delete event.request.headers.cookie;
        }
        
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
  } catch (error) {
    console.error('❌ Sentry initialization error:', error.message);
  }
}

export function sentryErrorHandler() {
  const dsn = process.env.SENTRY_DSN_BACKEND;
  const environment = process.env.NODE_ENV || 'development';
  
  // Return no-op middleware if Sentry not initialized
  if (!dsn || environment === 'test' || !Sentry.Handlers) {
    return (err, req, res, next) => next(err);
  }
  
  try {
    return Sentry.Handlers.errorHandler({
      shouldHandleError(error) {
        // Capture all 5xx errors
        if (error.status >= 500) return true;
        
        // Capture specific 4xx errors
        if (error.status === 401 || error.status === 403) return false;
        
        return true;
      },
    });
  } catch (e) {
    console.warn('⚠️  Sentry errorHandler not available:', e.message);
    return (err, req, res, next) => next(err);
  }
}

export function sentryRequestHandler() {
  const dsn = process.env.SENTRY_DSN_BACKEND;
  const environment = process.env.NODE_ENV || 'development';
  
  // Return no-op middleware if Sentry not initialized
  if (!dsn || environment === 'test' || !Sentry.Handlers) {
    return (req, res, next) => next();
  }
  
  try {
    return Sentry.Handlers.requestHandler();
  } catch (e) {
    console.warn('⚠️  Sentry requestHandler not available:', e.message);
    return (req, res, next) => next();
  }
}

export function sentryTracingHandler() {
  const dsn = process.env.SENTRY_DSN_BACKEND;
  const environment = process.env.NODE_ENV || 'development';
  
  // Return no-op middleware if Sentry not initialized
  if (!dsn || environment === 'test' || !Sentry.Handlers) {
    return (req, res, next) => next();
  }
  
  try {
    return Sentry.Handlers.tracingHandler();
  } catch (e) {
    console.warn('⚠️  Sentry tracingHandler not available:', e.message);
    return (req, res, next) => next();
  }
}
