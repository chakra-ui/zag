import { createSharedMutationObserver, isHTMLElement } from "@zag-js/dom-query"

const SELECTOR_ESCAPE_RE = /["\\]/g

const elementObserver = /* @__PURE__ */ createSharedMutationObserver({
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ["data-index"],
})

export interface TrackElementsOptions {
  /** CSS selector for the elements to track */
  selector: string
  onAdd: (element: HTMLElement) => void
  onRemove: (element: HTMLElement) => void
  /** A tracked element's `data-index` changed, as when a framework reuses the node for another item */
  onIndexChange: (element: HTMLElement) => void
}

/** Reports elements matching `selector` as they enter, leave, or change index inside `root`. */
export function trackElements(root: HTMLElement, options: TrackElementsOptions): VoidFunction {
  const { selector, onAdd, onRemove, onIndexChange } = options
  const tracked = new Set<HTMLElement>()

  const add = (element: HTMLElement) => {
    if (tracked.has(element)) return
    tracked.add(element)
    onAdd(element)
  }

  const scan = (node: Node) => {
    if (!isHTMLElement(node)) return
    if (node.matches(selector)) add(node)
    node.querySelectorAll<HTMLElement>(selector).forEach(add)
  }

  const win = root.ownerDocument?.defaultView
  if (!win?.MutationObserver) return () => tracked.clear()

  scan(root)

  const stopObserving = elementObserver.observe(root, (records) => {
    let removed = false
    for (const record of records) {
      if (record.type === "attributes") {
        const target = record.target as HTMLElement
        if (tracked.has(target)) onIndexChange(target)
        else scan(target)
        continue
      }
      if (record.removedNodes.length > 0) removed = true
      record.addedNodes.forEach(scan)
    }

    // Checked after additions, so a node moved within the root stays tracked
    if (!removed) return
    for (const element of tracked) {
      if (root.contains(element)) continue
      tracked.delete(element)
      onRemove(element)
    }
  })

  return () => {
    stopObserving()
    tracked.clear()
  }
}

/** Attribute selector for an element of this virtualizer, safe for ids with `:` or quotes. */
export function partSelector(part: string, id: string): string {
  return `[data-virtualizer-${part}="${id.replace(SELECTOR_ESCAPE_RE, "\\$&")}"]`
}
