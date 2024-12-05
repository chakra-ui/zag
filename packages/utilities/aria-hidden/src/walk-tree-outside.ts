// Based on https://github.com/theKashey/aria-hidden/blob/master/src/index.ts
// Licensed under MIT

let counterMap = new WeakMap<Element, number>()
let uncontrolledNodes = new WeakMap<Element, boolean>()
let markerMap: Record<string, WeakMap<Element, number>> = {}
let lockCount = 0

const unwrapHost = (node: Element | ShadowRoot): Element | null =>
  node && ((node as ShadowRoot).host || unwrapHost(node.parentNode as Element))

const correctTargets = (parent: HTMLElement, targets: Element[]): Element[] =>
  targets
    .map((target) => {
      if (parent.contains(target)) return target
      const correctedTarget = unwrapHost(target)
      if (correctedTarget && parent.contains(correctedTarget)) {
        return correctedTarget
      }
      console.error("[zag-js > ariaHidden] target", target, "in not contained inside", parent, ". Doing nothing")
      return null
    })
    .filter((x): x is Element => Boolean(x))

interface WalkTreeOutsideOptions {
  parentNode: HTMLElement
  markerName: string
  controlAttribute: string
}

const isIgnoredNode = (node: Element) => {
  if (node.localName === "next-route-announcer") return true
  if (node.localName === "script") return true
  if (node.hasAttribute("aria-live")) return true
  return node.matches("[data-live-announcer]")
}

export const walkTreeOutside = (originalTarget: Element | Element[], props: WalkTreeOutsideOptions): VoidFunction => {
  const { parentNode, markerName, controlAttribute } = props
  const targets = correctTargets(parentNode, Array.isArray(originalTarget) ? originalTarget : [originalTarget])

  markerMap[markerName] ||= new WeakMap()
  const markerCounter = markerMap[markerName]

  const hiddenNodes: Element[] = []
  const elementsToKeep = new Set<Node>()
  const elementsToStop = new Set<Node>(targets)

  const keep = (el: Node | undefined) => {
    if (!el || elementsToKeep.has(el)) return
    elementsToKeep.add(el)
    keep(el.parentNode!)
  }

  targets.forEach(keep)

  const deep = (parent: Element | null) => {
    if (!parent || elementsToStop.has(parent)) {
      return
    }

    Array.prototype.forEach.call(parent.children, (node: Element) => {
      if (elementsToKeep.has(node)) {
        deep(node)
      } else {
        try {
          if (isIgnoredNode(node)) return
          const attr = node.getAttribute(controlAttribute)
          const alreadyHidden = attr !== null && attr !== "false"
          const counterValue = (counterMap.get(node) || 0) + 1
          const markerValue = (markerCounter.get(node) || 0) + 1

          counterMap.set(node, counterValue)
          markerCounter.set(node, markerValue)
          hiddenNodes.push(node)

          if (counterValue === 1 && alreadyHidden) {
            uncontrolledNodes.set(node, true)
          }

          if (markerValue === 1) {
            node.setAttribute(markerName, "")
          }

          if (!alreadyHidden) {
            node.setAttribute(controlAttribute, "")
          }
        } catch (e) {
          console.error("[zag-js > ariaHidden] cannot operate on ", node, e)
        }
      }
    })
  }

  deep(parentNode)
  elementsToKeep.clear()

  lockCount++

  return () => {
    hiddenNodes.forEach((node) => {
      const counterValue = counterMap.get(node)! - 1
      const markerValue = markerCounter.get(node)! - 1

      counterMap.set(node, counterValue)
      markerCounter.set(node, markerValue)

      if (!counterValue) {
        if (!uncontrolledNodes.has(node)) {
          node.removeAttribute(controlAttribute)
        }
        uncontrolledNodes.delete(node)
      }

      if (!markerValue) {
        node.removeAttribute(markerName)
      }
    })

    lockCount--

    if (!lockCount) {
      // clear
      counterMap = new WeakMap()
      counterMap = new WeakMap()
      uncontrolledNodes = new WeakMap()
      markerMap = {}
    }
  }
}
