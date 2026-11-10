import { createGuards, createMachine, type Params } from "@zag-js/core"
import {
  addDomEvent,
  AnimationFrame,
  getOverflowAncestors,
  getPopupActivationDirection,
  isComposingEvent,
  waitForAnimationEnd,
  raf,
  resizeObserverBorderBox,
} from "@zag-js/dom-query"
import { trackFocusVisible } from "@zag-js/focus-visible"
import { getPlacement } from "@zag-js/popper"
import { trackSafeArea } from "@zag-js/safe-area"
import { ensureProps } from "@zag-js/utils"
import * as dom from "./tooltip.dom"
import { isWarm, store } from "./tooltip.store"
import { getViewportSizeStyle } from "./tooltip.style"
import type { PopupActivationDirection } from "@zag-js/types"
import type { OpenChangeReason, Placement, TooltipSchema, ViewportSize } from "./tooltip.types"

const { and, not } = createGuards<TooltipSchema>()

export const machine = createMachine<TooltipSchema>({
  initialState: ({ prop }) => {
    const open = prop("open") || prop("defaultOpen")
    return open ? "open" : "closed"
  },

  props({ props }) {
    ensureProps(props, ["id"])
    // If consumer disables click-to-close, default pointerdown-to-close to follow it
    const closeOnClick = props.closeOnClick ?? true
    const closeOnPointerDown = props.closeOnPointerDown ?? closeOnClick
    return {
      openDelay: 400,
      closeDelay: 150,
      closeOnEscape: true,
      interactive: false,
      closeOnScroll: true,
      disabled: false,
      ...props,
      closeOnPointerDown,
      closeOnClick,
      positioning: {
        placement: "bottom",
        ...props.positioning,
      },
    }
  },

  effects: ["trackFocusVisible", "trackStore"],

  exit: ["clearGlobalId", "endTriggerSwitch"],

  context: ({ bindable, prop, scope }) => ({
    currentPlacement: bindable<Placement | undefined>(() => ({ defaultValue: undefined })),
    hasPointerMoveOpened: bindable<string | null>(() => ({ defaultValue: null })),
    isPointer: bindable<boolean>(() => ({ defaultValue: false })),
    triggerValue: bindable<string | null>(() => ({
      defaultValue: prop("defaultTriggerValue") ?? null,
      value: prop("triggerValue"),
      onChange(value) {
        const onTriggerValueChange = prop("onTriggerValueChange")
        if (!onTriggerValueChange) return
        const triggerElement = dom.getTriggerEl(scope, value)
        onTriggerValueChange({ value, triggerElement })
      },
    })),
    activationDirection: bindable<PopupActivationDirection | null>(() => ({ defaultValue: null })),
    previousTriggerValue: bindable<string | null>(() => ({ defaultValue: null })),
    transitioning: bindable<boolean>(() => ({ defaultValue: false })),
    viewportRendered: bindable<boolean>(() => ({ defaultValue: false })),
    viewportSize: bindable<ViewportSize | null>(() => ({ defaultValue: null })),
  }),

  refs: () => ({
    cancelTriggerSwitch: null,
    awaitingViewportSize: false,
  }),

  watch({ track, action, prop }) {
    track([() => prop("disabled")], () => {
      action(["closeIfDisabled"])
    })

    track([() => prop("open")], () => {
      action(["toggleVisibility"])
    })

    track([() => prop("triggerValue")], () => {
      action(["repositionImmediate"])
    })
  },

  on: {
    "TRIGGER_VALUE.SET": {
      actions: ["setTriggerValue", "repositionImmediate"],
    },
    "TRIGGER_SWITCH.END": {
      actions: ["endTriggerSwitch"],
    },
  },

  states: {
    closed: {
      entry: ["clearGlobalId", "clearIsPointer", "endTriggerSwitch", "clearActivationDirection"],
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
        POINTER_LEAVE: {
          actions: ["clearPointerMoveOpened"],
        },
        POINTER_MOVE: [
          {
            guard: and(not("isWarm"), not("hasPointerMoveOpened")),
            target: "opening",
            actions: ["setTriggerValue", "setPointerMoveOpened"],
          },
          {
            guard: not("hasPointerMoveOpened"),
            target: "open",
            actions: ["setPointerMoveOpened", "setIsPointer", "invokeOnOpen", "setTriggerValue"],
          },
        ],
      },
    },

    opening: {
      effects: ["trackScroll", "trackPointerlockChange", "waitForOpenDelay"],
      on: {
        OPEN_DELAY: [
          {
            guard: "isOpenControlled",
            actions: ["setPointerMoveOpened", "setIsPointer", "invokeOnOpen"],
          },
          {
            target: "open",
            actions: ["setPointerMoveOpened", "setIsPointer", "invokeOnOpen"],
          },
        ],
        "CONTROLLED.OPEN": {
          target: "open",
        },
        "CONTROLLED.CLOSE": {
          target: "closed",
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
        POINTER_LEAVE: [
          {
            guard: "isDisabled",
            actions: ["clearPointerMoveOpened"],
          },
          {
            guard: "isOpenControlled",
            // We trigger toggleVisibility manually since the `ctx.open` has not changed yet (at this point)
            actions: ["clearPointerMoveOpened", "invokeOnClose", "toggleVisibility"],
          },
          {
            target: "closed",
            actions: ["clearPointerMoveOpened", "invokeOnClose"],
          },
        ],
        CLOSE: [
          {
            guard: "isOpenControlled",
            // We trigger toggleVisibility manually since the `ctx.open` has not changed yet (at this point)
            actions: ["invokeOnClose", "toggleVisibility"],
          },
          {
            target: "closed",
            actions: ["invokeOnClose"],
          },
        ],
      },
    },

    open: {
      effects: [
        "trackEscapeKey",
        "trackScroll",
        "trackPointerlockChange",
        "trackPositioning",
        "trackViewportSize",
        "trackSafeArea",
      ],
      entry: ["setGlobalId"],
      on: {
        "CONTROLLED.CLOSE": {
          target: "closed",
        },
        CLOSE: [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnClose"],
          },
          {
            target: "closed",
            actions: ["invokeOnClose"],
          },
        ],
        // Hoverable content means the pointer may be travelling to it (WCAG 1.4.13), so the
        // safe area decides when it has really left.
        POINTER_LEAVE: [
          {
            // A controlled tooltip can stay open while disabled
            guard: "isDisabled",
            actions: ["clearPointerMoveOpened"],
          },
          {
            guard: and(not("isInteractive"), "isVisible"),
            target: "closing",
            actions: ["clearPointerMoveOpened"],
          },
          // == group ==
          {
            guard: and(not("isInteractive"), "isOpenControlled"),
            actions: ["clearPointerMoveOpened", "invokeOnClose"],
          },
          {
            guard: not("isInteractive"),
            target: "closed",
            actions: ["clearPointerMoveOpened", "invokeOnClose"],
          },
        ],
        "SAFE_AREA.EXIT": {
          target: "closing",
          // Same bookkeeping the `POINTER_LEAVE` path does, or `closed` refuses the next hover.
          actions: ["clearPointerMoveOpened"],
        },
        "POSITIONING.SET": {
          actions: ["reposition"],
        },
        "TRIGGER_VALUE.SET": {
          // Transition to closing (which cleans up trackPositioning) then immediately back to open
          // This re-creates the positioning effect with the new trigger
          target: "closing",
          actions: [
            "setActivationDirection",
            "setPreviousTriggerValue",
            "setTriggerValue",
            "startTriggerSwitch",
            "immediateReopen",
          ],
        },
      },
    },

    closing: {
      effects: ["trackPositioning", "trackViewportSize", "waitForCloseDelay"],
      on: {
        CLOSE_DELAY: [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnClose"],
          },
          {
            target: "closed",
            actions: ["invokeOnClose"],
          },
        ],
        "CONTROLLED.CLOSE": {
          target: "closed",
        },
        "CONTROLLED.OPEN": {
          target: "open",
        },
        CLOSE: [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnClose"],
          },
          {
            target: "closed",
            actions: ["invokeOnClose"],
          },
        ],
        POINTER_MOVE: [
          {
            guard: and("isOpenControlled", "isNewTriggerValue"),
            actions: [
              "setPointerMoveOpened",
              "setIsPointer",
              "setActivationDirection",
              "setPreviousTriggerValue",
              "setTriggerValue",
              "startTriggerSwitch",
              "invokeOnOpen",
              "toggleVisibility",
            ],
          },
          {
            guard: "isOpenControlled",
            // We trigger toggleVisibility manually since the `ctx.open` has not changed yet (at this point)
            actions: ["setPointerMoveOpened", "setIsPointer", "setTriggerValue", "invokeOnOpen", "toggleVisibility"],
          },
          {
            guard: "isNewTriggerValue",
            target: "open",
            actions: [
              "setPointerMoveOpened",
              "setIsPointer",
              "setActivationDirection",
              "setPreviousTriggerValue",
              "setTriggerValue",
              "startTriggerSwitch",
              "invokeOnOpen",
            ],
          },
          {
            target: "open",
            actions: ["setPointerMoveOpened", "setIsPointer", "setTriggerValue", "invokeOnOpen"],
          },
        ],
        "TRIGGER_VALUE.SET": {
          target: "open",
          actions: [
            "setActivationDirection",
            "setPreviousTriggerValue",
            "setTriggerValue",
            "startTriggerSwitch",
            "repositionImmediate",
          ],
        },
        REOPEN: {
          target: "open",
        },
        CONTENT_POINTER_MOVE: {
          guard: "isInteractive",
          target: "open",
        },
        "POSITIONING.SET": {
          actions: ["reposition"],
        },
      },
    },
  },

  implementations: {
    guards: {
      isWarm: () => isWarm(),
      isVisible: ({ prop }) => prop("id") === store.get("id"),
      isInteractive: ({ prop }) => !!prop("interactive"),
      hasPointerMoveOpened: ({ context }) => !!context.get("hasPointerMoveOpened"),
      isOpenControlled: ({ prop }) => prop("open") !== undefined,
      isDisabled: ({ prop }) => !!prop("disabled"),
      isNewTriggerValue: ({ context, event }) => event.value != null && event.value !== context.get("triggerValue"),
    },

    actions: {
      setGlobalId: ({ prop, event }) => {
        const prevId = store.get("id")
        const switching = prevId !== null && prevId !== prop("id")
        const isInstant = event.src === "trigger-focus" || switching || isWarm()
        store.update({ id: prop("id"), prevId: switching ? prevId : null, instant: isInstant })
      },

      clearGlobalId: ({ prop }) => {
        if (prop("id") === store.get("id")) {
          store.update({ id: null, prevId: null, instant: false, closedAt: Date.now() })
        }
      },

      invokeOnOpen: ({ prop, event }) => {
        prop("onOpenChange")?.({ open: true, reason: getOpenChangeReason(event) })
      },

      invokeOnClose: ({ prop, event }) => {
        prop("onOpenChange")?.({ open: false, reason: getOpenChangeReason(event) })
      },

      closeIfDisabled: ({ prop, send }) => {
        if (!prop("disabled")) return
        send({ type: "CLOSE", src: "disabled" })
      },

      reposition: ({ context, event, prop, scope, refs }) => {
        if (event.type !== "POSITIONING.SET") return
        if (refs.get("awaitingViewportSize")) return
        const getPositionerEl = () => dom.getPositionerEl(scope)
        const getTriggerEl = () => dom.getTriggerEl(scope, context.get("triggerValue"))
        getPlacement(getTriggerEl, getPositionerEl, {
          getArrowElement: () => dom.getArrowEl(scope),
          ...prop("positioning"),
          ...event.options,
          listeners: false,
          onComplete(data) {
            context.set("currentPlacement", data.placement)
          },
        })
      },

      repositionImmediate: ({ context, event, prop, scope, refs }) => {
        if (refs.get("awaitingViewportSize")) return
        // Use event.value (new trigger) instead of context (might still have old value)
        const triggerValue = event.value ?? context.get("triggerValue")
        const getPositionerEl = () => dom.getPositionerEl(scope)
        const getTriggerEl = () => dom.getTriggerEl(scope, triggerValue)
        return getPlacement(getTriggerEl, getPositionerEl, {
          getArrowElement: () => dom.getArrowEl(scope),
          ...prop("positioning"),
          onComplete(data) {
            context.set("currentPlacement", data.placement)
          },
        })
      },

      toggleVisibility: ({ prop, event, send }) => {
        queueMicrotask(() => {
          send({
            type: prop("open") ? "CONTROLLED.OPEN" : "CONTROLLED.CLOSE",
            previousEvent: event,
          })
        })
      },

      setPointerMoveOpened: ({ context, event }) => {
        const triggerId = event.triggerId ?? event.previousEvent?.triggerId
        context.set("hasPointerMoveOpened", triggerId ?? null)
      },

      clearPointerMoveOpened: ({ context }) => {
        context.set("hasPointerMoveOpened", null)
      },

      setIsPointer: ({ context }) => {
        context.set("isPointer", true)
      },

      clearIsPointer: ({ context }) => {
        context.set("isPointer", false)
      },

      setTriggerValue: ({ context, event }) => {
        if (event.value === undefined) return
        context.set("triggerValue", event.value)
      },

      setActivationDirection: ({ context, event, scope }) => {
        const fromEl = dom.getTriggerEl(scope, context.get("triggerValue"))
        const toEl = dom.getTriggerEl(scope, event.value)
        context.set("activationDirection", getPopupActivationDirection(fromEl, toEl))
      },

      clearActivationDirection: ({ context }) => {
        context.set("activationDirection", null)
      },

      setPreviousTriggerValue: ({ context }) => {
        context.set("previousTriggerValue", context.get("triggerValue"))
      },

      startTriggerSwitch: ({ context, refs, scope, send }) => {
        refs.get("cancelTriggerSwitch")?.()
        context.set("transitioning", true)
        const positionerEl = dom.getPositionerEl(scope)
        if (!positionerEl) return
        positionerEl.setAttribute("data-transitioning", "")
        refs.set("awaitingViewportSize", !!dom.getViewportEl(scope))
        const cancel = waitForAnimationEnd(positionerEl, () => send({ type: "TRIGGER_SWITCH.END" }))
        refs.set("cancelTriggerSwitch", cancel)
      },

      endTriggerSwitch: ({ context, refs }) => {
        context.set("previousTriggerValue", null)
        refs.get("cancelTriggerSwitch")?.()
        refs.set("cancelTriggerSwitch", null)
        refs.set("awaitingViewportSize", false)
        context.set("transitioning", false)
      },

      immediateReopen: ({ send }) => {
        // Immediately transition back to open to re-create the positioning effect
        queueMicrotask(() => {
          send({ type: "REOPEN" })
        })
      },
    },
    effects: {
      trackFocusVisible: ({ scope }) => {
        return trackFocusVisible({ root: scope.getRootNode?.() })
      },

      // Only when hoverable: with `interactive: false` the content has `pointer-events: none`,
      // so there is no journey to protect and its rect is unreachable.
      trackSafeArea: ({ send, prop, scope, context }) => {
        if (!prop("interactive")) return
        return trackSafeArea({
          getTriggerEl: () => dom.getTriggerEl(scope, context.get("triggerValue")),
          getContentEl: () => dom.getPopupEl(scope, context.get("triggerValue")),
          openedByPointer: () => context.get("isPointer"),
          defer: true,
          onLeave() {
            send({ type: "SAFE_AREA.EXIT", src: "pointer-leave" })
          },
        })
      },

      trackPositioning: ({ context, prop, scope, refs }) => {
        if (!context.get("currentPlacement")) {
          context.set("currentPlacement", prop("positioning").placement)
        }

        const getPositionerEl = () => dom.getPositionerEl(scope)
        const getTriggerEl = () => dom.getTriggerEl(scope, context.get("triggerValue"))
        const positioning = prop("positioning")
        return getPlacement(getTriggerEl, getPositionerEl, {
          getArrowElement: () => dom.getArrowEl(scope),
          ...positioning,
          updatePosition(data) {
            if (refs.get("awaitingViewportSize")) return
            return positioning.updatePosition ? positioning.updatePosition(data) : data.updatePosition()
          },
          defer: true,
          onComplete(data) {
            context.set("currentPlacement", data.placement)
          },
        })
      },

      trackViewportSize: (params) => {
        const { context, scope, watchEffect } = params
        return watchEffect([() => context.get("triggerValue")], () => {
          const frame = AnimationFrame.create()
          const stopObserving = raf(() => {
            const contentEl = dom.getContentEl(scope, context.get("triggerValue"))
            const viewportRendered = !!dom.getViewportEl(scope)
            context.set("viewportRendered", viewportRendered)
            if (!viewportRendered || !contentEl) return

            return resizeObserverBorderBox.observe(contentEl, (entry) => {
              const [{ inlineSize, blockSize }] = entry.borderBoxSize
              frame.request(() => setViewportSize(params, { width: inlineSize, height: blockSize }))
            })
          })
          return () => {
            stopObserving()
            frame.cancel()
          }
        })
      },

      trackPointerlockChange: ({ send, scope }) => {
        const doc = scope.getDoc()
        const onChange = () => send({ type: "CLOSE", src: "interact-outside" })
        return addDomEvent(doc, "pointerlockchange", onChange, false)
      },

      trackScroll: ({ send, prop, scope, context }) => {
        if (!prop("closeOnScroll")) return

        const triggerValue = context.get("triggerValue")
        const triggerEl = dom.getTriggerEl(scope, triggerValue)
        if (!triggerEl) return

        const overflowParents = getOverflowAncestors(triggerEl)

        const cleanups = overflowParents.map((overflowParent) => {
          const onScroll = () => {
            send({ type: "CLOSE", src: "scroll" })
          }
          return addDomEvent(overflowParent, "scroll", onScroll, {
            passive: true,
            capture: true,
          })
        })

        return () => {
          cleanups.forEach((fn) => fn?.())
        }
      },

      trackStore: ({ prop, send }) => {
        let cleanup: VoidFunction | undefined
        let cancelled = false
        queueMicrotask(() => {
          if (cancelled) return
          cleanup = store.subscribe(() => {
            const id = store.get("id")
            if (id !== null && id !== prop("id")) {
              send({ type: "CLOSE", src: "sibling-open" })
            }
          })
        })
        return () => {
          cancelled = true
          cleanup?.()
        }
      },

      trackEscapeKey: ({ send, prop, scope }) => {
        if (!prop("closeOnEscape")) return

        const onKeyDown = (event: KeyboardEvent) => {
          if (isComposingEvent(event)) return
          if (event.key !== "Escape") return
          event.stopPropagation()
          send({ type: "CLOSE", src: "escape-key" })
        }

        return addDomEvent(scope.getDoc(), "keydown", onKeyDown, true)
      },

      waitForOpenDelay: ({ send, prop, event }) => {
        const id = setTimeout(() => {
          send({ type: "OPEN_DELAY", previousEvent: event })
        }, prop("openDelay"))
        return () => clearTimeout(id)
      },

      waitForCloseDelay: ({ send, prop, event }) => {
        const id = setTimeout(() => {
          send({ type: "CLOSE_DELAY", previousEvent: event })
        }, prop("closeDelay"))
        return () => clearTimeout(id)
      },
    },
  },
})

function setViewportSize(params: Params<TooltipSchema>, size: ViewportSize) {
  const { context, scope, refs, send } = params
  context.set("viewportSize", size)
  const positionerEl = dom.getPositionerEl(scope)
  for (const [key, value] of Object.entries(getViewportSizeStyle(size))) {
    positionerEl?.style.setProperty(key, value)
  }
  if (!refs.get("awaitingViewportSize")) return
  refs.set("awaitingViewportSize", false)
  send({ type: "POSITIONING.SET" })
}

function getOpenChangeReason(event: TooltipSchema["event"]) {
  return (event.previousEvent ?? event).src as OpenChangeReason | undefined
}
