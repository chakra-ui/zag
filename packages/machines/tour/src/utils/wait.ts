import { getDocument, getWindow } from "@zag-js/dom-query"

export interface WaitOptions {
  timeout: number
  rootNode?: Document | ShadowRoot
}

type WaitForPromiseReturn<T> = [Promise<T>, () => void]

function waitForPromise<T>(promise: Promise<T>, controller: AbortController, timeout: number): WaitForPromiseReturn<T> {
  const { signal } = controller

  const wrappedPromise = new Promise<T>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Timeout of ${timeout}ms exceeded`))
    }, timeout)

    signal.addEventListener("abort", () => {
      clearTimeout(timeoutId)
      reject(new Error("Promise aborted"))
    })

    promise
      .then((result) => {
        if (!signal.aborted) {
          clearTimeout(timeoutId)
          resolve(result)
        }
      })
      .catch((error) => {
        if (!signal.aborted) {
          clearTimeout(timeoutId)
          reject(error)
        }
      })
  })

  const abort = () => controller.abort()

  return [wrappedPromise, abort]
}

export function waitForElement(target: () => HTMLElement, options: WaitOptions): WaitForPromiseReturn<HTMLElement> {
  const { timeout, rootNode } = options

  const win = getWindow(rootNode)
  const doc = getDocument(rootNode)
  const controller = new win.AbortController()

  return waitForPromise(
    new Promise<HTMLElement>((resolve) => {
      const el = target()

      if (el) {
        resolve(el)
        return
      }

      const observer = new win.MutationObserver(() => {
        const el = target()

        if (el) {
          observer.disconnect()
          resolve(el)
        }
      })

      observer.observe(doc.body, {
        childList: true,
        subtree: true,
      })
    }),
    controller,
    timeout,
  )
}

type EditableElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement

export function waitForElementValue(
  target: () => EditableElement | null,
  value: string,
  options: WaitOptions,
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
