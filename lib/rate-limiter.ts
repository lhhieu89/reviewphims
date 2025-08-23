interface TokenBucket {
  tokens: number;
  lastRefill: number;
}

class RateLimiter {
  private buckets = new Map<string, TokenBucket>();
  private readonly maxTokens: number;
  private readonly refillRate: number; // tokens per second
  private readonly windowMs: number;

  constructor(maxTokens = 10, refillRate = 1, windowMs = 60000) {
    this.maxTokens = maxTokens;
    this.refillRate = refillRate;
    this.windowMs = windowMs;
  }

  private getClientId(request: Request): string {
    // Try to get IP from various headers
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const cfConnectingIp = request.headers.get('cf-connecting-ip');

    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }

    return realIp || cfConnectingIp || 'unknown';
  }

  private refillBucket(bucket: TokenBucket): void {
    const now = Date.now();
    const timePassed = now - bucket.lastRefill;
    const tokensToAdd = Math.floor((timePassed / 1000) * this.refillRate);

    bucket.tokens = Math.min(this.maxTokens, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;
  }

  public checkLimit(request: Request): { allowed: boolean; remaining: number } {
    const clientId = this.getClientId(request);

    let bucket = this.buckets.get(clientId);

    if (!bucket) {
      bucket = {
        tokens: this.maxTokens,
        lastRefill: Date.now(),
      };
      this.buckets.set(clientId, bucket);
    }

    this.refillBucket(bucket);

    if (bucket.tokens > 0) {
      bucket.tokens--;
      return { allowed: true, remaining: bucket.tokens };
    }

    return { allowed: false, remaining: 0 };
  }

  public cleanup(): void {
    const now = Date.now();
    const cutoff = now - this.windowMs * 2; // Clean up old entries

    for (const [clientId, bucket] of this.buckets.entries()) {
      if (bucket.lastRefill < cutoff) {
        this.buckets.delete(clientId);
      }
    }
  }
}

// Global rate limiter instance
const rateLimiter = new RateLimiter(30, 0.5, 60000); // 30 requests, refill 0.5/sec, 1 minute window

// Cleanup old entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => rateLimiter.cleanup(), 5 * 60 * 1000);
}

export { rateLimiter };
