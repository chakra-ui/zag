// Credits: https://github.com/adobe/react-spectrum/blob/main/packages/@react-aria/overlays/src/ariaHideOutside.ts

const elementCountMap = new WeakMap<Element, number>()

function isLiveRegion(node: Node, win: typeof window): node is HTMLElement {
  return node instanceof win.HTMLElement && node.dataset.liveAnnouncer === "true"
}

export function ariaHidden(targets: Array<HTMLElement | null>, rootEl?: HTMLElement) {
  const exclude = targets.filter(Boolean) as HTMLElement[]
  if (exclude.length === 0) return

  const doc = exclude[0].ownerDocument || document
  const win = doc.defaultView ?? window

  const visibleNodes = new Set<Element>(exclude)
  const hiddenNodes = new Set<Element>()

  const root = rootEl ?? doc.body

  const walker = doc.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, {
    acceptNode(node) {
      // If this node is a live announcer, add it to the set of nodes to keep visible.
      if (isLiveRegion(node, win)) {
        visibleNodes.add(node)
      }

      // Skip this node and its children if it is one of the target nodes, or a live announcer.
      // Also skip children of already hidden nodes, as aria-hidden is recursive.
      if (visibleNodes.has(node as Element) || hiddenNodes.has(node.parentElement!)) {
        return NodeFilter.FILTER_REJECT
      }

      // VoiceOver on iOS has issues hiding elements with role="row". Hide the cells inside instead.
      // https://bugs.webkit.org/show_bug.cgi?id=222623
      if (node instanceof win.HTMLElement && node.getAttribute("role") === "row") {
        return NodeFilter.FILTER_SKIP
      }

      // Skip this node but continue to children if one of the targets is inside the node.
      if (exclude.some((target) => node.contains(target))) {
        return NodeFilter.FILTER_SKIP
      }

      return NodeFilter.FILTER_ACCEPT
    },
  })

  const hide = (node: Element) => {
    let refCount = elementCountMap.get(node) ?? 0

    // If already aria-hidden, and the ref count is zero, then this element
    // was already hidden and there's nothing for us to do.
    if (node.getAttribute("aria-hidden") === "true" && refCount === 0) {
      return
    }

    if (refCount === 0) {
      node.setAttribute("aria-hidden", "true")
    }

    hiddenNodes.add(node)
    elementCountMap.set(node, refCount + 1)
  }

  let node = walker.nextNode() as Element

  while (node != null) {
    hide(node)
    node = walker.nextNode() as Element
  }

  const observer = new win.MutationObserver((changes) => {
    for (let change of changes) {
      if (change.type !== "childList" || change.addedNodes.length === 0) continue

      // If the parent element of the added nodes is not within one of the targets,
      // and not already inside a hidden node, hide all of the new children.
      if (![...visibleNodes, ...hiddenNodes].some((node) => node.contains(change.target))) {
        for (const node of change.addedNodes) {
          if (isLiveRegion(node, win)) {
            visibleNodes.add(node)
          } else if (node instanceof win.Element) {
            hide(node)
          }
        }
      }
    }
  })

  observer.observe(root, { childList: true, subtree: true })

  return () => {
    observer.disconnect()

    for (let node of hiddenNodes) {
      let count = elementCountMap.get(node)

      if (count === 1) {
        node.removeAttribute("aria-hidden")
        elementCountMap.delete(node)
        continue
      }

      if (count !== undefined) {
        elementCountMap.set(node, count - 1)
      }
    }
  }
}
