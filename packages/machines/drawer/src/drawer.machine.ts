import { ariaHidden } from "@zag-js/aria-hidden"
import { createGuards, createMachine, type Params } from "@zag-js/core"
import { trackDismissableElement } from "@zag-js/dismissable"
import { addDomEvent, getComputedStyle, getInitialFocus, raf, resizeObserverBorderBox } from "@zag-js/dom-query"
import { trapFocus } from "@zag-js/focus-trap"
import { preventBodyScroll } from "@zag-js/remove-scroll"
import * as dom from "./drawer.dom"
import { drawerRegistry } from "./drawer.registry"
import type { DrawerSchema, ResolvedSnapPoint } from "./drawer.types"
import {
  DrawerSwipeSession,
  getSwipeDirectionSize,
  hasOpeningSwipeIntent,
  resolveSwipeDirection,
  resolveSwipeProgress,
} from "./utils/drawer-session"
import { isVerticalSwipeDirection } from "./utils/session"
import { dedupeSnapPoints, resolveSnapPoint } from "./utils/snap-point"

const { and } = createGuards<DrawerSchema>()

const getActiveSnapOffset = (context: Params<DrawerSchema>["context"]) =>
  context.get("resolvedActiveSnapPoint")?.offset ?? 0

const hasRemSnapPoints = (snapPoints: Array<number | string>) =>
  snapPoints.some((snapPoint) => typeof snapPoint === "string" && snapPoint.trim().endsWith("rem"))

const DEFAULT_SNAP_POINTS = [1]

export const machine = createMachine<DrawerSchema>({
  props({ props, scope }) {
    const alertDialog = props.role === "alertdialog"
    const initialFocusEl: any = alertDialog ? () => dom.getCloseTriggerEl(scope) : undefined
    const modal = typeof props.modal === "boolean" ? props.modal : true
    const snapPoints = props.snapPoints ?? DEFAULT_SNAP_POINTS

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

  context({ bindable, prop, scope }) {
    return {
      triggerValue: bindable<string | null>(() => ({
        defaultValue: prop("defaultTriggerValue") ?? null,
        value: prop("triggerValue"),
        onChange(value) {
          const onTriggerValueChange = prop("onTriggerValueChange")
          if (!onTriggerValueChange) return
          const triggerElement = dom.getActiveTriggerEl(scope, value)
          onTriggerValueChange({ value, triggerElement })
        },
      })),
      dragOffset: bindable<number | null>(() => ({
        defaultValue: null,
      })),
      snapPoint: bindable<number | string | null>(() => ({
        defaultValue: prop("defaultSnapPoint"),
        value: prop("snapPoint"),
        onChange(snapPoint) {
          return prop("onSnapPointChange")?.({ snapPoint })
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

  refs({ prop }) {
    return {
      swipeSession: new DrawerSwipeSession({
        preventDragOnScroll: () => prop("preventDragOnScroll"),
      }),
    }
  },

  computed: {
    drawerId({ prop, scope }) {
      return String(prop("id") ?? scope.id)
    },

    physicalSwipeDirection({ prop }) {
      return resolveSwipeDirection(prop("swipeDirection"), prop("dir"))
    },

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
      [() => context.get("dragOffset"), () => context.get("contentSize"), () => getActiveSnapOffset(context)],
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
        "trackSizeMeasurements",
        "trackNestedDrawerMetrics",
        "trackDrawerStack",
      ],
      on: {
        "TRIGGER_VALUE.SET": {
          actions: ["setTriggerValue"],
        },
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
        OPEN: [
          {
            guard: "isOpenControlled",
            actions: ["setTriggerValue", "invokeOnOpen"],
          },
          {
            target: "open",
            actions: ["setTriggerValue", "invokeOnOpen"],
          },
        ],
        "TRIGGER_VALUE.SET": {
          target: "open",
          actions: ["setTriggerValue", "invokeOnOpen"],
        },
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
      effects: ["trackSwipeOpenPointerMove"],
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
      effects: ["trackSwipeOpenPointerMove", "trackSizeMeasurements"],
      on: {
        POINTER_MOVE: {
          actions: ["setSwipeOpenDragOffset"],
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
            actions: ["setTriggerValue", "invokeOnOpen"],
          },
          {
            target: "open",
            actions: ["setTriggerValue", "invokeOnOpen"],
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

      shouldStartDragging({ computed, prop, refs, event, scope }) {
        const swipeSession = refs.get("swipeSession")
        return swipeSession.canStartDrag(
          event.point,
          event.target,
          dom.getContentEl(scope),
          prop("preventDragOnScroll"),
          computed("physicalSwipeDirection"),
        )
      },

      shouldCloseOnSwipe({ prop, context, computed, refs }) {
        // In sequential mode, let findClosestSnapPoint handle dismiss decisions
        if (prop("snapToSequentialPoints")) return false
        const swipeSession = refs.get("swipeSession")
        return swipeSession.shouldDismissOnRelease(
          context.get("contentSize"),
          computed("resolvedSnapPoints"),
          getActiveSnapOffset(context),
        )
      },

      hasSwipeIntent({ refs, computed, event }) {
        const swipeSession = refs.get("swipeSession")
        const start = swipeSession.getSwipeStart()
        if (!start || !event.point) return false
        return hasOpeningSwipeIntent(start, event.point, computed("physicalSwipeDirection"))
      },

      shouldOpenOnSwipe({ context, refs, prop }) {
        const swipeSession = refs.get("swipeSession")
        return swipeSession.shouldOpenOnRelease(
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
          refs.get("swipeSession").resetDragOffset()
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

      setTriggerValue({ context, event }) {
        if (event.value === undefined) return
        context.set("triggerValue", event.value)
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
        refs.get("swipeSession").beginSwipe(event.point)
      },

      setDragOffset({ context, event, refs, computed }) {
        const swipeSession = refs.get("swipeSession")
        const physicalSwipeDirection = event.swipeDirection ?? computed("physicalSwipeDirection")
        swipeSession.setDragOffset(event.point, getActiveSnapOffset(context), physicalSwipeDirection)
        context.set("dragOffset", swipeSession.getDragOffset())
      },

      setSwipeOpenDragOffset({ context, event, refs, computed }) {
        const swipeSession = refs.get("swipeSession")
        const contentSize = context.get("contentSize")
        if (!contentSize) return
        swipeSession.setSwipeOpenOffset(event.point, contentSize, computed("physicalSwipeDirection"))
        context.set("dragOffset", swipeSession.getDragOffset())
      },

      setClosestSnapPoint({ computed, context, refs, prop, send }) {
        const snapPoints = computed("resolvedSnapPoints")
        const contentSize = context.get("contentSize")
        const viewportSize = context.get("viewportSize")
        const rootFontSize = context.get("rootFontSize")

        if (!snapPoints.length || contentSize === null) return

        const swipeSession = refs.get("swipeSession")
        const closestSnapPoint = swipeSession.resolveSnapPointOnRelease(
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
        refs.get("swipeSession").resetDragOffset()
        context.set("dragOffset", null)
      },

      clearActiveSnapPoint({ context }) {
        context.set("snapPoint", context.initial("snapPoint"))
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
        refs.get("swipeSession").clearSwipeStart()
      },

      clearVelocityTracking({ refs }) {
        refs.get("swipeSession").resetVelocity()
      },

      setSnapSwipeStrength({ context, refs, computed, prop }) {
        const swipeSession = refs.get("swipeSession")
        const snapPoints = computed("resolvedSnapPoints")
        const contentSize = context.get("contentSize")
        const closestSnapPoint = swipeSession.resolveSnapPointOnRelease(
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
        const restOffset = getActiveSnapOffset(context)
        context.set("swipeStrength", swipeSession.getSwipeStrength(resolved?.offset ?? 0, restOffset))
      },

      setDismissSwipeStrength({ context, refs }) {
        const swipeSession = refs.get("swipeSession")
        const contentSize = context.get("contentSize")
        const restOffset = getActiveSnapOffset(context)
        context.set("swipeStrength", swipeSession.getSwipeStrength(contentSize ?? 0, restOffset))
      },

      resetSwipeStrength({ context }) {
        context.set("swipeStrength", 1)
      },

      setRegistrySwiping({ computed }) {
        drawerRegistry.setSwiping(computed("drawerId"), true)
      },

      clearRegistrySwiping({ computed }) {
        drawerRegistry.setSwiping(computed("drawerId"), false)
      },

      toggleVisibility({ event, send, prop }) {
        send({ type: prop("open") ? "CONTROLLED.OPEN" : "CONTROLLED.CLOSE", previousEvent: event })
      },

      syncDrawerStack({ context, prop, computed }) {
        const contentSize = context.get("contentSize")
        if (contentSize === null) return

        const dragOffset = context.get("dragOffset")
        const snapPointOffset = getActiveSnapOffset(context)
        const progress = resolveSwipeProgress(contentSize, dragOffset, snapPointOffset)
        const id = computed("drawerId")

        // Sync to registry for nested drawer metrics
        if (dragOffset !== null) {
          drawerRegistry.setSwipeProgress(id, progress)
        }

        const stack = prop("stack")
        if (!stack) return

        stack.setHeight(id, contentSize)
        stack.setSwipe(id, dragOffset !== null, progress)
      },
    },

    effects: {
      trackDrawerStack({ context, prop, computed }) {
        const stack = prop("stack")
        if (!stack) return

        const id = computed("drawerId")
        stack.register(id)
        stack.setOpen(id, true)

        const sync = () => {
          const contentSize = context.get("contentSize")
          const dragOffset = context.get("dragOffset")
          const snapPointOffset = getActiveSnapOffset(context)
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

      trapFocus({ scope, prop, context }) {
        if (!prop("trapFocus")) return
        const contentEl = () => dom.getContentEl(scope)
        return trapFocus(contentEl, {
          preventScroll: true,
          returnFocusOnDeactivate: !!prop("restoreFocus"),
          initialFocus: prop("initialFocusEl"),
          setReturnFocus: (el) => {
            const finalFocusEl = prop("finalFocusEl")?.()
            if (finalFocusEl) return finalFocusEl

            const triggerValue = context.get("triggerValue")
            if (triggerValue) {
              const activeTriggerEl = dom.getActiveTriggerEl(scope, triggerValue)
              if (activeTriggerEl) return activeTriggerEl
            }

            const fallbackTrigger = dom.getTriggerEls(scope)[0]
            if (fallbackTrigger) return fallbackTrigger

            return el
          },
          getShadowRoot: true,
        })
      },

      hideContentBelow({ scope, prop }) {
        if (!prop("modal")) return
        const getElements = () => [dom.getContentEl(scope)]
        return ariaHidden(getElements, { defer: true })
      },

      trackPointerMove({ scope, send, refs, computed }) {
        return refs.get("swipeSession").bindDragTracking({
          getDoc: () => scope.getDoc(),
          getContentEl: () => dom.getContentEl(scope),
          getSwipeAreaEl: () => dom.getSwipeAreaEl(scope),
          swipeDirection: computed("physicalSwipeDirection"),
          onMove(details) {
            send({ type: "POINTER_MOVE", ...details })
          },
          onEnd(details) {
            send({ type: "POINTER_UP", ...details })
          },
          onCancel() {
            send({ type: "POINTER_CANCEL" })
          },
        })
      },

      trackSizeMeasurements({ context, scope, computed, prop }) {
        const contentEl = dom.getContentEl(scope)
        if (!contentEl) return

        const doc = scope.getDoc()
        const html = doc.documentElement
        const shouldMeasureRootFontSize = hasRemSnapPoints(prop("snapPoints"))

        const updateSize = () => {
          const direction = computed("physicalSwipeDirection")
          const rect = contentEl.getBoundingClientRect()
          const viewportSize = isVerticalSwipeDirection(direction) ? html.clientHeight : html.clientWidth

          context.set("contentSize", getSwipeDirectionSize(rect, direction))
          context.set("viewportSize", viewportSize)
          if (shouldMeasureRootFontSize) {
            const rootFontSize = Number.parseFloat(getComputedStyle(html).fontSize)
            if (Number.isFinite(rootFontSize)) {
              context.set("rootFontSize", rootFontSize)
            }
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

      trackNestedDrawerMetrics({ scope, computed }) {
        const contentEl = dom.getContentEl(scope)
        if (!contentEl) return

        const id = computed("drawerId")

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

          if (nestedCount > 0 && frontmostHeight > 0) contentEl.setAttribute("data-nested-drawer-open", "")
          else if (nestedCount === 0) contentEl.removeAttribute("data-nested-drawer-open")

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

      trackSwipeOpenPointerMove({ scope, send, refs, computed }) {
        return refs.get("swipeSession").bindSwipeOpenTracking({
          getDoc: () => scope.getDoc(),
          getContentEl: () => dom.getContentEl(scope),
          getSwipeAreaEl: () => dom.getSwipeAreaEl(scope),
          swipeDirection: computed("physicalSwipeDirection"),
          onMove(details) {
            send({ type: "POINTER_MOVE", ...details })
          },
          onEnd(details) {
            send({ type: "POINTER_UP", ...details })
          },
          onCancel() {
            send({ type: "POINTER_CANCEL" })
          },
        })
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
