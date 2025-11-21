import { env, isDevelopment, isProduction } from "../config/env";
//! Use it as you deem fit
/**
 * Log levels in order of severity
 */
const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * Get current log level from environment
 */
const getCurrentLogLevel = () => {
  const level = env.VITE_LOG_LEVEL || "info";
  return LOG_LEVELS[level] ?? LOG_LEVELS.info;
};

/**
 * Check if a log should be output based on current log level
 */
const shouldLog = (level) => {
  return LOG_LEVELS[level] >= getCurrentLogLevel();
};

/**
 * Format log message with timestamp and context
 */
const formatLogMessage = (level, message, context) => {
  const timestamp = new Date().toISOString();
  const levelStr = level.toUpperCase().padEnd(5);

  if (context) {
    return `[${timestamp}] ${levelStr} ${message}`;
  }

  return `[${timestamp}] ${levelStr} ${message}`;
};

/**
 * Send logs to external service (e.g., Sentry, LogRocket)
 * TODO: Implement when you add error tracking service
 */
const sendToExternalService = (level, message, context) => {
  // In production, send to error tracking service
  if (isProduction) {
    // Example: Sentry.captureMessage(message, { level, extra: context });
    // For now, we'll just prepare the structure
    return {
      level,
      message,
      context,
      timestamp: new Date().toISOString(),
      environment: env.VITE_ENV,
    };
  }
};

/**
 * Centralized Logger
 *
 * Usage:
 * import { logger } from '@/core/utils/logger';
 *
 * logger.debug('Debug info', { userId: 123 });
 * logger.info('User logged in', { username: 'john' });
 * logger.warn('Low disk space', { available: '10MB' });
 * logger.error('API call failed', { error, endpoint: '/users' });
 */
export const logger = {
  /**
   * Debug level - Detailed information for debugging
   * Only shown in development
   */
  debug: (message, context) => {
    if (!shouldLog("debug")) return;

    if (isDevelopment) {
      console.log(
        `%c${formatLogMessage("debug", message)}`,
        "color: #6B7280; font-weight: normal",
        context || ""
      );
    }
  },

  /**
   * Info level - General information
   * Shown in all environments
   */
  info: (message, context) => {
    if (!shouldLog("info")) return;

    console.log(
      `%c${formatLogMessage("info", message)}`,
      "color: #3B82F6; font-weight: bold",
      context || ""
    );

    sendToExternalService("info", message, context);
  },

  /**
   * Warning level - Something unexpected but not critical
   * Shown in all environments
   */
  warn: (message, context) => {
    if (!shouldLog("warn")) return;

    console.warn(
      `%c${formatLogMessage("warn", message)}`,
      "color: #F59E0B; font-weight: bold",
      context || ""
    );

    sendToExternalService("warning", message, context);
  },

  /**
   * Error level - Something went wrong
   * Always shown, sent to error tracking in production
   */
  error: (message, context) => {
    if (!shouldLog("error")) return;

    console.error(
      `%c${formatLogMessage("error", message)}`,
      "color: #EF4444; font-weight: bold",
      context || ""
    );

    sendToExternalService("error", message, context);
  },

  /**
   * Log API request
   */
  apiRequest: (method, url, data) => {
    if (isDevelopment) {
      logger.debug(`🌐 API Request: ${method.toUpperCase()} ${url}`, { data });
    }
  },

  /**
   * Log API response
   */
  apiResponse: (method, url, status, data) => {
    if (isDevelopment) {
      const emoji = status >= 200 && status < 300 ? "✅" : "❌";
      logger.debug(`${emoji} API Response: ${method.toUpperCase()} ${url} [${status}]`, { data });
    }
  },

  /**
   * Log API error
   */
  apiError: (method, url, error) => {
    const status = error.response?.status || "N/A";
    const errorData = error.response?.data || error.message;

    logger.error(`API Error: ${method.toUpperCase()} ${url} [${status}]`, {
      error: errorData,
      stack: isDevelopment ? error.stack : undefined,
    });
  },

  /**
   * Log user action
   */
  userAction: (action, details) => {
    logger.info(`User Action: ${action}`, details);
  },

  /**
   * Log navigation
   */
  navigation: (from, to) => {
    if (isDevelopment) {
      logger.debug(`Navigation: ${from} → ${to}`);
    }
  },

  /**
   * Log state change
   */
  stateChange: (storeName, oldState, newState) => {
    if (isDevelopment) {
      logger.debug(`State Change: ${storeName}`, {
        before: oldState,
        after: newState,
      });
    }
  },
};

/**
 * Group related logs together
 *
 * Usage:
 * logger.group('User Login Flow', () => {
 *   logger.info('Validating credentials');
 *   logger.info('Calling API');
 *   logger.info('Storing token');
 * });
 */
logger.group = (label, callback) => {
  if (isDevelopment) {
    console.group(label);
    callback();
    console.groupEnd();
  } else {
    callback();
  }
};

/**
 * Create a logger instance for a specific module
 *
 * Usage:
 * const moduleLogger = createModuleLogger('AuthService');
 * moduleLogger.info('User authenticated');
 */
export const createModuleLogger = (moduleName) => {
  return {
    debug: (message, context) => logger.debug(`[${moduleName}] ${message}`, context),
    info: (message, context) => logger.info(`[${moduleName}] ${message}`, context),
    warn: (message, context) => logger.warn(`[${moduleName}] ${message}`, context),
    error: (message, context) => logger.error(`[${moduleName}] ${message}`, context),
  };
};

/**
 * Performance logging
 * Measures execution time of operations
 *
 * Usage:
 * const perf = logger.performance('Data Processing');
 * // ... do work
 * perf.end(); // Logs: "⏱️ Data Processing took 1234ms"
 */
logger.performance = (label) => {
  const start = performance.now();

  return {
    end: () => {
      const duration = Math.round(performance.now() - start);

      if (isDevelopment) {
        const color = duration > 1000 ? "red" : duration > 500 ? "orange" : "green";
        console.log(`%c⏱️ ${label} took ${duration}ms`, `color: ${color}; font-weight: bold`);
      }

      return duration;
    },
  };
};

export default logger;
