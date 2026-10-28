import type { ReferralCode } from "../types";

/**
 * Checks whether a referral code has expired based on current time
 */
export function isReferralExpired(expiresAt?: string | null): boolean {
  if (!expiresAt) return false;
  const expiryTime = new Date(expiresAt).getTime();
  return expiryTime < Date.now();
}

/**
 * Checks whether a referral code has reached its maximum usage quota
 */
export function isReferralExhausted(
  usedCount: number,
  usageQuota?: number | null,
): boolean {
  if (usageQuota === null || usageQuota === undefined) return false;
  return usedCount >= usageQuota;
}

/**
 * Determines current display status badge for a referral code
 */
export function getReferralStatusInfo(item: ReferralCode) {
  const expired = isReferralExpired(item.expires_at);
  const exhausted = isReferralExhausted(item.used_count, item.usage_quota);

  if (!item.is_active) {
    return {
      status: "inactive",
      label: "Nonaktif",
      badgeClass: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700",
    };
  }

  if (expired) {
    return {
      status: "expired",
      label: "Kedaluwarsa",
      badgeClass: "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border-amber-300 dark:border-amber-800",
    };
  }

  if (exhausted) {
    return {
      status: "exhausted",
      label: "Kuota Habis",
      badgeClass: "bg-orange-100 text-orange-800 dark:bg-orange-950/50 dark:text-orange-300 border-orange-300 dark:border-orange-800",
    };
  }

  return {
    status: "active",
    label: "Aktif",
    badgeClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800",
  };
}

const REFERRAL_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const REFERRAL_SEGMENT_LENGTH = 6;

function secureRandom(): number {
  if (typeof globalThis.crypto?.getRandomValues === "function") {
    const buffer = new Uint32Array(1);
    globalThis.crypto.getRandomValues(buffer);
    return (buffer[0] ?? 0) / 0xffffffff;
  }
  return Math.random();
}

/**
 * Generates a referral segment without ambiguous characters (no I, O, 0, 1).
 */
export function generateReferralSegment(
  length = REFERRAL_SEGMENT_LENGTH,
  random: () => number = secureRandom,
): string {
  let segment = "";
  for (let index = 0; index < length; index += 1) {
    const position =
      Math.floor(random() * REFERRAL_ALPHABET.length) % REFERRAL_ALPHABET.length;
    segment += REFERRAL_ALPHABET.charAt(position);
  }
  return segment;
}

/**
 * Builds a referral code in the `REF-<year>-<segment>` format.
 */
export function generateReferralCode(
  now: Date = new Date(),
  random: () => number = secureRandom,
): string {
  return `REF-${now.getFullYear()}-${generateReferralSegment(REFERRAL_SEGMENT_LENGTH, random)}`;
}

