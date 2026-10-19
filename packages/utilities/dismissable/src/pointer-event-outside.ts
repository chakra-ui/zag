import { getDocument, getWindow, isHTMLElement, setStyleProperty } from "@zag-js/dom-query"
import { layerStack } from "./layer-stack"
import { observeNode } from "./observe-node"

const layerObservers = new WeakMap<HTMLElement, MutationObserver>()
const persistentPointerEvents = new WeakMap<HTMLElement, { count: number; cleanup: VoidFunction }>()

function allowPersistentPointerEvents(node: HTMLElement) {
  const entry = persistentPointerEvents.get(node) ?? {
    count: 0,
    cleanup: setStyleProperty(node, "pointer-events", "auto"),
  }

  entry.count++
  persistentPointerEvents.set(node, entry)

  return () => {
    if (--entry.count > 0) return
    entry.cleanup()
    persistentPointerEvents.delete(node)
  }
}

function getDesiredPointerEvents(node: HTMLElement): "auto" | "none" {
  return layerStack.isBelowPointerBlockingLayer(node) ? "none" : "auto"
}

function applyPointerEvents(node: HTMLElement) {
  const desired = getDesiredPointerEvents(node)
  if (node.style.pointerEvents !== desired) {
    node.style.pointerEvents = desired
  }
}

function ensurePointerEventsObserver(node: HTMLElement) {
  if (layerObservers.has(node)) return

  const win = getWindow(node)
  if (typeof win.MutationObserver === "undefined") return

  const observer = new win.MutationObserver(() => {
    if (!layerObservers.has(node)) return
    applyPointerEvents(node)
  })

  observer.observe(node, { attributes: true, attributeFilter: ["style"] })
  layerObservers.set(node, observer)
}

export function assignPointerEventToLayers() {
  layerStack.layers.forEach(({ node }) => {
    if (!node) return
    applyPointerEvents(node)
    ensurePointerEventsObserver(node)
  })
}

export function clearPointerEvent(node: HTMLElement) {
  const observer = layerObservers.get(node)
  if (observer) {
    observer.disconnect()
    layerObservers.delete(node)
  }
  node.style.pointerEvents = ""
}

export function disablePointerEventsOutside(
  node: HTMLElement,
  persistentElements?: Array<() => Element | null>,
  rootNode?: Document | ShadowRoot | Element,
) {
  const doc = getDocument(node)
  const cleanups: VoidFunction[] = []

  queueMicrotask(() => syncBodyPointerEvents(doc))

  persistentElements?.forEach((el) => {
    const getNode = () => {
      const node = el()
      return isHTMLElement(node) ? node : null
    }
    cleanups.push(observeNode(getNode, { attach: allowPersistentPointerEvents, getRootNode: () => rootNode ?? doc }))
  })

  return () => {
    queueMicrotask(() => syncBodyPointerEvents(doc))
    cleanups.forEach((fn) => fn())
  }
}

interface BodyLock {
  owners: Set<object>
  original: string
}

// Stored on the document so duplicate copies of this package share one body lock
const BODY_LOCK: unique symbol = Symbol.for("@zag-js/dismissable/body-lock")
const owner = {}

type LockableDocument = Document & { [BODY_LOCK]?: BodyLock | undefined }

function syncBodyPointerEvents(doc: LockableDocument) {
  const body = doc.body
  if (!body) return

  const lock = doc[BODY_LOCK]

  if (layerStack.hasPointerBlockingLayer(doc)) {
    if (lock) lock.owners.add(owner)
    else doc[BODY_LOCK] = { owners: new Set([owner]), original: body.style.pointerEvents }

    body.style.pointerEvents = "none"
    body.setAttribute("data-inert", "")
    return
  }

  // Unlock only when no copy of this package still blocks the page
  if (!lock || !lock.owners.delete(owner) || lock.owners.size > 0) return
  delete doc[BODY_LOCK]

  body.style.pointerEvents = lock.original
  body.removeAttribute("data-inert")
  if (body.style.length === 0) body.removeAttribute("style")
}
