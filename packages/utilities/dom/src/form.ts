export function getForm(el: HTMLElement) {
  if (isFormElement(el)) return el.form
  else return el.closest("form")
}

function isFormElement(el: HTMLElement): el is HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement {
  return ["textarea", "input", "select", "button"].includes(el.localName)
}

export function addFormResetListener(el: HTMLElement, callback: () => void) {
  const form = getForm(el)
  form?.addEventListener("reset", callback, { passive: true })
  return () => {
    form?.removeEventListener("reset", callback)
  }
}
