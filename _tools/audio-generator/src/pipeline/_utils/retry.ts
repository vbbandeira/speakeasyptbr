import { createLogger } from "./log.js";

export interface RetryOptions {
  attempts: number;
  baseDelayMs: number;
  factor?: number;
  maxDelayMs?: number;
  isRetryable?: (err: unknown) => boolean;
  scope: string;
}

export class RetryError extends Error {
  constructor(message: string, public readonly lastError: unknown, public readonly attempts: number) {
    super(message);
    this.name = "RetryError";
  }
}

export async function withRetry<T>(fn: () => Promise<T>, opts: RetryOptions): Promise<T> {
  const log = createLogger(`retry:${opts.scope}`);
  const factor = opts.factor ?? 2;
  let lastError: unknown;
  for (let attempt = 1; attempt <= opts.attempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const retryable = opts.isRetryable ? opts.isRetryable(err) : true;
      if (!retryable || attempt === opts.attempts) {
        throw new RetryError(`${opts.scope} failed after ${attempt} attempt(s)`, lastError, attempt);
      }
      const delay = Math.min(opts.baseDelayMs * factor ** (attempt - 1), opts.maxDelayMs ?? Infinity);
      log.warn(`Attempt ${attempt}/${opts.attempts} failed. Retrying in ${delay}ms.`, {
        error: err instanceof Error ? err.message : String(err),
      });
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new RetryError(`${opts.scope} unreachable`, lastError, opts.attempts);
}
