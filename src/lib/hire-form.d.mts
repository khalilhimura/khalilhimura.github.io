/** Audy · AI Familiar's Grok Bot inbox */
export const HIRE_INBOX: string;
export const HOURLY_RATE_RM: number;
export function meetingHours(length: string | number | null | undefined): 1 | 2;
export function formatRm(amount: number): string;
export function meetingModeLabel(mode: string | null | undefined): string;
export function readHireFields(data: FormData | Record<string, string>): {
  name: string;
  email: string;
  company: string;
  building: string;
  setup: string;
  timezone: string;
  windows: string;
  length: string;
  mode: string;
  preread: string;
};
export function missingHireFields(fields: ReturnType<typeof readHireFields>): string[];
export function buildHireMailto(fields: ReturnType<typeof readHireFields>): string;
