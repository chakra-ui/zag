import { ariaHidden } from "@zag-js/aria-hidden"
import { createMachine } from "@zag-js/core"
import { trackDismissableElement } from "@zag-js/dismissable"
import { addDomEvent, getEventPoint, getEventTarget, resizeObserverBorderBox } from "@zag-js/dom-query"
import { trapFocus } from "@zag-js/focus-trap"
import { preventBodyScroll } from "@zag-js/remove-scroll"
import * as dom from "./drawer.dom"
import { drawerRegistry } from "./drawer.registry"
import type { DrawerSchema, ResolvedSnapPoint, SwipeDirection } from "./drawer.types"
import { DragManager } from "./utils/drag-manager"
import { resolveSnapPoint } from "./utils/resolve-snap-point"

const isVerticalDirection = (direction: SwipeDirection) => direction === "down" || direction === "up"

function dedupeSnapPoints(points: ResolvedSnapPoint[]) {
  if (points.length <= 1) return points

  const deduped: ResolvedSnapPoint[] = []
  const seenHeights: number[] = []

  for (let index = points.length - 1; index >= 0; index -= 1) {
    const point = points[index]
    const isDuplicate = seenHeights.some((height) => Math.abs(height - point.height) <= 1)
    if (isDuplicate) continue

    seenHeights.push(point.height)
    deduped.push(point)
  }

  deduped.reverse()
  return deduped
}

function getDirectionSize(rect: DOMRect, direction: SwipeDirection) {
  return isVerticalDirection(direction) ? rect.height : rect.width
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function resolveSwipeProgress(contentSize: number | null, dragOffset: number | null, snapPointOffset: number) {
  if (!contentSize || contentSize <= 0) return 0
  const currentOffset = dragOffset ?? snapPointOffset
  return clamp(1 - currentOffset / contentSize, 0, 1)
}

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
      swipeVelocityThreshold: 700,
      closeThreshold: 0.25,
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
        .map((snapPoint) =>
          resolveSnapPoint(snapPoint, {
            popupSize: contentSize,
            viewportSize,
            rootFontSize,
          }),
        )
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

        const resolvedActiveSnapPoint = resolveSnapPoint(snapPoint, {
          popupSize: contentSize,
          viewportSize,
          rootFontSize,
        })

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
      effects: [
        "trackDismissableElement",
        "preventScroll",
        "trapFocus",
        "hideContentBelow",
        "trackPointerMove",
        "trackSizeMeasurements",
        "trackNestedDrawerMetrics",
        "trackDrawerStack",
      ],
      on: {
        "CONTROLLED.CLOSE": {
          target: "closing",
          actions: ["resetSwipeStrength"],
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
            guard: "shouldCloseOnSwipe",
            target: "closing",
            actions: ["clearRegistrySwiping", "setDismissSwipeStrength"],
          },
          {
            guard: "isDragging",
            actions: [
              "clearRegistrySwiping",
              "setSnapSwipeStrength",
              "setClosestSnapPoint",
              "clearPointerStart",
              "clearDragOffset",
            ],
          },
          {
            actions: ["clearRegistrySwiping", "clearPointerStart", "clearDragOffset"],
          },
        ],
        CLOSE: [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnClose"],
          },
          {
            target: "closing",
            actions: ["resetSwipeStrength", "invokeOnClose"],
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
        if (!(event.target instanceof HTMLElement)) return false

        const dragManager = refs.get("dragManager")
        return dragManager.shouldStartDragging(
          event.point,
          event.target,
          dom.getContentEl(scope),
          prop("preventDragOnScroll"),
          prop("swipeDirection"),
        )
      },

      shouldCloseOnSwipe({ prop, context, computed, refs }) {
        const dragManager = refs.get("dragManager")
        return dragManager.shouldDismiss(
          context.get("contentSize"),
          computed("resolvedSnapPoints"),
          prop("swipeVelocityThreshold"),
          prop("closeThreshold"),
        )
      },
    },

    actions: {
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
        dragManager.setDragOffsetForDirection(
          event.point,
          context.get("resolvedActiveSnapPoint")?.offset || 0,
          event.swipeDirection ?? prop("swipeDirection"),
        )
        context.set("dragOffset", dragManager.getDragOffset())
      },

      setClosestSnapPoint({ computed, context, refs, prop }) {
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
        )

        context.set("snapPoint", closestSnapPoint)

        const resolved = resolveSnapPoint(closestSnapPoint, {
          popupSize: contentSize,
          viewportSize,
          rootFontSize,
        })
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
        const closestSnapPoint = dragManager.findClosestSnapPoint(
          snapPoints,
          context.get("resolvedActiveSnapPoint"),
          prop("snapToSequentialPoints"),
        )
        const contentSize = context.get("contentSize")
        const viewportSize = context.get("viewportSize")
        const rootFontSize = context.get("rootFontSize")
        const resolved = resolveSnapPoint(closestSnapPoint, {
          popupSize: contentSize ?? 0,
          viewportSize,
          rootFontSize,
        })
        context.set("swipeStrength", dragManager.computeSwipeStrength(resolved?.offset ?? 0))
      },

      setDismissSwipeStrength({ context, refs }) {
        const dragManager = refs.get("dragManager")
        const contentSize = context.get("contentSize")
        context.set("swipeStrength", dragManager.computeSwipeStrength(contentSize ?? 0))
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
          setReturnFocus: (el) => prop("finalFocusEl")?.() || el,
          getShadowRoot: true,
        })
      },

      hideContentBelow({ scope, prop }) {
        if (!prop("modal")) return
        const getElements = () => [dom.getContentEl(scope)]
        return ariaHidden(getElements, { defer: true })
      },

      trackPointerMove({ scope, send, prop }) {
        let lastAxis = 0
        const swipeDirection = prop("swipeDirection")
        const isVertical = isVerticalDirection(swipeDirection)

        function onPointerMove(event: PointerEvent) {
          const point = getEventPoint(event)
          const target = getEventTarget<Element>(event)
          send({ type: "POINTER_MOVE", point, target, swipeDirection })
        }

        function onPointerUp(event: PointerEvent) {
          if (event.pointerType === "touch") return
          const point = getEventPoint(event)
          send({ type: "POINTER_UP", point })
        }

        function onTouchStart(event: TouchEvent) {
          if (!event.touches[0]) return
          lastAxis = isVertical ? event.touches[0].clientY : event.touches[0].clientX
        }

        function onTouchMove(event: TouchEvent) {
          if (!event.touches[0]) return
          const point = getEventPoint(event)
          const target = event.target as HTMLElement

          if (!prop("preventDragOnScroll")) {
            send({ type: "POINTER_MOVE", point, target, swipeDirection })
            return
          }

          const contentEl = dom.getContentEl(scope)
          if (!contentEl) return

          let el: HTMLElement | null = target
          while (
            el &&
            el !== contentEl &&
            (isVertical ? el.scrollHeight <= el.clientHeight : el.scrollWidth <= el.clientWidth)
          ) {
            el = el.parentElement
          }

          if (el && el !== contentEl) {
            const scrollPos = isVertical ? el.scrollTop : el.scrollLeft
            const axis = isVertical ? event.touches[0].clientY : event.touches[0].clientX

            const atStart = scrollPos <= 0
            const movingTowardStart = axis > lastAxis
            if (atStart && movingTowardStart) {
              event.preventDefault()
            }

            lastAxis = axis
          }

          send({ type: "POINTER_MOVE", point, target, swipeDirection })
        }

        function onTouchEnd(event: TouchEvent) {
          if (event.touches.length !== 0) return
          const point = getEventPoint(event)
          send({ type: "POINTER_UP", point })
        }

        const doc = scope.getDoc()

        const cleanups = [
          addDomEvent(doc, "pointermove", onPointerMove),
          addDomEvent(doc, "pointerup", onPointerUp),
          addDomEvent(doc, "touchstart", onTouchStart, { passive: false }),
          addDomEvent(doc, "touchmove", onTouchMove, { passive: false }),
          addDomEvent(doc, "touchend", onTouchEnd),
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
          const direction = prop("swipeDirection")
          const rect = contentEl.getBoundingClientRect()
          const viewportSize = isVerticalDirection(direction) ? html.clientHeight : html.clientWidth
          const rootFontSize = Number.parseFloat(getComputedStyle(html).fontSize)

          context.set("contentSize", getDirectionSize(rect, direction))
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
