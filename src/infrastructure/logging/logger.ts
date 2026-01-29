/**
 * Structured Logger Utility
 *
 * Simple structured logging for server-side operations.
 * Outputs JSON in production, pretty-printed in development.
 *
 * TODO: Replace with Pino or Winston for advanced features (transports, log rotation, etc.)
 */

type LogLevel = "info" | "warn" | "error" | "debug";

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  private log(level: LogLevel, message: string, meta?: LogContext): void {
    const logEntry = {
      level,
      context: this.context,
      message,
      timestamp: new Date().toISOString(),
      ...meta,
    };

    // In production, output JSON for parsing by log aggregators
    if (process.env.NODE_ENV === "production") {
      console.error(JSON.stringify(logEntry));
    } else {
      // In development, pretty-print for readability
      console.error(
        `[${logEntry.level.toUpperCase()}] ${logEntry.context} - ${logEntry.message}`,
        meta ? meta : "",
      );
    }
  }

  info(message: string, meta?: LogContext): void {
    this.log("info", message, meta);
  }

  warn(message: string, meta?: LogContext): void {
    this.log("warn", message, meta);
  }

  error(message: string, error?: unknown, meta?: LogContext): void {
    const errorMeta: LogContext = {
      ...meta,
      error:
        error instanceof Error
          ? {
              name: error.name,
              message: error.message,
              stack: error.stack,
            }
          : error,
    };
    this.log("error", message, errorMeta);
  }

  debug(message: string, meta?: LogContext): void {
    if (process.env.NODE_ENV !== "production") {
      this.log("debug", message, meta);
    }
  }
}

/**
 * Create a logger instance for a specific context
 *
 * @example
 * const logger = createLogger("POST /api/learning/roadmap");
 * logger.error("Failed to update item", error, { itemId, roadmapId });
 */
export function createLogger(context: string): Logger {
  return new Logger(context);
}
