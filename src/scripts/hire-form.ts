import { buildHireMailto, missingHireFields, readHireFields } from "../lib/hire-form.mjs";

function statusEl(form: HTMLFormElement) {
  return form.querySelector<HTMLElement>("[data-hire-form-status]");
}

function setStatus(form: HTMLFormElement, message: string, isError = false) {
  const status = statusEl(form);
  if (!status) return;
  status.hidden = false;
  status.textContent = message;
  status.setAttribute("role", isError ? "alert" : "status");
}

function bind(form: HTMLFormElement) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const fields = readHireFields(new FormData(form));
    const missing = missingHireFields(fields);
    if (missing.length) {
      form.reportValidity();
      setStatus(form, "Please complete the required fields before requesting a meeting.", true);
      return;
    }

    const mailto = buildHireMailto(fields);
    setStatus(
      form,
      `Your email app should open with the request. If nothing opens, send the same details to ${form.dataset.hireInbox ?? "the inbox on this page"}.`
    );
    window.location.href = mailto;
  });
}

document.querySelectorAll<HTMLFormElement>("[data-hire-form]").forEach(bind);
