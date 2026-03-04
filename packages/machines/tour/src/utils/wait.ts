import { getWindow, waitForPromise, type WaitForOptions, type WaitForPromiseReturn } from "@zag-js/dom-query"

type EditableElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement

export function waitForElementValue(
  target: () => EditableElement | null,
  value: string,
  options: WaitForOptions,
): WaitForPromiseReturn<void> {
  const { timeout, rootNode } = options

  const win = getWindow(rootNode)
  const controller = new win.AbortController()

  return waitForPromise(
    new Promise<void>((resolve) => {
      const el = target()
      if (!el) return

      const checkValue = () => {
        if (el.value === value) {
          resolve()
          el.removeEventListener("input", checkValue)
        }
      }

      checkValue()

      el.addEventListener("input", checkValue, { signal: controller.signal })
    }),
    controller,
    timeout,
  )
}

export { waitForElement, waitForPromise } from "@zag-js/dom-query"

export type { WaitForOptions as WaitOptions }
