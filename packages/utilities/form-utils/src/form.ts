export function getClosestForm(el: HTMLElement) {
  if (isFormElement(el)) return el.form
  else return el.closest("form")
}

function isFormElement(el: HTMLElement): el is HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement {
  return el.matches("textarea, input, select, button")
}

function trackFormReset(el: HTMLElement | null | undefined, callback: () => void) {
  if (!el) return
  const form = getClosestForm(el)
  form?.addEventListener("reset", callback, { passive: true })
  return () => {
    form?.removeEventListener("reset", callback)
  }
}

function trackFieldsetDisabled(el: HTMLElement | null | undefined, callback: (disabled: boolean) => void) {
  const fieldset = el?.closest("fieldset")
  if (!fieldset) return
  callback(fieldset.disabled)
  const win = fieldset.ownerDocument.defaultView || window
  const obs = new win.MutationObserver(() => callback(fieldset.disabled))
  obs.observe(fieldset, {
    attributes: true,
    attributeFilter: ["disabled"],
  })
  return () => obs.disconnect()
}

export function isNativeDisabled(el: HTMLElement) {
  return el.matches(":disabled")
}

export type FormControlOptions = {
  onFieldsetDisabledChange: (disabled: boolean) => void
  onFormReset: () => void
}

export function trackFormControl(el: HTMLElement | null, options: FormControlOptions) {
  if (!el) return

  const { onFieldsetDisabledChange, onFormReset } = options

  const cleanups = [trackFormReset(el, onFormReset), trackFieldsetDisabled(el, onFieldsetDisabledChange)]

  return () => {
    cleanups.forEach((cleanup) => cleanup?.())
  }
}
