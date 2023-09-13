// Credits: https://github.com/adobe/react-spectrum/blob/main/packages/@react-aria/overlays/src/ariaHideOutside.ts
import { raf } from "@zag-js/dom-query"

const refCountMap = new WeakMap<Element, number>()
const observerStack: any[] = []

export interface AriaHiddenOptions {
  rootEl?: HTMLElement
  defer?: boolean
}

type MaybeElement = HTMLElement | null
type Targets = Array<MaybeElement>
type TargetsOrFn = Targets | (() => Targets)

function ariaHiddenImpl(targets: Targets, options: AriaHiddenOptions = {}) {
  const { rootEl } = options

  const exclude = targets.filter(Boolean) as HTMLElement[]
  if (exclude.length === 0) return

  const doc = exclude[0].ownerDocument || document
  const win = doc.defaultView ?? window

  const visibleNodes = new Set<Element>(exclude)
  const hiddenNodes = new Set<Element>()

  const root = rootEl ?? doc.body

  let walk = (root: Element) => {
    // Keep live announcer and top layer elements (e.g. toasts) visible.
    for (let element of root.querySelectorAll("[data-live-announcer], [data-zag-top-layer]")) {
      visibleNodes.add(element)
    }

    let acceptNode = (node: Element) => {
      // Skip this node and its children if it is one of the target nodes, or a live announcer.
      // Also skip children of already hidden nodes, as aria-hidden is recursive. An exception is
      // made for elements with role="row" since VoiceOver on iOS has issues hiding elements with role="row".
      // For that case we want to hide the cells inside as well (https://bugs.webkit.org/show_bug.cgi?id=222623).
      if (
        visibleNodes.has(node) ||
        (hiddenNodes.has(node.parentElement!) && node.parentElement!.getAttribute("role") !== "row")
      ) {
        return NodeFilter.FILTER_REJECT
      }

      // Skip this node but continue to children if one of the targets is inside the node.
      for (let target of visibleNodes) {
        if (node.contains(target)) {
          return NodeFilter.FILTER_SKIP
        }
      }

      return NodeFilter.FILTER_ACCEPT
    }

    let walker = doc.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, { acceptNode })

    // TreeWalker does not include the root.
    let acceptRoot = acceptNode(root)
    if (acceptRoot === NodeFilter.FILTER_ACCEPT) {
      hide(root)
    }

    if (acceptRoot !== NodeFilter.FILTER_REJECT) {
      let node = walker.nextNode() as Element
      while (node != null) {
        hide(node)
        node = walker.nextNode() as Element
      }
    }
  }

  let hide = (node: Element) => {
    let refCount = refCountMap.get(node) ?? 0

    // If already aria-hidden, and the ref count is zero, then this element
    // was already hidden and there's nothing for us to do.
    if (node.getAttribute("aria-hidden") === "true" && refCount === 0) {
      return
    }

    if (refCount === 0) {
      node.setAttribute("aria-hidden", "true")
    }

    hiddenNodes.add(node)
    refCountMap.set(node, refCount + 1)
  }

  if (observerStack.length) {
    observerStack[observerStack.length - 1].disconnect()
  }

  walk(root)

  const observer = new win.MutationObserver((changes) => {
    for (let change of changes) {
      if (change.type !== "childList" || change.addedNodes.length === 0) {
        continue
      }

      // If the parent element of the added nodes is not within one of the targets,
      // and not already inside a hidden node, hide all of the new children.
      if (![...visibleNodes, ...hiddenNodes].some((node) => node.contains(change.target))) {
        for (let node of change.removedNodes) {
          if (node instanceof win.Element) {
            visibleNodes.delete(node)
            hiddenNodes.delete(node)
          }
        }

        for (let node of change.addedNodes) {
          if (
            (node instanceof win.HTMLElement || node instanceof win.SVGElement) &&
            (node.dataset.liveAnnouncer === "true" || node.dataset.zagTopLayer === "true")
          ) {
            visibleNodes.add(node)
          } else if (node instanceof win.Element) {
            walk(node)
          }
        }
      }
    }
  })

  observer.observe(root, { childList: true, subtree: true })

  let observerWrapper = {
    observe() {
      observer.observe(root, { childList: true, subtree: true })
    },
    disconnect() {
      observer.disconnect()
    },
  }

  observerStack.push(observerWrapper)

  return () => {
    observer.disconnect()

    for (let node of hiddenNodes) {
      let count = refCountMap.get(node)
      if (count === 1) {
        node.removeAttribute("aria-hidden")
        refCountMap.delete(node)
      } else {
        refCountMap.set(node, count! - 1)
      }
    }

    // Remove this observer from the stack, and start the previous one.
    if (observerWrapper === observerStack[observerStack.length - 1]) {
      observerStack.pop()
      if (observerStack.length) {
        observerStack[observerStack.length - 1].observe()
      }
    } else {
      observerStack.splice(observerStack.indexOf(observerWrapper), 1)
    }
  }
}

export function ariaHidden(targetsOrFn: TargetsOrFn, options: AriaHiddenOptions = {}) {
  const { defer } = options
  const func = defer ? raf : (v: any) => v()
  const cleanups: (VoidFunction | undefined)[] = []
  cleanups.push(
    func(() => {
      const targets = typeof targetsOrFn === "function" ? targetsOrFn() : targetsOrFn
      cleanups.push(ariaHiddenImpl(targets, options))
    }),
  )
  return () => {
    cleanups.forEach((fn) => fn?.())
  }
}
