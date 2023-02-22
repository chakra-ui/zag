import { observeAttributes } from "@zag-js/mutation-observer"

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
  return observeAttributes(fieldset, ["disabled"], () => callback(fieldset.disabled))
}

export function isNativeDisabled(el: HTMLElement) {
  return el.matches(":disabled")
}

export type FormControlOptions = {
  onFieldsetDisabled: () => void
  onFormReset: () => void
}

export function trackFormControl(el: HTMLElement | null, options: FormControlOptions) {
  if (!el) return

  const { onFieldsetDisabled, onFormReset } = options

  const cleanups = [
    trackFormReset(el, onFormReset),
    trackFieldsetDisabled(el, (disabled) => {
      if (disabled) onFieldsetDisabled()
    }),
  ]

  return () => {
    cleanups.forEach((cleanup) => cleanup?.())
  }
}
