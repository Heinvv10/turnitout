import { describe, it, expect, beforeEach } from "vitest";
import {
  createRateLimiter,
  aiRateLimiter,
  authRateLimiter,
  strictAuthRateLimiter,
} from "@/lib/rate-limit";
import type { RateLimiter } from "@/lib/rate-limit";

describe("createRateLimiter", () => {
  let limiter: RateLimiter;

  beforeEach(() => {
    limiter = createRateLimiter({ windowMs: 60_000, max: 3 });
  });

  describe("allow requests under limit", () => {
    it("allows the first request", () => {
      const r = limiter.check("192.168.1.1");
      expect(r.allowed).toBe(true);
      expect(r.remaining).toBe(2);
    });

    it("allows up to max requests", () => {
      const r1 = limiter.check("10.0.0.1");
      const r2 = limiter.check("10.0.0.1");
      const r3 = limiter.check("10.0.0.1");

      expect(r1.allowed).toBe(true);
      expect(r2.allowed).toBe(true);
      expect(r3.allowed).toBe(true);
      expect(r3.remaining).toBe(0);
    });
  });

  describe("block requests over limit", () => {
    it("blocks the request exceeding max", () => {
      limiter.check("192.168.1.1");
      limiter.check("192.168.1.1");
      limiter.check("192.168.1.1");
      const r4 = limiter.check("192.168.1.1");

      expect(r4.allowed).toBe(false);
      expect(r4.remaining).toBe(0);
    });

    it("continues to block subsequent requests", () => {
      for (let i = 0; i < 5; i++) {
        limiter.check("192.168.1.1");
      }
      const r = limiter.check("192.168.1.1");
      expect(r.allowed).toBe(false);
    });
  });

  describe("different IPs tracked independently", () => {
    it("does not share counts between IPs", () => {
      limiter.check("10.0.0.1");
      limiter.check("10.0.0.1");
      limiter.check("10.0.0.1");
      const blocked = limiter.check("10.0.0.1");
      expect(blocked.allowed).toBe(false);

      const fresh = limiter.check("10.0.0.2");
      expect(fresh.allowed).toBe(true);
      expect(fresh.remaining).toBe(2);
    });

    it("exhausting one IP leaves others unaffected", () => {
      for (let i = 0; i < 10; i++) {
        limiter.check("abuser-ip");
      }
      const clean = limiter.check("clean-ip");
      expect(clean.allowed).toBe(true);
    });
  });

  describe("resetAt field", () => {
    it("returns a resetAt timestamp in the future", () => {
      const before = Date.now();
      const r = limiter.check("192.168.1.1");
      expect(r.resetAt).toBeGreaterThanOrEqual(before);
      expect(r.resetAt).toBeLessThanOrEqual(before + 60_000 + 100);
    });

    it("returns same resetAt within the same window", () => {
      const r1 = limiter.check("192.168.1.1");
      const r2 = limiter.check("192.168.1.1");
      expect(r2.resetAt).toBe(r1.resetAt);
    });
  });

  describe("remaining count decrements", () => {
    it("decrements remaining with each request", () => {
      const r1 = limiter.check("192.168.1.1");
      const r2 = limiter.check("192.168.1.1");
      const r3 = limiter.check("192.168.1.1");

      expect(r1.remaining).toBe(2);
      expect(r2.remaining).toBe(1);
      expect(r3.remaining).toBe(0);
    });
  });
});

describe("pre-configured limiters", () => {
  it("aiRateLimiter is a valid rate limiter", () => {
    const r = aiRateLimiter.check("test-ai-ip-unique");
    expect(r).toHaveProperty("allowed");
    expect(r).toHaveProperty("remaining");
    expect(r).toHaveProperty("resetAt");
    expect(r.allowed).toBe(true);
  });

  it("authRateLimiter is a valid rate limiter", () => {
    const r = authRateLimiter.check("test-auth-ip-unique");
    expect(r.allowed).toBe(true);
    expect(r.remaining).toBe(4); // max: 5, after 1 request
  });

  it("strictAuthRateLimiter has a lower limit", () => {
    const r = strictAuthRateLimiter.check("test-strict-ip-unique");
    expect(r.allowed).toBe(true);
    expect(r.remaining).toBe(2); // max: 3, after 1 request
  });
});
