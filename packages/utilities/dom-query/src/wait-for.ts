import { getDocument, getWindow } from "./node"

export interface WaitForOptions {
  timeout: number
  rootNode?: Document | ShadowRoot | undefined
}

export type WaitForPromiseReturn<T> = [Promise<T>, () => void]

export function waitForPromise<T>(
  promise: Promise<T>,
  controller: AbortController,
  timeout: number,
): WaitForPromiseReturn<T> {
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

export function waitForElement(
  target: () => HTMLElement | null,
  options: WaitForOptions,
): WaitForPromiseReturn<HTMLElement> {
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

        if (el && el.isConnected) {
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
