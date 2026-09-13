export interface ConsentRecord { version: number; externalMedia: boolean; updatedAt: number; expiresAt: number; }
export const CONSENT_VERSION: number;
export const CONSENT_TTL: number;
export const CONSENT_KEY: string;
export function createConsent(externalMedia: boolean, now?: number): ConsentRecord;
export function parseConsent(raw: string | null, now?: number): ConsentRecord | null;
