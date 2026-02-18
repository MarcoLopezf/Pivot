import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Shared Redis client for rate limiting.
 * Uses Upstash REST API — compatible with Edge and Node.js runtimes.
 */
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/**
 * General API rate limiter — all /api/* routes
 * 60 requests per minute per IP
 */
export const apiRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, "1 m"),
  analytics: true,
  prefix: "pivot:api",
});

/**
 * AI operations rate limiter — quiz generation, project submission
 * 10 requests per minute per IP (these trigger expensive AI calls)
 */
export const aiRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  analytics: true,
  prefix: "pivot:ai",
});
