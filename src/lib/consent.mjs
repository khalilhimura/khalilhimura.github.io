export const CONSENT_VERSION = 1;
export const CONSENT_TTL = 180 * 24 * 60 * 60 * 1000;
export const CONSENT_KEY = "kn:privacy:v1";

export function createConsent(externalMedia, now = Date.now()) {
  return { version: CONSENT_VERSION, externalMedia: externalMedia === true, updatedAt: now, expiresAt: now + CONSENT_TTL };
}

/** Invalid, outdated or expired records must never enable optional services. */
export function parseConsent(raw, now = Date.now()) {
  try {
    const value = JSON.parse(raw);
    if (!value || value.version !== CONSENT_VERSION || typeof value.externalMedia !== "boolean" ||
      !Number.isFinite(value.updatedAt) || !Number.isFinite(value.expiresAt) ||
      value.updatedAt > now || value.updatedAt < 0 || value.expiresAt <= now ||
      value.expiresAt !== value.updatedAt + CONSENT_TTL) return null;
    return { version: value.version, externalMedia: value.externalMedia, updatedAt: value.updatedAt, expiresAt: value.expiresAt };
  } catch { return null; }
}
