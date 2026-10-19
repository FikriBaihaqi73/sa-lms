const REFERRAL_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const REFERRAL_SEGMENT_LENGTH = 6;
const DEFAULT_REFERRAL_VALIDITY_DAYS = 30;

function secureRandom(): number {
  if (typeof globalThis.crypto?.getRandomValues === "function") {
    const buffer = new Uint32Array(1);
    globalThis.crypto.getRandomValues(buffer);
    return (buffer[0] ?? 0) / 0xffffffff;
  }
  return Math.random();
}

function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Generates a referral segment without ambiguous characters (no I, O, 0, 1).
 */
export function generateReferralSegment(length = REFERRAL_SEGMENT_LENGTH, random: () => number = secureRandom): string {
  let segment = "";
  for (let index = 0; index < length; index += 1) {
    const position = Math.floor(random() * REFERRAL_ALPHABET.length) % REFERRAL_ALPHABET.length;
    segment += REFERRAL_ALPHABET.charAt(position);
  }
  return segment;
}

/**
 * Builds a referral code in the `REF-<year>-<segment>` format.
 */
export function generateReferralCode(now: Date = new Date(), random: () => number = secureRandom): string {
  return `REF-${now.getFullYear()}-${generateReferralSegment(REFERRAL_SEGMENT_LENGTH, random)}`;
}

/**
 * Default expiration date of a referral code (30 days from now) in `YYYY-MM-DD` format.
 */
export function defaultReferralExpiry(now: Date = new Date()): string {
  const expiry = new Date(now.getTime());
  expiry.setDate(expiry.getDate() + DEFAULT_REFERRAL_VALIDITY_DAYS);
  return toDateInputValue(expiry);
}

/**
 * Checks whether a referral code is already expired. Empty values are treated as not expired.
 */
export function isReferralExpired(expiresAt?: string | null, now: Date = new Date()): boolean {
  if (!expiresAt) return false;
  const expiry = new Date(`${expiresAt}T23:59:59`);
  if (Number.isNaN(expiry.getTime())) return false;
  return expiry.getTime() < now.getTime();
}
