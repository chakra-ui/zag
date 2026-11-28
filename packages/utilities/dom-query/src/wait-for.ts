import { createSharedMutationObserver } from "./observe/mutation-observer"
import { getDocument, getWindow } from "./node"

const subtreeObserver = /* @__PURE__ */ createSharedMutationObserver({ childList: true, subtree: true })

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
      reject(new DOMException("Promise aborted", "AbortError"))
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

  let stopObserving: VoidFunction | undefined

  const result = waitForPromise(
    new Promise<HTMLElement>((resolve) => {
      const el = target()

      if (el) {
        resolve(el)
        return
      }

      stopObserving = subtreeObserver.observe(doc.body, () => {
        const el = target()

        if (el && el.isConnected) {
          stopObserving?.()
          resolve(el)
        }
      })
    }),
    controller,
    timeout,
  )

  // also on abort or timeout
  const stop = () => stopObserving?.()
  result[0].then(stop, stop)

  return result
}

type WaitForEventReturn<K extends keyof HTMLElementEventMap> = [Promise<HTMLElementEventMap[K]>, VoidFunction]

export interface WaitForEventOptions<T extends HTMLElement = HTMLElement> extends AddEventListenerOptions {
  predicate?: (element: T) => boolean
}

export function waitForEvent<
  T extends HTMLElement = HTMLElement,
  K extends keyof HTMLElementEventMap = keyof HTMLElementEventMap,
>(target: (() => HTMLElement | null) | undefined, event: K, options?: WaitForEventOptions<T>): WaitForEventReturn<K> {
  let cleanup: VoidFunction | undefined
  const { predicate, ...listenerOptions } = options ?? {}

  const promise = new Promise<HTMLElementEventMap[K]>((resolve) => {
    const element = target?.()
    if (!element) {
      return
    }

    const handler = (e: HTMLElementEventMap[K]) => {
      if (!predicate || predicate(element as T)) {
        resolve(e)
        cleanup?.()
      }
    }

    element.addEventListener(event, handler, listenerOptions)
    cleanup = () => element.removeEventListener(event, handler, listenerOptions)
  })

  return [promise, () => cleanup?.()]
}
