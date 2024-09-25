import { getWindow } from "@zag-js/dom-query"

export const waitForFn = (rootNode: Document | ShadowRoot) => {
  return function waitFor(fn: () => boolean | undefined) {
    return new Promise<void>((resolve, reject) => {
      const win = getWindow(rootNode)

      const observer = new win.MutationObserver(() => {
        if (fn()) {
          resolve()
          observer.disconnect()
        }
      })

      observer.observe(rootNode, {
        childList: true,
        subtree: true,
        characterData: true,
      })

      setTimeout(() => {
        observer.disconnect()
        reject(new Error("Timeout"))
      }, 3000)
    })
  }
}
