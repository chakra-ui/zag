import { ariaHidden } from "@zag-js/aria-hidden"
import { createGuards, createMachine, type Params } from "@zag-js/core"
import { getDismissReason, trackDismissableElement, type LayerSnapshot } from "@zag-js/dismissable"
import {
  AnimationFrame,
  addDomEvent,
  getComputedStyle,
  getInitialFocus,
  isFocusOutside,
  raf,
  resizeObserverBorderBox,
  whenNode,
} from "@zag-js/dom-query"
import {
  getSwipeDisplacement,
  isDismissSwipe,
  oppositeDirection,
  releaseStrength,
  resistPast,
  resolveSwipeDirection,
  settleSwipe,
  trackSwipe,
} from "@zag-js/dom-query/swipe"
import { trapFocus } from "@zag-js/focus-trap"
import { preventBodyScroll } from "@zag-js/remove-scroll"
import { isEqual } from "@zag-js/utils/object"
import * as dom from "./drawer.dom"
import { drawerRegistry } from "./drawer.registry"
import type { DrawerSchema, NestedDrawerMetrics, OpenChangeReason, ResolvedSnapPoint } from "./drawer.types"
import { dedupeSnapPoints, resolveSnapPoint } from "./utils/snap-point"

const { and } = createGuards<DrawerSchema>()

const getActiveSnapOffset = (context: Params<DrawerSchema>["context"]) =>
  context.get("resolvedActiveSnapPoint")?.offset ?? 0

const hasRemSnapPoints = (snapPoints: Array<number | string>) =>
  snapPoints.some((snapPoint) => typeof snapPoint === "string" && snapPoint.trim().endsWith("rem"))

const DEFAULT_SNAP_POINTS = [1]

const DEFERRED_DRAG_DISTANCE = 6
const OPEN_INTENT_DISTANCE = 5

const isVertical = (direction: string) => direction === "up" || direction === "down"

const getSwipeProgress = (contentSize: number | null, offset: number) =>
  contentSize && contentSize > 0 ? Math.min(Math.max(offset / contentSize, 0), 1) : 0

/** Where a released drag rests: the index of a snap point, or `null` to close */
function settleRelease({ context, computed, prop }: Params<DrawerSchema>, velocity: number) {
  const dragOffset = context.get("dragOffset")
  const contentSize = context.get("contentSize")
  if (dragOffset === null || contentSize === null) return undefined
  return settleSwipe({
    position: dragOffset,
    velocity,
    points: computed("resolvedSnapPoints").map((point) => point.offset),
    current: context.get("resolvedActiveSnapPoint")?.offset,
    dismissAt: contentSize,
    sequential: prop("snapToSequentialPoints"),
  })
}

export const machine = createMachine<DrawerSchema>({
  props({ props, scope }) {
    const alertDialog = props.role === "alertdialog"
    const initialFocusEl = alertDialog ? () => dom.getCloseTriggerEl(scope) : undefined
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
      layer: bindable<LayerSnapshot | null>(() => ({
        defaultValue: null,
      })),
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
      nestedMetrics: bindable<NestedDrawerMetrics>(() => ({
        defaultValue: { count: 0, height: 0, frontmostHeight: 0, open: false, swiping: false },
        isEqual,
      })),
    }
  },

  refs() {
    return {
      swipeStart: null,
      snapBackFrame: AnimationFrame.create(),
      returnFocusFrame: AnimationFrame.create(),
      initialFocusFrame: AnimationFrame.create(),
      renderedFrame: AnimationFrame.create(),
      dragOffsetFrame: AnimationFrame.create(),
      returnFocusEl: null,
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

  exit: ["cancelFrames"],

  on: {
    "SNAP_POINT.SET": {
      actions: ["resetSwipeStrength", "setSnapPoint"],
    },
  },

  states: {
    open: {
      tags: ["open"],
      initial: "idle",
      entry: ["checkRenderedElements", "setReturnFocusEl", "setInitialFocus", "deferClearDragOffset"],
      exit: ["cancelInitialFocus"],
      effects: [
        "trackDismissableElement",
        "preventScroll",
        "trapFocus",
        "hideContentBelow",
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
          actions: ["clearSwipeOpenAnimation", "cancelSnapBack", "setFinalFocus"],
        },
        SNAP_BACK: {
          guard: "isDragging",
          actions: ["deferClearDragOffset", "resetSwipeStrength"],
        },
        CLOSE: [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnClose"],
          },
          {
            target: "closing",
            actions: ["clearSwipeOpenAnimation", "resetSwipeStrength", "invokeOnClose", "setFinalFocus"],
          },
        ],
      },
      states: {
        idle: {
          on: {
            POINTER_DOWN: {
              target: "pressed",
              actions: ["setPointerStart", "cancelSnapBack"],
            },
          },
        },

        pressed: {
          effects: ["trackDrawerSwipe"],
          on: {
            "SWIPE.START": {
              actions: ["setRegistrySwiping"],
            },
            "SWIPE.MOVE": {
              actions: ["setDragOffset"],
            },
            "SWIPE.END": [
              {
                guard: and("shouldCloseOnSwipe", "isOpenControlled"),
                target: "idle",
                actions: [
                  "clearRegistrySwiping",
                  "clearPointerStart",
                  "setDismissSwipeStrength",
                  "invokeOnClose",
                  "scheduleSnapBack",
                ],
              },
              {
                guard: "shouldCloseOnSwipe",
                target: "closing",
                actions: [
                  "clearSwipeOpenAnimation",
                  "clearRegistrySwiping",
                  "setDismissSwipeStrength",
                  "invokeOnClose",
                  "setFinalFocus",
                ],
              },
              {
                guard: "isDragging",
                target: "idle",
                actions: [
                  "clearRegistrySwiping",
                  "suppressBackdropAnimation",
                  "setSnapSwipeStrength",
                  "setClosestSnapPoint",
                  "clearPointerStart",
                  "clearDragOffset",
                ],
              },
              {
                target: "idle",
                actions: ["clearRegistrySwiping", "clearPointerStart", "clearDragOffset"],
              },
            ],
            "SWIPE.CANCEL": {
              target: "idle",
              actions: ["clearRegistrySwiping", "clearPointerStart", "clearDragOffset"],
            },
          },
        },
      },
    },

    closing: {
      entry: ["cancelSnapBack"],
      effects: ["trackExitAnimation"],
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
        "TRIGGER_VALUE.SET": {
          target: "open",
          actions: ["setTriggerValue", "invokeOnOpen"],
        },
        ANIMATION_END: {
          target: "closed",
          actions: [
            "clearPointerStart",
            "clearDragOffset",
            "clearActiveSnapPoint",
            "clearResolvedActiveSnapPoint",
            "clearSizeMeasurements",
            "resetSwipeStrength",
          ],
        },
      },
    },

    swipeOpen: {
      initial: "pending",
      effects: ["trackSwipeOpen"],
      states: {
        pending: {
          tags: ["closed"],
          on: {
            "SWIPE.START": {
              target: "dragging",
            },
            "SWIPE.END": {
              target: "closed",
              actions: ["clearPointerStart"],
            },
            "SWIPE.CANCEL": {
              target: "closed",
              actions: ["clearPointerStart"],
            },
          },
        },

        dragging: {
          tags: ["open"],
          effects: ["trackSizeMeasurements"],
          on: {
            "SWIPE.MOVE": {
              actions: ["setSwipeOpenDragOffset"],
            },
            "SWIPE.END": [
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
            "SWIPE.CANCEL": {
              target: "closed",
              actions: ["clearPointerStart", "clearDragOffset", "clearSizeMeasurements"],
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
          target: "swipeOpen",
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

      shouldCloseOnSwipe(params) {
        return settleRelease(params, params.event.velocity) === null
      },

      shouldOpenOnSwipe({ context, prop, event }) {
        const dragOffset = context.get("dragOffset")
        const contentSize = context.get("contentSize")
        if (dragOffset === null || contentSize === null) return false
        return isDismissSwipe({
          displacement: contentSize - dragOffset,
          velocity: -event.velocity,
          distance: contentSize * prop("closeThreshold"),
          // the prop is in px/s
          flickVelocity: prop("swipeVelocityThreshold") / 1000,
          pullBack: Infinity,
        })
      },
    },

    actions: {
      setReturnFocusEl({ refs, scope }) {
        // Read on the next frame, like a focus trap, so an opener that closes (e.g. a menu) has restored focus first
        refs.get("returnFocusFrame").request(() => refs.set("returnFocusEl", scope.getActiveElement()))
      },

      setFinalFocus({ event, prop, refs, scope, context }) {
        // A focus trap returns focus on its own
        if (prop("trapFocus") || !prop("restoreFocus")) return
        const restoreFocus = event.restoreFocus ?? event.previousEvent?.restoreFocus
        if (restoreFocus === false) return

        const contentEl = dom.getContentEl(scope)
        const returnFocusEl =
          dom.getReturnFocusEl(scope, {
            finalFocusEl: prop("finalFocusEl"),
            triggerValue: context.get("triggerValue"),
          }) ?? refs.get("returnFocusEl")

        // Not cancelled on exit: restore must still run if the drawer unmounts on close
        raf(() => {
          // Don't take focus back from an element the user moved to
          if (isFocusOutside(scope.getActiveElement(), [contentEl])) return
          returnFocusEl?.focus({ preventScroll: true })
        })
      },

      setInitialFocus({ prop, scope, refs }) {
        // In modal mode, trapFocus handles initial focus
        if (prop("trapFocus")) return
        refs.get("initialFocusFrame").request(() => {
          const element = getInitialFocus({
            root: dom.getContentEl(scope),
            getInitialEl: prop("initialFocusEl"),
          })
          if (!element) return
          element.focus({ preventScroll: true })
        })
      },

      checkRenderedElements({ context, scope, refs }) {
        refs.get("renderedFrame").request(() => {
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

        refs.get("dragOffsetFrame").request(() => {
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

      invokeOnOpen({ prop, event }) {
        prop("onOpenChange")?.({ open: true, reason: getOpenChangeReason(event) })
      },

      invokeOnClose({ prop, event }) {
        prop("onOpenChange")?.({ open: false, reason: getOpenChangeReason(event) })
      },

      setSnapPoint({ context, event }) {
        context.set("snapPoint", event.snapPoint)
      },

      setPointerStart({ event, refs }) {
        refs.set("swipeStart", {
          point: event.point,
          target: event.target ?? null,
          pointerId: event.pointerId,
          pointerType: event.pointerType ?? "mouse",
          defer: !!event.defer,
        })
      },

      setDragOffset({ context, event }) {
        context.set("dragOffset", resistPast(getActiveSnapOffset(context) + event.displacement, { min: 0 }))
      },

      setSwipeOpenDragOffset({ context, event }) {
        const contentSize = context.get("contentSize")
        if (!contentSize) return
        context.set("dragOffset", resistPast(contentSize - Math.max(0, event.displacement), { min: 0 }))
      },

      setClosestSnapPoint(params) {
        const { context, computed, event } = params
        const index = settleRelease(params, event.velocity)
        if (index == null) return
        const point = computed("resolvedSnapPoints")[index]
        context.set("snapPoint", point.value)
        context.set("resolvedActiveSnapPoint", point)
      },

      clearDragOffset({ context }) {
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
        refs.set("swipeStart", null)
      },

      setSnapSwipeStrength(params) {
        const { context, computed, event } = params
        const dragOffset = context.get("dragOffset")
        const index = settleRelease(params, event.velocity)
        if (dragOffset === null || index == null) return
        const target = computed("resolvedSnapPoints")[index].offset
        context.set("swipeStrength", releaseStrength({ distance: dragOffset - target, velocity: event.velocity }))
      },

      setDismissSwipeStrength({ context, event }) {
        const dragOffset = context.get("dragOffset")
        const contentSize = context.get("contentSize")
        if (dragOffset === null || contentSize === null) return
        context.set("swipeStrength", releaseStrength({ distance: contentSize - dragOffset, velocity: event.velocity }))
      },

      resetSwipeStrength({ context }) {
        context.set("swipeStrength", 1)
      },

      scheduleSnapBack({ refs, send, prop }) {
        // Skip when an `onOpenChange` handler can drive the close; wait for `CONTROLLED.CLOSE`
        // instead so an async `open` setter doesn't get flicker from a racing snap-back.
        if (prop("onOpenChange") != null) return
        refs.get("snapBackFrame").request(() => {
          send({ type: "SNAP_BACK" })
        })
      },

      cancelInitialFocus({ refs }) {
        refs.get("initialFocusFrame").cancel()
      },

      cancelFrames({ refs }) {
        refs.get("returnFocusFrame").cancel()
        refs.get("initialFocusFrame").cancel()
        refs.get("renderedFrame").cancel()
        refs.get("dragOffsetFrame").cancel()
      },

      cancelSnapBack({ refs }) {
        refs.get("snapBackFrame").cancel()
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
        const progress = getSwipeProgress(contentSize, dragOffset ?? snapPointOffset)
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
          stack.setSwipe(id, dragOffset !== null, getSwipeProgress(contentSize, dragOffset ?? snapPointOffset))
        }

        sync()

        return () => {
          stack.setSwipe(id, false, 0)
          stack.setOpen(id, false)
          stack.unregister(id)
        }
      },

      trackDismissableElement({ scope, prop, send, context, watchEffect }) {
        // pointerBlocking is read at setup, so `modal` has to re-run this
        return watchEffect([() => prop("modal")], () => {
          const getContentEl = () => dom.getContentEl(scope)
          let restoreFocus = true
          return trackDismissableElement(getContentEl, {
            type: "drawer",
            defer: true,
            getRootNode: scope.getRootNode,
            pointerBlocking: prop("modal"),
            onLayerChange(layer) {
              context.set("layer", layer)
            },
            exclude: [dom.getTriggerEl(scope), ...dom.getTriggerEls(scope)].filter(Boolean) as HTMLElement[],
            onInteractOutside(event) {
              prop("onInteractOutside")?.(event)
              if (!prop("closeOnInteractOutside")) {
                event.preventDefault()
              }
              // Keep focus on what the user pressed outside
              restoreFocus = !(event.detail.focusable || event.detail.contextmenu)
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
            onDismiss(event) {
              send({ type: "CLOSE", src: getDismissReason(event), restoreFocus })
            },
          })
        })
      },

      preventScroll({ scope, prop, watchEffect }) {
        return watchEffect([() => prop("preventScroll")], () => {
          if (!prop("preventScroll")) return
          return preventBodyScroll(scope.getDoc())
        })
      },

      trapFocus({ scope, prop, context, watchEffect }) {
        return watchEffect([() => prop("trapFocus")], () => {
          if (!prop("trapFocus")) return
          const contentEl = () => dom.getContentEl(scope)
          const destroy = trapFocus(contentEl, {
            preventScroll: true,
            returnFocusOnDeactivate: !!prop("restoreFocus"),
            initialFocus: () =>
              getInitialFocus({
                root: dom.getContentEl(scope),
                getInitialEl: prop("initialFocusEl"),
              }),
            setReturnFocus: (el) =>
              dom.getReturnFocusEl(scope, {
                finalFocusEl: prop("finalFocusEl"),
                triggerValue: context.get("triggerValue"),
              }) ?? el,
            getShadowRoot: true,
          })

          return () => destroy({ returnFocus: !!prop("restoreFocus") && !!prop("trapFocus") })
        })
      },

      hideContentBelow({ scope, prop, watchEffect }) {
        return watchEffect([() => prop("modal")], () => {
          if (!prop("modal")) return
          const getElements = () => [dom.getContentEl(scope)]
          return ariaHidden(getElements, { defer: true })
        })
      },

      trackDrawerSwipe({ scope, send, refs, prop, computed }) {
        const start = refs.get("swipeStart")
        if (!start) return

        return trackSwipe(scope.getDoc(), {
          startPoint: start.point,
          pointerId: start.pointerId,
          // touch events outlive a native scroll, so the drawer can take over at its edge
          input: start.pointerType === "touch" ? "touch" : "pointer",
          directions: [computed("physicalSwipeDirection")],
          threshold: start.defer ? DEFERRED_DRAG_DISTANCE : 0,
          target: start.target,
          scrollContainer: prop("preventDragOnScroll") ? dom.getContentEl(scope) : null,
          resistance: (overshoot) => overshoot,
          onStart() {
            send({ type: "SWIPE.START" })
          },
          onMove({ displacement }) {
            send({ type: "SWIPE.MOVE", displacement })
          },
          onEnd({ velocity, cancelled }) {
            if (cancelled) return send({ type: "SWIPE.CANCEL" })
            send({ type: "SWIPE.END", velocity, src: "swipe" })
          },
        })
      },

      trackSizeMeasurements({ context, scope, computed, prop }) {
        const doc = scope.getDoc()
        const html = doc.documentElement
        const shouldMeasureRootFontSize = hasRemSnapPoints(prop("snapPoints"))

        // The content may mount after the drawer opens
        return whenNode(
          () => dom.getContentEl(scope),
          (contentEl) => {
            const updateSize = () => {
              const direction = computed("physicalSwipeDirection")
              const rect = contentEl.getBoundingClientRect()
              const viewportSize = isVertical(direction) ? html.clientHeight : html.clientWidth

              context.set("contentSize", isVertical(direction) ? rect.height : rect.width)
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
            return () => cleanups.forEach((cleanup) => cleanup?.())
          },
          { defer: true, getRootNode: scope.getRootNode },
        )
      },

      trackNestedDrawerMetrics({ scope, computed, context }) {
        // The content may mount after the drawer opens
        return whenNode(
          () => dom.getContentEl(scope),
          (contentEl) => {
            const id = computed("drawerId")

            drawerRegistry.register(id, contentEl)

            const sync = () => {
              const entries = [...drawerRegistry.getEntries().entries()]
              const myIndex = entries.findIndex(([entryId]) => entryId === id)
              if (myIndex === -1) return

              const count = entries.length - 1 - myIndex
              const frontmostEl = entries[entries.length - 1]?.[1]
              const frontmostHeight = frontmostEl?.getBoundingClientRect().height ?? 0
              const height = contentEl.getBoundingClientRect().height

              context.set("nestedMetrics", {
                count,
                height,
                frontmostHeight,
                open: count > 0 && frontmostHeight > 0,
                swiping: drawerRegistry.hasSwipingAfter(id),
              })
            }

            sync()

            const cleanups = [
              drawerRegistry.subscribe(sync),
              resizeObserverBorderBox.observe(contentEl, () => drawerRegistry.notify()),
              addDomEvent(scope.getWin(), "resize", () => drawerRegistry.notify()),
            ]

            return () => {
              cleanups.forEach((cleanup) => cleanup?.())
              drawerRegistry.unregister(id)
            }
          },
          { defer: true, getRootNode: scope.getRootNode },
        )
      },

      trackSwipeOpen({ scope, send, refs, computed }) {
        const start = refs.get("swipeStart")
        if (!start) return

        const direction = oppositeDirection(computed("physicalSwipeDirection"))

        return trackSwipe(scope.getDoc(), {
          startPoint: start.point,
          pointerId: start.pointerId,
          input: start.pointerType === "touch" ? "touch" : "pointer",
          directions: [direction],
          canStart: (offset) => getSwipeDisplacement(direction, offset) > OPEN_INTENT_DISTANCE || undefined,
          resistance: (overshoot) => overshoot,
          onStart() {
            send({ type: "SWIPE.START" })
          },
          onMove({ displacement }) {
            send({ type: "SWIPE.MOVE", displacement })
          },
          onEnd({ velocity, cancelled }) {
            if (cancelled) return send({ type: "SWIPE.CANCEL" })
            send({ type: "SWIPE.END", velocity: -velocity, src: "swipe" })
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

function getOpenChangeReason(event: DrawerSchema["event"]) {
  return (event.previousEvent ?? event).src as OpenChangeReason | undefined
}
