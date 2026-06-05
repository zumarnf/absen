import { Secret, SignOptions } from "jsonwebtoken";

/**
 * Known placeholder/example secrets shipped with the project. If one of these
 * ever reaches a running server, attackers could forge valid tokens, so we
 * refuse to start instead of failing open.
 */
const FORBIDDEN_SECRETS = new Set<string>([
  "absensi_logistik_super_secret_key_2024_change_in_production",
  "your_jwt_secret",
  "change_in_production",
  "changeme",
  "secret",
]);

// Minimum length to keep the HMAC secret from being trivially brute-forced.
const MIN_SECRET_LENGTH = 32;

/**
 * Resolve the JWT signing/verification secret from the environment.
 * Fails fast (throws) when JWT_SECRET is missing, a known placeholder, or
 * too short, so the server never silently falls back to a guessable secret
 * that would allow attackers to forge valid tokens.
 */
export const getJwtSecret = (): Secret => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.trim().length === 0) {
    throw new Error(
      "JWT_SECRET is not set. Refusing to start with an insecure default.",
    );
  }

  const normalized = secret.trim();
  if (
    FORBIDDEN_SECRETS.has(normalized) ||
    normalized.length < MIN_SECRET_LENGTH
  ) {
    throw new Error(
      "JWT_SECRET is weak or a known placeholder. Set a unique random " +
        "value of at least 32 characters (e.g. `openssl rand -base64 48`).",
    );
  }

  return secret;
};

/**
 * Token lifetime. Reads JWT_EXPIRE from the environment (e.g. "1d", "12h")
 * and defaults to a short "1d" instead of a long-lived 7-day token to
 * limit the exposure window of a stolen token.
 */
export const getJwtExpiresIn = (): SignOptions["expiresIn"] => {
  return (process.env.JWT_EXPIRE ||
    "1d") as SignOptions["expiresIn"];
};
