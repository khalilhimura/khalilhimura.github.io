import { CONSENT_KEY, createConsent, parseConsent, type ConsentRecord } from "../lib/consent.mjs";

export const CONSENT_EVENT = "kn:consent-change";
let memoryChoice: ConsentRecord | null = null;
let storageUnavailable = false;
let timer: ReturnType<typeof setTimeout> | undefined;
let settingsOpener: HTMLElement | null = null;

export function getConsent(): ConsentRecord | null {
  if (storageUnavailable) return memoryChoice && parseConsent(JSON.stringify(memoryChoice));
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    const record = parseConsent(raw);
    if (raw !== null && !record) localStorage.removeItem(CONSENT_KEY);
    return record;
  }
  catch { storageUnavailable = true; return memoryChoice && parseConsent(JSON.stringify(memoryChoice)); }
}

export function allowsExternalMedia() { return getConsent()?.externalMedia === true; }

function notify() {
  window.dispatchEvent(new Event(CONSENT_EVENT));
  clearTimeout(timer);
  const record = getConsent();
  // JavaScript timers have a ~24-day limit; periodically re-check long-lived tabs.
  if (record) timer = setTimeout(notify, Math.min(record.expiresAt - Date.now() + 1, 2_147_483_647));
}

export function saveConsent(externalMedia: boolean) {
  memoryChoice = createConsent(externalMedia);
  try { localStorage.setItem(CONSENT_KEY, JSON.stringify(memoryChoice)); storageUnavailable = false; }
  catch {
    storageUnavailable = true;
    // A failed rejection write must not leave a previous grant stored if removal is possible.
    try { localStorage.removeItem(CONSENT_KEY); } catch { /* The page still uses the in-memory choice. */ }
  }
  notify();
  return !storageUnavailable;
}

export function openCookieSettings(forVideo = false) {
  const dialog = document.querySelector<HTMLDialogElement>("#cookie-preferences");
  const toggle = document.querySelector<HTMLInputElement>("#consent-external-media");
  const note = document.querySelector<HTMLElement>("[data-consent-video-note]");
  if (!dialog || !toggle) return;
  if (!dialog.open) settingsOpener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  toggle.checked = allowsExternalMedia();
  if (note) note.hidden = !forVideo;
  const banner = document.querySelector<HTMLElement>("[data-consent-banner]");
  if (banner) banner.hidden = true;
  if (!dialog.open) dialog.showModal();
}

function initConsent() {
  const banner = document.querySelector<HTMLElement>("[data-consent-banner]");
  const dialog = document.querySelector<HTMLDialogElement>("#cookie-preferences");
  const toggle = document.querySelector<HTMLInputElement>("#consent-external-media");
  const announcement = document.querySelector<HTMLElement>("[data-consent-announcement]");
  if (!banner || !dialog || !toggle) return;

  function render() { if (banner && dialog) banner.hidden = dialog.open || getConsent() !== null; }
  function choose(allow: boolean) {
    const persistent = saveConsent(allow);
    dialog?.close();
    render();
    if (announcement) announcement.textContent = `${allow ? "External media allowed. Use Load video to open a player." : "Optional services rejected. External media is blocked."} ${persistent ? "Your choice is saved for 180 days." : "Your browser could not save this choice. It applies to this page only."}`;
  }
  document.querySelectorAll<HTMLButtonElement>("[data-cookie-settings]").forEach(button => {
    button.hidden = false;
    button.addEventListener("click", () => openCookieSettings());
  });
  document.querySelectorAll("[data-consent-accept]").forEach(button => button.addEventListener("click", () => choose(true)));
  document.querySelectorAll("[data-consent-reject]").forEach(button => button.addEventListener("click", () => choose(false)));
  document.querySelector("[data-consent-save]")?.addEventListener("click", () => choose(toggle.checked));
  document.querySelector("[data-consent-close]")?.addEventListener("click", () => dialog.close());
  dialog.addEventListener("keydown", event => {
    if (event.key !== "Tab") return;
    const controls = [...dialog.querySelectorAll<HTMLElement>("button:not([disabled]), input:not([disabled]), a[href]")]
      .filter(control => control.getClientRects().length > 0);
    const first = controls[0];
    const last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  });
  dialog.addEventListener("close", () => {
    render();
    // The banner was hidden before showModal, so native return-focus alone is insufficient.
    const target = settingsOpener?.isConnected && settingsOpener.getClientRects().length
      ? settingsOpener : document.querySelector<HTMLElement>("footer [data-cookie-settings]");
    target?.focus({ preventScroll: true });
    settingsOpener = null;
  });
  window.addEventListener(CONSENT_EVENT, render);
  window.addEventListener("storage", event => {
    if (event.key === CONSENT_KEY || event.key === null) {
      memoryChoice = null;
      if (dialog.open) toggle.checked = allowsExternalMedia();
      notify();
    }
  });
  window.addEventListener("focus", notify);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) notify(); });
  notify();
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initConsent, { once: true });
else initConsent();
