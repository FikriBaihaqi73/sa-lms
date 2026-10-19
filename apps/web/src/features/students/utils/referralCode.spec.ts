import { describe, expect, it } from "vitest";
import {
  defaultReferralExpiry,
  generateReferralCode,
  generateReferralSegment,
  isReferralExpired,
} from "./referralCode";

describe("generateReferralSegment", () => {
  it("returns a segment with the requested length", () => {
    expect(generateReferralSegment(6, () => 0)).toHaveLength(6);
    expect(generateReferralSegment(10, () => 0)).toHaveLength(10);
  });

  it("only uses unambiguous characters", () => {
    const segment = generateReferralSegment(64, () => 0.5);
    expect(segment).not.toMatch(/[IO01]/);
  });

  it("handles a random source returning 1 without throwing", () => {
    expect(generateReferralSegment(4, () => 1)).toHaveLength(4);
  });

  it("handles a random source returning 0", () => {
    expect(generateReferralSegment(3, () => 0)).toBe("AAA");
  });
});

describe("generateReferralCode", () => {
  it("uses the REF-<year>-<segment> format", () => {
    const now = new Date("2026-05-04T10:00:00.000Z");
    expect(generateReferralCode(now, () => 0)).toMatch(/^REF-\d{4}-[A-Z0-9]{6}$/);
  });

  it("generates different codes for different random sources", () => {
    const now = new Date("2026-05-04T10:00:00.000Z");
    const first = generateReferralCode(now, () => 0);
    const second = generateReferralCode(now, () => 0.99);
    expect(first).not.toBe(second);
  });
});

describe("defaultReferralExpiry", () => {
  it("returns a date 30 days ahead in YYYY-MM-DD format", () => {
    expect(defaultReferralExpiry(new Date("2026-01-01T10:00:00"))).toBe("2026-01-31");
  });

  it("rolls over month boundaries", () => {
    expect(defaultReferralExpiry(new Date("2026-12-20T10:00:00"))).toBe("2027-01-19");
  });
});

describe("isReferralExpired", () => {
  it("treats an empty value as not expired", () => {
    expect(isReferralExpired(null, new Date("2026-01-01T00:00:00"))).toBe(false);
    expect(isReferralExpired("", new Date("2026-01-01T00:00:00"))).toBe(false);
  });

  it("treats an invalid value as not expired", () => {
    expect(isReferralExpired("not-a-date", new Date("2026-01-01T00:00:00"))).toBe(false);
  });

  it("detects a past expiry date", () => {
    expect(isReferralExpired("2025-12-31", new Date("2026-01-01T00:00:00"))).toBe(true);
  });

  it("keeps a code valid until the end of its expiry day", () => {
    expect(isReferralExpired("2026-01-01", new Date("2026-01-01T12:00:00"))).toBe(false);
    expect(isReferralExpired("2026-01-01", new Date("2026-01-02T00:00:01"))).toBe(true);
  });
});
