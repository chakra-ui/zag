// Based on https://github.com/theKashey/aria-hidden/blob/master/src/index.ts
// Licensed under MIT

import { findControlledElements, isElement, isHTMLElement, isShadowRoot } from "@zag-js/dom-query"
import { createSharedMutationObserver } from "@zag-js/dom-query/observe"

let counterMap = new WeakMap<Element, number>()
let uncontrolledNodes = new WeakMap<Element, boolean>()
let markerMap: Record<string, WeakMap<Element, number>> = {}
let lockCount = 0

const expandedObserver = /* @__PURE__ */ createSharedMutationObserver({
  attributeFilter: ["aria-expanded"],
  subtree: true,
})

const getHost = (node: Element): Element | null => {
  const root = node.getRootNode()
  return isShadowRoot(root) ? root.host : null
}

// A target in a shadow root is represented in the parent by its outermost host there.
// Also returns the targets that passed, so rejected ones don't trigger shadow walks.
const correctTargets = (parent: HTMLElement | ShadowRoot, originals: Element[]) => {
  const targets: Element[] = []
  const valid: Element[] = []
  originals.forEach((target) => {
    let node: Element | null = target
    while (node && !parent.contains(node)) node = getHost(node)
    if (node) {
      targets.push(node)
      valid.push(target)
    } else {
      console.error("[zag-js > ariaHidden] target", target, "in not contained inside", parent, ". Doing nothing")
    }
  })
  return { targets, valid }
}

// Each shadow root between a target and the parent, with the target or the host it sits in at that level.
// A target inside another target is skipped, since the outer target's content is left untouched.
const getShadowScopes = (parent: HTMLElement | ShadowRoot, targets: Element[]) => {
  const parentRoot = isShadowRoot(parent) ? parent : parent.getRootNode()
  const scopes = new Map<ShadowRoot, Element[]>()
  targets.forEach((target) => {
    const path: Array<[ShadowRoot, Element]> = []
    let node = target
    let root = node.getRootNode()
    while (isShadowRoot(root) && root !== parentRoot) {
      path.push([root, node])
      node = root.host
      if (targets.some((other) => other.contains(node))) return
      root = node.getRootNode()
    }
    path.forEach(([root, node]) => {
      const scope = scopes.get(root)
      if (scope) scope.push(node)
      else scopes.set(root, [node])
    })
  })
  return scopes
}

interface WalkTreeOutsideOptions {
  parentNode: HTMLElement | ShadowRoot
  markerName: string
  attribute: "aria-hidden" | "inert"
  followControlledElements?: boolean
}

const LIVE_REGION_SELECTOR = 'output, status, next-route-announcer, [role="status"], [aria-live], [data-live-announcer]'
const isIgnoredNode = (node: Element) => node.localName === "script" || node.matches(LIVE_REGION_SELECTOR)

const applyAttributeToOthers = (allTargets: Element[], props: WalkTreeOutsideOptions): VoidFunction => {
  const { parentNode, markerName, attribute, followControlledElements = true } = props
  const attributeValue = attribute === "aria-hidden" ? "true" : ""

  // A target can be removed while its lock is paused
  const targets = allTargets.filter((target) => parentNode.contains(target))

  // Without a target, the walk would hide every child of the parent node
  if (!targets.length) return () => {}

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

  // Live regions keep announcing even when nested, e.g. inside a portal's wrapper element.
  // Skip ones wrapping a target: stopping there would leave everything around the target exposed.
  parentNode.querySelectorAll(LIVE_REGION_SELECTOR).forEach((region) => {
    if (targets.some((target) => target.contains(region) || region.contains(target))) return
    keep(region)
    elementsToStop.add(region)
  })

  targets.forEach((target) => {
    keep(target)
    // Also keep any elements that are controlled by elements within the target
    if (followControlledElements && isHTMLElement(target)) {
      findControlledElements(target, (controlledElement) => {
        keep(controlledElement)
        // Like a target, its own content stays untouched
        elementsToStop.add(controlledElement)
      })
    }
  })

  const deep = (parent: Element | ShadowRoot | null) => {
    if (!parent || elementsToStop.has(parent)) {
      return
    }

    Array.prototype.forEach.call(parent.children, (node: Element) => {
      if (elementsToKeep.has(node)) {
        deep(node)
      } else {
        try {
          if (isIgnoredNode(node)) return
          const alreadyHidden =
            attribute === "aria-hidden" ? node.getAttribute(attribute) === "true" : node.hasAttribute(attribute)
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
            node.setAttribute(attribute, attributeValue)
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
          node.removeAttribute(attribute)
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
      uncontrolledNodes = new WeakMap()
      markerMap = {}
    }
  }
}

interface Lock {
  pause: VoidFunction
  resume: VoidFunction
}

// Only the topmost lock is applied, like nested modal dialogs in the browser.
// An earlier lock would otherwise keep hiding the portal of a lock opened after it.
function createLockStack() {
  const locks: Lock[] = []
  return {
    add(lock: Lock) {
      locks[locks.length - 1]?.pause()
      locks.push(lock)
      lock.resume()
    },
    remove(lock: Lock) {
      const index = locks.indexOf(lock)
      if (index === -1) return
      const isTop = index === locks.length - 1
      locks.splice(index, 1)
      // A lock below the top is already paused
      if (!isTop) return
      lock.pause()
      locks[locks.length - 1]?.resume()
    },
  }
}

type LockStack = ReturnType<typeof createLockStack>

// One stack per document, so a modal in another document (e.g. an iframe) doesn't pause this one
const lockStacks = new WeakMap<Document, LockStack>()

const getLockStack = (doc: Document) => {
  let stack = lockStacks.get(doc)
  if (!stack) {
    stack = createLockStack()
    lockStacks.set(doc, stack)
  }
  return stack
}

export const walkTreeOutside = (originalTarget: Element | Element[], props: WalkTreeOutsideOptions): VoidFunction => {
  const { parentNode, attribute, followControlledElements = true } = props
  const originalTargets = Array.isArray(originalTarget) ? originalTarget : [originalTarget]
  const { targets, valid } = correctTargets(parentNode, originalTargets)

  // An invalid target must not pause the active lock
  if (!targets.length) return () => {}

  // The document walk stops at a shadow host, so content beside the target inside it is walked separately
  const scopes = [...getShadowScopes(parentNode, valid)]
  const roots = [parentNode, ...scopes.map(([root]) => root)]

  const hiddenSelector = attribute === "aria-hidden" ? '[aria-hidden="true"]' : "[inert]"

  let undo: VoidFunction | undefined
  let stopObserving: VoidFunction[] = []

  const apply = () => {
    // Apply before undoing, so nodes hidden by both walks keep their attribute
    const prevUndo = undo
    const undos = [
      applyAttributeToOthers(targets, props),
      ...scopes.map(([root, scopeTargets]) => applyAttributeToOthers(scopeTargets, { ...props, parentNode: root })),
    ]
    undo = () => undos.forEach((fn) => fn())
    prevUndo?.()
  }

  const release = () => {
    undo?.()
    undo = undefined
  }

  const lock: Lock = {
    pause() {
      stopObserving.forEach((stop) => stop())
      stopObserving = []
      release()
    },
    resume() {
      apply()
      if (!followControlledElements) return

      // Sync controlled popups when their controllers expand or collapse
      const onChange = (records: readonly MutationRecord[]) => {
        // a controller inside hidden content can't reveal anything
        if (records.some(({ target }) => isElement(target) && !target.closest(hiddenSelector))) apply()
      }
      stopObserving = roots.map((root) => expandedObserver.observe(root, onChange))
    },
  }

  const lockStack = getLockStack(parentNode.ownerDocument!)
  lockStack.add(lock)
  return () => lockStack.remove(lock)
}
