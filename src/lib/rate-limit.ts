const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
}

export function rateLimit(
  key: string,
  options: RateLimitOptions = { windowMs: 60000, maxRequests: 60 }
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, {
      count: 1,
      resetTime: now + options.windowMs,
    });
    return {
      allowed: true,
      remaining: options.maxRequests - 1,
      resetTime: now + options.windowMs,
    };
  }

  if (record.count >= options.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime,
    };
  }

  record.count++;
  return {
    allowed: true,
    remaining: options.maxRequests - record.count,
    resetTime: record.resetTime,
  };
}

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 300000);
