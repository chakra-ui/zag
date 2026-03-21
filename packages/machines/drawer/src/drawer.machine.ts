import { ariaHidden } from "@zag-js/aria-hidden"
import { createGuards, createMachine } from "@zag-js/core"
import { trackDismissableElement } from "@zag-js/dismissable"
import {
  addDomEvent,
  getComputedStyle,
  getEventPoint,
  getEventTarget,
  getInitialFocus,
  isHTMLElement,
  raf,
  resizeObserverBorderBox,
} from "@zag-js/dom-query"
import { trapFocus } from "@zag-js/focus-trap"
import { preventBodyScroll } from "@zag-js/remove-scroll"
import * as dom from "./drawer.dom"
import { drawerRegistry } from "./drawer.registry"
import type { DrawerSchema, ResolvedSnapPoint } from "./drawer.types"
import { DragManager } from "./utils/drag-manager"
import {
  findClosestScrollableAncestorOnSwipeAxis,
  shouldPreventTouchDefaultForDrawerPull,
} from "./utils/get-scroll-info"
import { isDragExemptElement } from "./utils/is-drag-exempt-target"
import { dedupeSnapPoints, resolveSnapPoint } from "./utils/snap-point"
import {
  getSwipeDirectionSize,
  hasOpeningSwipeIntent,
  isVerticalSwipeDirection,
  resolveSwipeDirection,
  resolveSwipeProgress,
} from "./utils/swipe"

const { and } = createGuards<DrawerSchema>()

export const machine = createMachine<DrawerSchema>({
  props({ props, scope }) {
    const alertDialog = props.role === "alertdialog"
    const initialFocusEl: any = alertDialog ? () => dom.getCloseTriggerEl(scope) : undefined
    const modal = typeof props.modal === "boolean" ? props.modal : true
    const snapPoints = props.snapPoints ?? [1]

    return {
      modal,
      trapFocus: modal,
      preventScroll: modal,
      closeOnInteractOutside: true,
      closeOnEscape: true,
      restoreFocus: true,
      role: "dialog",
      initialFocusEl,
      snapPoints,
      defaultSnapPoint: props.defaultSnapPoint ?? snapPoints[0] ?? null,
      swipeDirection: "down",
      snapToSequentialPoints: false,
      swipeVelocityThreshold: 500,
      closeThreshold: 0.5,
      preventDragOnScroll: true,
      ...props,
    }
  },

  context({ bindable, prop }) {
    return {
      dragOffset: bindable<number | null>(() => ({
        defaultValue: null,
      })),
      snapPoint: bindable<number | string | null>(() => ({
        defaultValue: prop("defaultSnapPoint"),
        value: prop("snapPoint"),
        onChange(value) {
          return prop("onSnapPointChange")?.({ snapPoint: value })
        },
      })),
      resolvedActiveSnapPoint: bindable<ResolvedSnapPoint | null>(() => ({
        defaultValue: null,
      })),
      contentSize: bindable<number | null>(() => ({
        defaultValue: null,
      })),
      viewportSize: bindable<number>(() => ({
        defaultValue: 0,
      })),
      rootFontSize: bindable<number>(() => ({
        defaultValue: 16,
      })),
      swipeStrength: bindable<number>(() => ({
        defaultValue: 1,
      })),
      rendered: bindable<{ title: boolean; description: boolean }>(() => ({
        defaultValue: { title: true, description: true },
      })),
    }
  },

  refs() {
    return {
      dragManager: new DragManager(),
    }
  },

  computed: {
    resolvedSnapPoints({ context, prop }) {
      const contentSize = context.get("contentSize")
      const viewportSize = context.get("viewportSize")
      const rootFontSize = context.get("rootFontSize")

      if (contentSize === null) return []

      const points = prop("snapPoints")
        .map((snapPoint) => resolveSnapPoint(snapPoint, { contentSize, viewportSize, rootFontSize }))
        .filter((point): point is ResolvedSnapPoint => point !== null)

      return dedupeSnapPoints(points)
    },
  },

  watch({ track, context, prop, action, computed }) {
    track(
      [
        () => context.get("snapPoint"),
        () => context.get("contentSize"),
        () => context.get("viewportSize"),
        () => context.get("rootFontSize"),
        () => prop("snapPoints").join("|"),
      ],
      () => {
        const snapPoint = context.get("snapPoint")
        const contentSize = context.get("contentSize")
        const viewportSize = context.get("viewportSize")
        const rootFontSize = context.get("rootFontSize")

        if (snapPoint === null || contentSize === null) {
          context.set("resolvedActiveSnapPoint", null)
          return
        }

        const resolvedPoints = computed("resolvedSnapPoints")
        const matchedPoint = resolvedPoints.find((point) => Object.is(point.value, snapPoint))
        if (matchedPoint) {
          context.set("resolvedActiveSnapPoint", matchedPoint)
          return
        }

        const resolvedActiveSnapPoint = resolveSnapPoint(snapPoint, { contentSize, viewportSize, rootFontSize })

        if (resolvedActiveSnapPoint) {
          context.set("resolvedActiveSnapPoint", resolvedActiveSnapPoint)
          return
        }

        const fallbackPoint = resolvedPoints[0]
        if (!fallbackPoint) {
          context.set("resolvedActiveSnapPoint", null)
          return
        }

        context.set("snapPoint", fallbackPoint.value)
        context.set("resolvedActiveSnapPoint", fallbackPoint)
      },
    )

    track([() => prop("open")], () => {
      action(["toggleVisibility"])
    })

    track(
      [
        () => context.get("dragOffset"),
        () => context.get("contentSize"),
        () => context.get("resolvedActiveSnapPoint")?.offset ?? 0,
      ],
      () => {
        action(["syncDrawerStack"])
      },
    )
  },

  initialState({ prop }) {
    const open = prop("open") || prop("defaultOpen")
    return open ? "open" : "closed"
  },

  on: {
    "SNAP_POINT.SET": {
      actions: ["setSnapPoint"],
    },
  },

  states: {
    open: {
      tags: ["open"],
      entry: ["checkRenderedElements", "setInitialFocus", "deferClearDragOffset"],
      effects: [
        "trackDismissableElement",
        "preventScroll",
        "trapFocus",
        "hideContentBelow",
        "trackPointerMove",
        "trackGestureInterruption",
        "trackSizeMeasurements",
        "trackNestedDrawerMetrics",
        "trackDrawerStack",
      ],
      on: {
        "CONTROLLED.CLOSE": {
          target: "closing",
          actions: ["clearSwipeOpenAnimation", "resetSwipeStrength"],
        },
        POINTER_DOWN: {
          actions: ["setPointerStart"],
        },
        POINTER_MOVE: [
          {
            guard: "isDragging",
            actions: ["setDragOffset"],
          },
          {
            guard: "shouldStartDragging",
            actions: ["setRegistrySwiping", "setDragOffset"],
          },
        ],
        POINTER_UP: [
          {
            guard: and("shouldCloseOnSwipe", "isOpenControlled"),
            actions: [
              "clearSwipeOpenAnimation",
              "clearRegistrySwiping",
              "clearPointerStart",
              "clearDragOffset",
              "invokeOnClose",
            ],
          },
          {
            guard: "shouldCloseOnSwipe",
            target: "closing",
            actions: ["clearSwipeOpenAnimation", "clearRegistrySwiping", "setDismissSwipeStrength"],
          },
          {
            guard: "isDragging",
            actions: [
              "clearRegistrySwiping",
              "suppressBackdropAnimation",
              "setSnapSwipeStrength",
              "setClosestSnapPoint",
              "clearPointerStart",
              "clearDragOffset",
              "clearVelocityTracking",
            ],
          },
          {
            actions: ["clearRegistrySwiping", "clearPointerStart", "clearDragOffset", "clearVelocityTracking"],
          },
        ],
        POINTER_CANCEL: [
          {
            guard: "isDragging",
            actions: ["clearRegistrySwiping", "clearPointerStart", "clearDragOffset", "clearVelocityTracking"],
          },
          {
            actions: ["clearRegistrySwiping", "clearPointerStart", "clearVelocityTracking"],
          },
        ],
        CLOSE: [
          {
            guard: "isOpenControlled",
            actions: ["clearSwipeOpenAnimation", "invokeOnClose"],
          },
          {
            target: "closing",
            actions: ["clearSwipeOpenAnimation", "resetSwipeStrength", "invokeOnClose"],
          },
        ],
      },
    },

    closing: {
      effects: ["trackExitAnimation", "trackDrawerStack"],
      on: {
        ANIMATION_END: {
          target: "closed",
          actions: [
            "invokeOnClose",
            "clearPointerStart",
            "clearDragOffset",
            "clearActiveSnapPoint",
            "clearResolvedActiveSnapPoint",
            "clearSizeMeasurements",
            "clearVelocityTracking",
          ],
        },
      },
    },

    "swipe-area-dragging": {
      tags: ["closed"],
      effects: ["trackSwipeOpenPointerMove", "trackGestureInterruption"],
      on: {
        POINTER_MOVE: {
          guard: "hasSwipeIntent",
          target: "swiping-open",
        },
        POINTER_UP: {
          target: "closed",
          actions: ["clearPointerStart", "clearVelocityTracking"],
        },
        POINTER_CANCEL: {
          target: "closed",
          actions: ["clearPointerStart", "clearVelocityTracking"],
        },
      },
    },

    "swiping-open": {
      tags: ["open"],
      effects: ["trackSwipeOpenPointerMove", "trackSizeMeasurements", "trackGestureInterruption"],
      on: {
        POINTER_MOVE: {
          actions: ["setSwipeOpenOffset"],
        },
        POINTER_UP: [
          {
            guard: and("shouldOpenOnSwipe", "isOpenControlled"),
            actions: ["clearPointerStart", "invokeOnOpen"],
          },
          {
            guard: "shouldOpenOnSwipe",
            target: "open",
            actions: ["clearPointerStart", "invokeOnOpen"],
          },
          {
            target: "closed",
            actions: ["clearPointerStart", "clearDragOffset", "clearSizeMeasurements"],
          },
        ],
        POINTER_CANCEL: {
          target: "closed",
          actions: ["clearPointerStart", "clearDragOffset", "clearSizeMeasurements", "clearVelocityTracking"],
        },
        "CONTROLLED.OPEN": {
          target: "open",
        },
        CLOSE: {
          target: "closed",
          actions: ["clearPointerStart", "clearDragOffset", "clearSizeMeasurements"],
        },
      },
    },

    closed: {
      tags: ["closed"],
      on: {
        "CONTROLLED.OPEN": {
          target: "open",
        },
        OPEN: [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnOpen"],
          },
          {
            target: "open",
            actions: ["invokeOnOpen"],
          },
        ],
        "SWIPE_AREA.START": {
          target: "swipe-area-dragging",
          actions: ["setPointerStart"],
        },
      },
    },
  },

  implementations: {
    guards: {
      isOpenControlled: ({ prop }) => prop("open") !== undefined,

      isDragging({ context }) {
        return context.get("dragOffset") !== null
      },

      shouldStartDragging({ prop, refs, event, scope }) {
        if (!isHTMLElement(event.target)) return false
        if (isDragExemptElement(event.target)) return false

        const dragManager = refs.get("dragManager")
        return dragManager.shouldStartDragging(
          event.point,
          event.target,
          dom.getContentEl(scope),
          prop("preventDragOnScroll"),
          resolveSwipeDirection(prop("swipeDirection"), prop("dir")),
        )
      },

      shouldCloseOnSwipe({ prop, context, computed, refs }) {
        // In sequential mode, let findClosestSnapPoint handle dismiss decisions
        if (prop("snapToSequentialPoints")) return false
        const dragManager = refs.get("dragManager")
        return dragManager.shouldDismiss(
          context.get("contentSize"),
          computed("resolvedSnapPoints"),
          context.get("resolvedActiveSnapPoint")?.offset ?? 0,
        )
      },

      hasSwipeIntent({ refs, prop, event }) {
        const dragManager = refs.get("dragManager")
        const start = dragManager.getPointerStart()
        if (!start || !event.point) return false
        return hasOpeningSwipeIntent(start, event.point, resolveSwipeDirection(prop("swipeDirection"), prop("dir")))
      },

      shouldOpenOnSwipe({ context, refs, prop }) {
        const dragManager = refs.get("dragManager")
        return dragManager.shouldOpen(
          context.get("contentSize"),
          prop("swipeVelocityThreshold"),
          prop("closeThreshold"),
        )
      },
    },

    actions: {
      setInitialFocus({ prop, scope }) {
        // In modal mode, trapFocus handles initial focus
        if (prop("trapFocus")) return
        raf(() => {
          const element = getInitialFocus({
            root: dom.getContentEl(scope),
            getInitialEl: prop("initialFocusEl"),
          })
          element?.focus({ preventScroll: true })
        })
      },

      checkRenderedElements({ context, scope }) {
        raf(() => {
          context.set("rendered", {
            title: !!dom.getTitleEl(scope),
            description: !!dom.getDescriptionEl(scope),
          })
        })
      },

      deferClearDragOffset({ context, refs, scope }) {
        const dragOffset = context.get("dragOffset")
        if (dragOffset === null) return

        const contentEl = dom.getContentEl(scope)
        const backdropEl = dom.getBackdropEl(scope)

        // Suppress CSS entry animations so they don't replay from initial state.
        // The CSS transition will smoothly animate from release position to fully open.
        if (contentEl) contentEl.style.setProperty("animation", "none", "important")
        if (backdropEl) backdropEl.style.setProperty("animation", "none", "important")

        raf(() => {
          refs.get("dragManager").clearDragOffset()
          context.set("dragOffset", null)
        })
      },

      suppressBackdropAnimation({ scope }) {
        const backdropEl = dom.getBackdropEl(scope)
        if (!backdropEl) return
        // Keep override until drawer closes (clearSwipeOpenAnimation handles cleanup)
        backdropEl.style.setProperty("animation", "none", "important")
      },

      clearSwipeOpenAnimation({ scope }) {
        const contentEl = dom.getContentEl(scope)
        const backdropEl = dom.getBackdropEl(scope)
        if (contentEl) contentEl.style.removeProperty("animation")
        if (backdropEl) backdropEl.style.removeProperty("animation")
      },

      invokeOnOpen({ prop }) {
        prop("onOpenChange")?.({ open: true })
      },

      invokeOnClose({ prop }) {
        prop("onOpenChange")?.({ open: false })
      },

      setSnapPoint({ context, event }) {
        context.set("snapPoint", event.snapPoint)
      },

      setPointerStart({ event, refs }) {
        refs.get("dragManager").setPointerStart(event.point)
      },

      setDragOffset({ context, event, refs, prop }) {
        const dragManager = refs.get("dragManager")
        const physicalDir = event.swipeDirection ?? resolveSwipeDirection(prop("swipeDirection"), prop("dir"))
        dragManager.setDragOffsetForDirection(
          event.point,
          context.get("resolvedActiveSnapPoint")?.offset || 0,
          physicalDir,
        )
        context.set("dragOffset", dragManager.getDragOffset())
      },

      setSwipeOpenOffset({ context, event, refs, prop }) {
        const dragManager = refs.get("dragManager")
        const contentSize = context.get("contentSize")
        if (!contentSize) return
        dragManager.setSwipeOpenOffset(
          event.point,
          contentSize,
          resolveSwipeDirection(prop("swipeDirection"), prop("dir")),
        )
        context.set("dragOffset", dragManager.getDragOffset())
      },

      setClosestSnapPoint({ computed, context, refs, prop, send }) {
        const snapPoints = computed("resolvedSnapPoints")
        const contentSize = context.get("contentSize")
        const viewportSize = context.get("viewportSize")
        const rootFontSize = context.get("rootFontSize")

        if (!snapPoints.length || contentSize === null) return

        const dragManager = refs.get("dragManager")
        const closestSnapPoint = dragManager.findClosestSnapPoint(
          snapPoints,
          context.get("resolvedActiveSnapPoint"),
          prop("snapToSequentialPoints"),
          contentSize,
        )

        // null means dismiss (sequential mode determined closing is closer)
        if (closestSnapPoint === null) {
          send({ type: "CLOSE" })
          return
        }

        context.set("snapPoint", closestSnapPoint)

        const resolved = resolveSnapPoint(closestSnapPoint, { contentSize, viewportSize, rootFontSize })
        context.set("resolvedActiveSnapPoint", resolved)
      },

      clearDragOffset({ context, refs }) {
        refs.get("dragManager").clearDragOffset()
        context.set("dragOffset", null)
      },

      clearActiveSnapPoint({ context, prop }) {
        context.set("snapPoint", prop("defaultSnapPoint") ?? null)
      },

      clearSizeMeasurements({ context }) {
        context.set("contentSize", null)
        context.set("viewportSize", 0)
        context.set("rootFontSize", 16)
      },

      clearResolvedActiveSnapPoint({ context }) {
        context.set("resolvedActiveSnapPoint", null)
      },

      clearPointerStart({ refs }) {
        refs.get("dragManager").clearPointerStart()
      },

      clearVelocityTracking({ refs }) {
        refs.get("dragManager").clearVelocityTracking()
      },

      setSnapSwipeStrength({ context, refs, computed, prop }) {
        const dragManager = refs.get("dragManager")
        const snapPoints = computed("resolvedSnapPoints")
        const contentSize = context.get("contentSize")
        const closestSnapPoint = dragManager.findClosestSnapPoint(
          snapPoints,
          context.get("resolvedActiveSnapPoint"),
          prop("snapToSequentialPoints"),
          contentSize ?? 0,
        )
        if (closestSnapPoint === null) return
        const viewportSize = context.get("viewportSize")
        const rootFontSize = context.get("rootFontSize")
        const resolved = resolveSnapPoint(closestSnapPoint, {
          contentSize: contentSize ?? 0,
          viewportSize,
          rootFontSize,
        })
        const restOffset = context.get("resolvedActiveSnapPoint")?.offset ?? 0
        context.set("swipeStrength", dragManager.computeSwipeStrength(resolved?.offset ?? 0, restOffset))
      },

      setDismissSwipeStrength({ context, refs }) {
        const dragManager = refs.get("dragManager")
        const contentSize = context.get("contentSize")
        const restOffset = context.get("resolvedActiveSnapPoint")?.offset ?? 0
        context.set("swipeStrength", dragManager.computeSwipeStrength(contentSize ?? 0, restOffset))
      },

      resetSwipeStrength({ context }) {
        context.set("swipeStrength", 1)
      },

      setRegistrySwiping({ scope, prop }) {
        const id = String(prop("id") ?? scope.id)
        drawerRegistry.setSwiping(id, true)
      },

      clearRegistrySwiping({ scope, prop }) {
        const id = String(prop("id") ?? scope.id)
        drawerRegistry.setSwiping(id, false)
      },

      toggleVisibility({ event, send, prop }) {
        send({ type: prop("open") ? "CONTROLLED.OPEN" : "CONTROLLED.CLOSE", previousEvent: event })
      },

      syncDrawerStack({ context, prop, scope }) {
        const stack = prop("stack")
        if (!stack) return

        const contentSize = context.get("contentSize")
        if (contentSize === null) return

        const id = String(prop("id") ?? scope.id)
        const dragOffset = context.get("dragOffset")
        const snapPointOffset = context.get("resolvedActiveSnapPoint")?.offset ?? 0

        stack.setHeight(id, contentSize)
        stack.setSwipe(id, dragOffset !== null, resolveSwipeProgress(contentSize, dragOffset, snapPointOffset))
      },
    },

    effects: {
      trackDrawerStack({ context, scope, prop }) {
        const stack = prop("stack")
        if (!stack) return

        const id = String(prop("id") ?? scope.id)
        stack.register(id)
        stack.setOpen(id, true)

        const sync = () => {
          const contentSize = context.get("contentSize")
          const dragOffset = context.get("dragOffset")
          const snapPointOffset = context.get("resolvedActiveSnapPoint")?.offset ?? 0
          stack.setHeight(id, contentSize ?? 0)
          stack.setSwipe(id, dragOffset !== null, resolveSwipeProgress(contentSize, dragOffset, snapPointOffset))
        }

        sync()

        return () => {
          stack.setSwipe(id, false, 0)
          stack.setOpen(id, false)
          stack.unregister(id)
        }
      },

      trackDismissableElement({ scope, prop, send }) {
        const getContentEl = () => dom.getContentEl(scope)
        return trackDismissableElement(getContentEl, {
          type: "drawer",
          defer: true,
          pointerBlocking: prop("modal"),
          exclude: [dom.getTriggerEl(scope)],
          onInteractOutside(event) {
            prop("onInteractOutside")?.(event)
            if (!prop("closeOnInteractOutside")) {
              event.preventDefault()
            }
          },
          onFocusOutside: prop("onFocusOutside"),
          onEscapeKeyDown(event) {
            prop("onEscapeKeyDown")?.(event)
            if (!prop("closeOnEscape")) {
              event.preventDefault()
            }
          },
          onPointerDownOutside: prop("onPointerDownOutside"),
          onRequestDismiss: prop("onRequestDismiss"),
          onDismiss() {
            send({ type: "CLOSE", src: "interact-outside" })
          },
        })
      },

      preventScroll({ scope, prop }) {
        if (!prop("preventScroll")) return
        return preventBodyScroll(scope.getDoc())
      },

      trapFocus({ scope, prop }) {
        if (!prop("trapFocus")) return
        const contentEl = () => dom.getContentEl(scope)
        return trapFocus(contentEl, {
          preventScroll: true,
          returnFocusOnDeactivate: !!prop("restoreFocus"),
          initialFocus: prop("initialFocusEl"),
          setReturnFocus: (el) => prop("finalFocusEl")?.() ?? dom.getTriggerEl(scope) ?? el,
          getShadowRoot: true,
        })
      },

      hideContentBelow({ scope, prop }) {
        if (!prop("modal")) return
        const getElements = () => [dom.getContentEl(scope)]
        return ariaHidden(getElements, { defer: true })
      },

      trackGestureInterruption({ scope, send }) {
        const doc = scope.getDoc()

        function onVisibilityChange() {
          if (doc.visibilityState === "hidden") {
            send({ type: "POINTER_CANCEL" })
          }
        }

        function onLostPointerCapture(event: PointerEvent) {
          const target = getEventTarget<Element>(event)
          if (!dom.isPointerWithinContentOrSwipeArea(target, dom.getContentEl(scope), dom.getSwipeAreaEl(scope))) return
          send({ type: "POINTER_CANCEL" })
        }

        const cleanups = [
          addDomEvent(doc, "visibilitychange", onVisibilityChange),
          addDomEvent(doc, "lostpointercapture", onLostPointerCapture, true),
        ]

        return () => {
          cleanups.forEach((cleanup) => cleanup())
        }
      },

      trackPointerMove({ scope, send, prop }) {
        let lastAxis = 0
        const swipeDirection = resolveSwipeDirection(prop("swipeDirection"), prop("dir"))
        const isVertical = isVerticalSwipeDirection(swipeDirection)

        function onPointerMove(event: PointerEvent) {
          // Touch is handled by touchmove/touchend only. Feeding both pointer and touch
          // events duplicates POINTER_MOVE on many browsers and skews velocity / snap.
          if (event.pointerType === "touch") return
          const point = getEventPoint(event)
          const target = getEventTarget<Element>(event)
          send({ type: "POINTER_MOVE", point, target, swipeDirection })
        }

        function onPointerUp(event: PointerEvent) {
          if (event.pointerType === "touch") return
          const point = getEventPoint(event)
          send({ type: "POINTER_UP", point })
        }

        function onPointerCancel(event: PointerEvent) {
          if (event.pointerType === "touch") return
          send({ type: "POINTER_CANCEL" })
        }

        function onTouchStart(event: TouchEvent) {
          if (!event.touches[0]) return
          lastAxis = isVertical ? event.touches[0].clientY : event.touches[0].clientX
        }

        function onTouchMove(event: TouchEvent) {
          if (!event.touches[0]) return
          const point = getEventPoint(event)
          // Match pointer path: composedPath[0] behaves correctly with shadow DOM / retargeting.
          const target = getEventTarget<HTMLElement>(event) ?? (event.target as HTMLElement)

          if (!prop("preventDragOnScroll")) {
            send({ type: "POINTER_MOVE", point, target, swipeDirection })
            return
          }

          const contentEl = dom.getContentEl(scope)
          // Never drop touch moves when content isn't resolved yet — pointermove has no such gate,
          // and missing moves on mobile breaks drag + sequential snap release.
          if (contentEl && !isDragExemptElement(target)) {
            const scrollParent = findClosestScrollableAncestorOnSwipeAxis(target, contentEl, swipeDirection)
            if (scrollParent) {
              const axis = isVertical ? event.touches[0].clientY : event.touches[0].clientX
              if (
                shouldPreventTouchDefaultForDrawerPull({
                  scrollParent,
                  swipeDirection,
                  lastMainAxis: lastAxis,
                  currentMainAxis: axis,
                }) &&
                event.cancelable
              ) {
                event.preventDefault()
              }
              lastAxis = axis
            } else {
              lastAxis = isVertical ? event.touches[0].clientY : event.touches[0].clientX
            }
          }

          send({ type: "POINTER_MOVE", point, target, swipeDirection })
        }

        function onTouchEnd(event: TouchEvent) {
          if (event.touches.length !== 0) return
          const point = getEventPoint(event)
          send({ type: "POINTER_UP", point })
        }

        function onTouchCancel() {
          send({ type: "POINTER_CANCEL" })
        }

        const doc = scope.getDoc()

        const cleanups = [
          addDomEvent(doc, "pointermove", onPointerMove),
          addDomEvent(doc, "pointerup", onPointerUp),
          addDomEvent(doc, "pointercancel", onPointerCancel),
          addDomEvent(doc, "touchstart", onTouchStart, { capture: true, passive: false }),
          addDomEvent(doc, "touchmove", onTouchMove, { capture: true, passive: false }),
          addDomEvent(doc, "touchend", onTouchEnd, { capture: true }),
          addDomEvent(doc, "touchcancel", onTouchCancel, { capture: true }),
        ]

        return () => {
          cleanups.forEach((cleanup) => cleanup())
        }
      },

      trackSizeMeasurements({ context, scope, prop }) {
        const contentEl = dom.getContentEl(scope)
        if (!contentEl) return

        const doc = scope.getDoc()
        const html = doc.documentElement

        const updateSize = () => {
          const direction = resolveSwipeDirection(prop("swipeDirection"), prop("dir"))
          const rect = contentEl.getBoundingClientRect()
          const viewportSize = isVerticalSwipeDirection(direction) ? html.clientHeight : html.clientWidth
          const rootFontSize = Number.parseFloat(getComputedStyle(html).fontSize)

          context.set("contentSize", getSwipeDirectionSize(rect, direction))
          context.set("viewportSize", viewportSize)
          if (Number.isFinite(rootFontSize)) {
            context.set("rootFontSize", rootFontSize)
          }
        }

        updateSize()

        const cleanups = [
          resizeObserverBorderBox.observe(contentEl, updateSize),
          addDomEvent(scope.getWin(), "resize", updateSize),
        ]

        return () => {
          cleanups.forEach((cleanup) => cleanup?.())
        }
      },

      trackNestedDrawerMetrics({ scope, prop }) {
        const contentEl = dom.getContentEl(scope)
        if (!contentEl) return

        const id = String(prop("id") ?? scope.id)

        drawerRegistry.register(id, contentEl)

        const sync = () => {
          const entries = [...drawerRegistry.getEntries().entries()]
          const myIndex = entries.findIndex(([entryId]) => entryId === id)
          if (myIndex === -1) return

          const nestedCount = entries.length - 1 - myIndex
          const frontmostEl = entries[entries.length - 1]?.[1]
          const frontmostHeight = frontmostEl?.getBoundingClientRect().height ?? 0
          const myHeight = contentEl.getBoundingClientRect().height

          contentEl.style.setProperty("--nested-drawers", `${nestedCount}`)
          contentEl.style.setProperty("--drawer-height", `${myHeight}px`)
          contentEl.style.setProperty("--drawer-frontmost-height", `${frontmostHeight}px`)

          if (nestedCount > 0) contentEl.setAttribute("data-nested-drawer-open", "")
          else contentEl.removeAttribute("data-nested-drawer-open")

          if (drawerRegistry.hasSwipingAfter(id)) contentEl.setAttribute("data-nested-drawer-swiping", "")
          else contentEl.removeAttribute("data-nested-drawer-swiping")
        }

        sync()

        const cleanups = [
          drawerRegistry.subscribe(sync),
          resizeObserverBorderBox.observe(contentEl, () => drawerRegistry.notify()),
          addDomEvent(scope.getWin(), "resize", () => drawerRegistry.notify()),
        ]

        return () => {
          cleanups.forEach((cleanup) => cleanup?.())
          contentEl.removeAttribute("data-nested-drawer-open")
          contentEl.removeAttribute("data-nested-drawer-swiping")
          contentEl.style.setProperty("--nested-drawers", "0")
          contentEl.style.removeProperty("--drawer-frontmost-height")
          drawerRegistry.unregister(id)
        }
      },

      trackSwipeOpenPointerMove({ scope, send }) {
        const doc = scope.getDoc()

        function onPointerMove(event: PointerEvent) {
          if (event.pointerType === "touch") return
          send({ type: "POINTER_MOVE", point: getEventPoint(event) })
        }

        function onPointerUp(event: PointerEvent) {
          if (event.pointerType === "touch") return
          send({ type: "POINTER_UP", point: getEventPoint(event) })
        }

        function onPointerCancelSwipeOpen(event: PointerEvent) {
          if (event.pointerType === "touch") return
          send({ type: "POINTER_CANCEL" })
        }

        function onTouchMove(event: TouchEvent) {
          if (!event.touches[0]) return
          send({ type: "POINTER_MOVE", point: getEventPoint(event) })
        }

        function onTouchEnd(event: TouchEvent) {
          if (event.touches.length !== 0) return
          send({ type: "POINTER_UP", point: getEventPoint(event) })
        }

        function onTouchCancelSwipeOpen() {
          send({ type: "POINTER_CANCEL" })
        }

        const cleanups = [
          addDomEvent(doc, "pointermove", onPointerMove),
          addDomEvent(doc, "pointerup", onPointerUp),
          addDomEvent(doc, "pointercancel", onPointerCancelSwipeOpen),
          addDomEvent(doc, "touchmove", onTouchMove, { passive: false }),
          addDomEvent(doc, "touchend", onTouchEnd),
          addDomEvent(doc, "touchcancel", onTouchCancelSwipeOpen, { capture: true }),
        ]

        return () => {
          cleanups.forEach((cleanup) => cleanup())
        }
      },

      trackExitAnimation({ send, scope }) {
        const contentEl = dom.getContentEl(scope)
        if (!contentEl) return
        return addDomEvent(contentEl, "exitcomplete", () => {
          send({ type: "ANIMATION_END" })
        })
      },
    },
  },
})
