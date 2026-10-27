/** Audy · AI Familiar's Grok Bot inbox */
export const HIRE_INBOX = "audy@mail.grokbot.com";
export const HOURLY_RATE_RM = 1420;

export function meetingHours(length) {
  return Number(length) === 2 ? 2 : 1;
}

export function formatRm(amount) {
  return `RM ${Math.round(amount).toLocaleString("en-US")}`;
}

export function meetingModeLabel(mode) {
  if (mode === "kl") return "In person in Kuala Lumpur";
  if (mode === "video") return "Video";
  return "";
}

export function readHireFields(data) {
  const value = (name) => String(data.get?.(name) ?? data[name] ?? "").trim();
  return {
    name: value("name"),
    email: value("email"),
    company: value("company"),
    building: value("building"),
    setup: value("setup"),
    timezone: value("timezone"),
    windows: value("windows"),
    length: value("length"),
    mode: value("mode"),
    preread: value("preread")
  };
}

export function missingHireFields(fields) {
  const missing = [];
  if (!fields.name) missing.push("name");
  if (!fields.email || !fields.email.includes("@")) missing.push("email");
  if (!fields.building) missing.push("building");
  if (!fields.timezone) missing.push("timezone");
  if (!fields.windows) missing.push("windows");
  if (fields.length !== "1" && fields.length !== "2") missing.push("length");
  if (fields.mode !== "kl" && fields.mode !== "video") missing.push("mode");
  return missing;
}

export function buildHireMailto(fields) {
  const missing = missingHireFields(fields);
  if (missing.length) {
    throw new Error(`Missing hire form fields: ${missing.join(", ")}`);
  }

  const hours = meetingHours(fields.length);
  const total = formatRm(hours * HOURLY_RATE_RM);
  const subject = `First CAIO meeting request — ${fields.name} — ${hours}h`;
  const body = [
    `Name: ${fields.name}`,
    `Email: ${fields.email}`,
    `Company / project: ${fields.company || "(not given)"}`,
    `What they're building: ${fields.building}`,
    `City / timezone: ${fields.timezone}`,
    `Preferred windows: ${fields.windows}`,
    `Meeting length: ${hours} hour${hours === 1 ? "" : "s"} (${total})`,
    `Meeting mode: ${meetingModeLabel(fields.mode)}`,
    `Agent / AI setup: ${fields.setup || "(not given)"}`,
    `Pre-read: ${fields.preread || "(not given)"}`,
    "",
    "Invoice before the meeting, once the slot is confirmed."
  ].join("\n");

  return `mailto:${HIRE_INBOX}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
