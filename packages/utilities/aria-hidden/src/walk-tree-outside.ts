// Based on https://github.com/theKashey/aria-hidden/blob/master/src/index.ts
// Licensed under MIT

import { findControlledElements, isHTMLElement } from "@zag-js/dom-query"

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
  explicitBooleanValue: boolean
  followControlledElements?: boolean
}

const ignoreableNodes = new Set<string>(["script", "output", "status", "next-route-announcer"])
const isIgnoredNode = (node: Element) => {
  if (ignoreableNodes.has(node.localName)) return true
  if (node.role === "status") return true
  if (node.hasAttribute("aria-live")) return true
  return node.matches("[data-live-announcer]")
}

const applyAttributeToOthers = (allTargets: Element[], props: WalkTreeOutsideOptions): VoidFunction => {
  const { parentNode, markerName, controlAttribute, explicitBooleanValue, followControlledElements = true } = props
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
          const alreadyHidden = explicitBooleanValue ? attr === "true" : attr !== null && attr !== "false"
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
            node.setAttribute(controlAttribute, explicitBooleanValue ? "true" : "")
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
  const { parentNode, controlAttribute, explicitBooleanValue, followControlledElements = true } = props
  const targets = correctTargets(parentNode, Array.isArray(originalTarget) ? originalTarget : [originalTarget])

  // An invalid target must not pause the active lock
  if (!targets.length) return () => {}

  const hiddenSelector = explicitBooleanValue ? `[${controlAttribute}="true"]` : `[${controlAttribute}]`

  let undo: VoidFunction | undefined
  let observer: MutationObserver | undefined

  const apply = () => {
    // Apply before undoing, so nodes hidden by both walks keep their attribute
    const prevUndo = undo
    undo = applyAttributeToOthers(targets, props)
    prevUndo?.()
  }

  const release = () => {
    undo?.()
    undo = undefined
  }

  // A controller inside hidden content can't reveal anything
  const isVisibleController = (record: MutationRecord) => !(record.target as Element).closest(hiddenSelector)

  const lock: Lock = {
    pause() {
      observer?.disconnect()
      observer = undefined
      release()
    },
    resume() {
      apply()
      if (!followControlledElements) return
      // Re-walk when a controller expands or collapses, so popups opened from inside the targets stay visible
      const win = parentNode.ownerDocument.defaultView
      if (!win?.MutationObserver) return
      observer = new win.MutationObserver((records) => {
        if (records.some(isVisibleController)) apply()
      })
      observer.observe(parentNode, { attributes: true, attributeFilter: ["aria-expanded"], subtree: true })
    },
  }

  const lockStack = getLockStack(parentNode.ownerDocument)
  lockStack.add(lock)
  return () => lockStack.remove(lock)
}
