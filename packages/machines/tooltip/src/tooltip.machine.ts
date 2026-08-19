import { createGuards, createMachine } from "@zag-js/core"
import { addDomEvent, getOverflowAncestors, isComposingEvent } from "@zag-js/dom-query"
import { trackFocusVisible } from "@zag-js/focus-visible"
import { getPlacement } from "@zag-js/popper"
import { trackSafeArea } from "@zag-js/safe-area"
import { ensureProps } from "@zag-js/utils"
import * as dom from "./tooltip.dom"
import { store } from "./tooltip.store"
import type { Placement, TooltipSchema } from "./tooltip.types"

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
        const triggerElement = dom.getActiveTriggerEl(scope, value)
        onTriggerValueChange({ value, triggerElement })
      },
    })),
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
  },

  states: {
    closed: {
      entry: ["clearGlobalId", "clearIsPointer"],
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
            guard: and("noVisibleTooltip", not("hasPointerMoveOpened")),
            target: "opening",
            actions: ["setTriggerValue"],
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
      effects: ["trackEscapeKey", "trackScroll", "trackPointerlockChange", "trackPositioning", "trackSafeArea"],
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
          actions: ["setTriggerValue", "immediateReopen"],
        },
      },
    },

    closing: {
      effects: ["trackPositioning", "waitForCloseDelay"],
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
            guard: "isOpenControlled",
            // We trigger toggleVisibility manually since the `ctx.open` has not changed yet (at this point)
            actions: ["setPointerMoveOpened", "setIsPointer", "setTriggerValue", "invokeOnOpen", "toggleVisibility"],
          },
          {
            target: "open",
            actions: ["setPointerMoveOpened", "setIsPointer", "setTriggerValue", "invokeOnOpen"],
          },
        ],
        "TRIGGER_VALUE.SET": {
          target: "open",
          actions: ["setTriggerValue", "repositionImmediate"],
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
      noVisibleTooltip: () => store.get("id") === null,
      isVisible: ({ prop }) => prop("id") === store.get("id"),
      isInteractive: ({ prop }) => !!prop("interactive"),
      hasPointerMoveOpened: ({ context }) => !!context.get("hasPointerMoveOpened"),
      isOpenControlled: ({ prop }) => prop("open") !== undefined,
    },

    actions: {
      setGlobalId: ({ prop, event }) => {
        const prevId = store.get("id")
        const isInstant = event.src === "trigger.focus" || (prevId !== null && prevId !== prop("id"))
        store.update({ id: prop("id"), prevId: isInstant && prevId !== null ? prevId : null, instant: isInstant })
      },

      clearGlobalId: ({ prop }) => {
        if (prop("id") === store.get("id")) {
          store.update({ id: null, prevId: null, instant: false })
        }
      },

      invokeOnOpen: ({ prop }) => {
        prop("onOpenChange")?.({ open: true })
      },

      invokeOnClose: ({ prop }) => {
        prop("onOpenChange")?.({ open: false })
      },

      closeIfDisabled: ({ prop, send }) => {
        if (!prop("disabled")) return
        send({ type: "CLOSE", src: "disabled.change" })
      },

      reposition: ({ context, event, prop, scope }) => {
        if (event.type !== "POSITIONING.SET") return
        const getPositionerEl = () => dom.getPositionerEl(scope)
        const getTriggerEl = () => dom.getActiveTriggerEl(scope, context.get("triggerValue"))
        getPlacement(getTriggerEl, getPositionerEl, {
          ...prop("positioning"),
          ...event.options,
          listeners: false,
          onComplete(data) {
            context.set("currentPlacement", data.placement)
          },
        })
      },

      repositionImmediate: ({ context, event, prop, scope }) => {
        // Use event.value (new trigger) instead of context (might still have old value)
        const triggerValue = event.value ?? context.get("triggerValue")
        const getPositionerEl = () => dom.getPositionerEl(scope)
        const getTriggerEl = () => dom.getActiveTriggerEl(scope, triggerValue)
        return getPlacement(getTriggerEl, getPositionerEl, {
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
          getTriggerEl: () => dom.getActiveTriggerEl(scope, context.get("triggerValue")),
          getContentEl: () => dom.getContentEl(scope),
          openedByPointer: () => context.get("isPointer"),
          defer: true,
          onLeave() {
            send({ type: "SAFE_AREA.EXIT" })
          },
        })
      },

      trackPositioning: ({ context, prop, scope }) => {
        if (!context.get("currentPlacement")) {
          context.set("currentPlacement", prop("positioning").placement)
        }

        const getPositionerEl = () => dom.getPositionerEl(scope)
        const getTriggerEl = () => dom.getActiveTriggerEl(scope, context.get("triggerValue"))
        return getPlacement(getTriggerEl, getPositionerEl, {
          ...prop("positioning"),
          defer: true,
          onComplete(data) {
            context.set("currentPlacement", data.placement)
          },
        })
      },

      trackPointerlockChange: ({ send, scope }) => {
        const doc = scope.getDoc()
        const onChange = () => send({ type: "CLOSE", src: "pointerlock:change" })
        return addDomEvent(doc, "pointerlockchange", onChange, false)
      },

      trackScroll: ({ send, prop, scope, context }) => {
        if (!prop("closeOnScroll")) return

        const triggerValue = context.get("triggerValue")
        const triggerEl = dom.getActiveTriggerEl(scope, triggerValue)
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
        queueMicrotask(() => {
          cleanup = store.subscribe(() => {
            const id = store.get("id")
            if (id !== null && id !== prop("id")) {
              send({ type: "CLOSE", src: "id.change" })
            }
          })
        })
        return () => cleanup?.()
      },

      trackEscapeKey: ({ send, prop }) => {
        if (!prop("closeOnEscape")) return

        const onKeyDown = (event: KeyboardEvent) => {
          if (isComposingEvent(event)) return
          if (event.key !== "Escape") return
          event.stopPropagation()
          send({ type: "CLOSE", src: "keydown.escape" })
        }

        return addDomEvent(document, "keydown", onKeyDown, true)
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
