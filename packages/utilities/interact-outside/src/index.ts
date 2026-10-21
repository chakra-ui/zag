import { addDomEvent, isContextMenuEvent, isShadowRoot, isTouchDevice } from "@zag-js/dom-query"
import {
  contains,
  getDocument,
  getEventTarget,
  getNearestOverflowAncestor,
  getWindow,
  isControlledElement,
  isFocusable,
  isHTMLElement,
  raf,
} from "@zag-js/dom-query"
import { callAll, noop } from "@zag-js/utils"
import { getParentWindow, getWindowFrames } from "./frame-utils"

export interface InteractOutsideHandlers {
  /**
   * Function called when the pointer is pressed down outside the component
   */
  onPointerDownOutside?: ((event: PointerDownOutsideEvent) => void) | undefined
  /**
   * Function called when the focus is moved outside the component
   */
  onFocusOutside?: ((event: FocusOutsideEvent) => void) | undefined
  /**
   * Function called when an interaction happens outside the component
   */
  onInteractOutside?: ((event: InteractOutsideEvent) => void) | undefined
}

export interface InteractOutsideOptions extends InteractOutsideHandlers {
  exclude?: ((target: HTMLElement) => boolean) | undefined
  defer?: boolean | undefined
  /**
   * Default: `true`. If `true`, the interact outside detection will recursively include elements
   * that are controlled by elements within the trap via `aria-controls`. Only elements
   * with `aria-expanded="true"` and interactive container roles (menu, listbox, dialog, etc.)
   * will be included. This allows nested menus, select dropdowns, and other portalled
   * content to remain within the interaction boundary.
   */
  followControlledElements?: boolean | undefined
}

export interface EventDetails<T> {
  originalEvent: T
  contextmenu: boolean
  focusable: boolean
  target: EventTarget
}

const POINTER_OUTSIDE_EVENT = "pointerdown.outside"
const FOCUS_OUTSIDE_EVENT = "focus.outside"

export type PointerDownOutsideEvent = CustomEvent<EventDetails<PointerEvent>>

export type FocusOutsideEvent = CustomEvent<EventDetails<FocusEvent>>

export type InteractOutsideEvent = PointerDownOutsideEvent | FocusOutsideEvent

export type MaybeElement = HTMLElement | null | undefined
export type NodeOrFn = MaybeElement | (() => MaybeElement)

function isComposedPathFocusable(composedPath: EventTarget[]) {
  for (const node of composedPath) {
    if (isHTMLElement(node) && isFocusable(node)) return true
  }
  return false
}

const isPointerEvent = (event: Event): event is PointerEvent => "clientY" in event

function isEventPointWithin(node: MaybeElement, event: Event) {
  if (!isPointerEvent(event) || !node) return false

  const rect = node.getBoundingClientRect()
  if (rect.width === 0 || rect.height === 0) return false

  return (
    rect.top <= event.clientY &&
    event.clientY <= rect.top + rect.height &&
    rect.left <= event.clientX &&
    event.clientX <= rect.left + rect.width
  )
}

function isPointInRect(rect: { x: number; y: number; width: number; height: number }, point: { x: number; y: number }) {
  return rect.y <= point.y && point.y <= rect.y + rect.height && rect.x <= point.x && point.x <= rect.x + rect.width
}

function isEventWithinScrollbar(event: Event, ancestor: HTMLElement): boolean {
  if (!ancestor || !isPointerEvent(event)) return false

  const isScrollableY = ancestor.scrollHeight > ancestor.clientHeight
  const onScrollbarY = isScrollableY && event.clientX > ancestor.offsetLeft + ancestor.clientWidth

  const isScrollableX = ancestor.scrollWidth > ancestor.clientWidth
  const onScrollbarX = isScrollableX && event.clientY > ancestor.offsetTop + ancestor.clientHeight

  const rect = {
    x: ancestor.offsetLeft,
    y: ancestor.offsetTop,
    width: ancestor.clientWidth + (isScrollableY ? 16 : 0),
    height: ancestor.clientHeight + (isScrollableX ? 16 : 0),
  }

  const point = {
    x: event.clientX,
    y: event.clientY,
  }

  if (!isPointInRect(rect, point)) return false

  return onScrollbarY || onScrollbarX
}

const getNow = () => performance.timeOrigin + performance.now()

// Input that began before tracking started belongs to the gesture that opened the component.
function isEventBefore(event: Event, startedAt: number, win: Window) {
  if (!event.timeStamp) return false
  // Frame events are timed from their own window's origin
  const view = (event as UIEvent).view ?? win
  return view.performance.timeOrigin + event.timeStamp < startedAt
}

interface TrackOptions {
  startedAt: number
  deferFocus: boolean
}

function trackInteractOutsideImpl(node: MaybeElement, options: InteractOutsideOptions, trackOptions: TrackOptions) {
  const {
    exclude,
    onFocusOutside,
    onPointerDownOutside,
    onInteractOutside,
    defer,
    followControlledElements = true,
  } = options

  if (!node) return

  const doc = getDocument(node)
  const win = getWindow(node)
  const frames = getWindowFrames(win)
  const parentWin = getParentWindow(win)

  function isEventOutside(event: Event, target: EventTarget | null): boolean {
    if (!isHTMLElement(target)) return false

    // ignore disconnected nodes (removed from DOM)
    if (!target.isConnected) return false

    // ignore nodes that are inside the component
    if (contains(node, target)) return false

    // Ex: password manager selection
    if (isEventPointWithin(node, event)) return false

    // Check if target is within a controlled element that should be considered "inside"
    if (followControlledElements && isControlledElement(node!, target)) return false

    // Ex: page content that is scrollable
    const triggerEl = doc.querySelector(`[aria-controls="${node!.id}"]`)
    if (triggerEl) {
      const triggerAncestor = getNearestOverflowAncestor(triggerEl)
      if (isEventWithinScrollbar(event, triggerAncestor)) return false
    }

    // Ex: dialog positioner that is scrollable
    const nodeAncestor = getNearestOverflowAncestor(node!)
    if (isEventWithinScrollbar(event, nodeAncestor)) return false

    // Custom exclude function
    return !exclude?.(target)
  }

  const pointerdownCleanups: Set<VoidFunction> = new Set()

  const isInShadowRoot = isShadowRoot(node?.getRootNode())

  let isPointerDown = false

  function onPointerDown(event: PointerEvent) {
    if (isEventBefore(event, trackOptions.startedAt, win)) return
    isPointerDown = true
    const onPointerUp = () => {
      isPointerDown = false
    }
    doc.addEventListener("pointerup", onPointerUp, { once: true })
    win.addEventListener("pointerup", onPointerUp, { once: true })
    //
    function handler(clickEvent?: MouseEvent) {
      const func = defer && !isTouchDevice() ? raf : (v: any) => v()
      const evt = clickEvent ?? event
      const composedPath = evt?.composedPath?.() ?? [evt?.target]
      func(() => {
        const target = isInShadowRoot ? composedPath[0] : getEventTarget<HTMLElement>(event)
        if (!node || !isEventOutside(event, target)) return

        if (onPointerDownOutside || onInteractOutside) {
          const handler = callAll(onPointerDownOutside, onInteractOutside) as EventListener
          node.addEventListener(POINTER_OUTSIDE_EVENT, handler, { once: true })
        }

        fireCustomEvent(node, POINTER_OUTSIDE_EVENT, {
          bubbles: false,
          cancelable: true,
          detail: {
            originalEvent: evt,
            contextmenu: isContextMenuEvent(evt),
            focusable: isComposedPathFocusable(composedPath),
            target,
          },
        })
      })
    }

    if (event.pointerType === "touch") {
      // flush any pending pointerup events
      pointerdownCleanups.forEach((fn) => fn())
      // add a pointerup event listener to the document and all frame documents
      pointerdownCleanups.add(addDomEvent(doc, "click", handler, { once: true }))
      pointerdownCleanups.add(parentWin.addEventListener("click", handler, { once: true }))
      pointerdownCleanups.add(frames.addEventListener("click", handler, { once: true }))
    } else {
      handler()
    }
  }
  const cleanups = new Set<VoidFunction>()

  // Listen right away: a busy main thread must not drop outside presses
  cleanups.add(addDomEvent(doc, "pointerdown", onPointerDown, true))
  cleanups.add(parentWin.addEventListener("pointerdown", onPointerDown, true))
  cleanups.add(frames.addEventListener("pointerdown", onPointerDown, true))

  function onFocusin(event: FocusEvent) {
    // Skip focusin events during pointer interactions.
    // Safari doesn't focus buttons on pointerdown, which can cause
    // focusin-based dismissal to race with pointer-based interactions.
    if (isPointerDown) return
    const func = defer ? raf : (v: any) => v()
    func(() => {
      const composedPath = event?.composedPath?.() ?? [event?.target]
      const target = isInShadowRoot ? composedPath[0] : getEventTarget<HTMLElement>(event)
      if (!node || !isEventOutside(event, target)) return

      if (onFocusOutside || onInteractOutside) {
        const handler = callAll(onFocusOutside, onInteractOutside) as EventListener
        node.addEventListener(FOCUS_OUTSIDE_EVENT, handler, { once: true })
      }

      fireCustomEvent(node, FOCUS_OUTSIDE_EVENT, {
        bubbles: false,
        cancelable: true,
        detail: {
          originalEvent: event,
          contextmenu: false,
          focusable: isFocusable(target),
          target,
        },
      })
    })
  }

  function trackFocusin() {
    if (isTouchDevice()) return
    cleanups.add(addDomEvent(doc, "focusin", onFocusin, true))
    cleanups.add(parentWin.addEventListener("focusin", onFocusin, true))
    cleanups.add(frames.addEventListener("focusin", onFocusin, true))
  }

  // Let focus settle after opening before treating focus moves as outside
  let cancelFocusin: VoidFunction | undefined
  if (trackOptions.deferFocus) cancelFocusin = raf(trackFocusin)
  else trackFocusin()

  return () => {
    cancelFocusin?.()
    pointerdownCleanups.forEach((fn) => fn())
    cleanups.forEach((fn) => fn())
  }
}

export function trackInteractOutside(nodeOrFn: NodeOrFn, options: InteractOutsideOptions) {
  const { defer = false } = options
  const startedAt = getNow()
  const getNode = () => (typeof nodeOrFn === "function" ? nodeOrFn() : nodeOrFn)

  const node = getNode()
  if (node || !defer) {
    return trackInteractOutsideImpl(node, options, { startedAt, deferFocus: defer }) ?? noop
  }

  // Not mounted yet: resolve on the next frame, which already defers focus
  const cleanups: (VoidFunction | undefined)[] = []
  cleanups.push(
    raf(() => {
      cleanups.push(trackInteractOutsideImpl(getNode(), options, { startedAt, deferFocus: false }))
    }),
  )
  return () => {
    cleanups.forEach((fn) => fn?.())
  }
}

function fireCustomEvent(el: HTMLElement, type: string, init?: CustomEventInit) {
  const win = el.ownerDocument.defaultView || window
  const event = new win.CustomEvent(type, init)
  return el.dispatchEvent(event)
}
