import { createGuards, createMachine } from "@zag-js/core"
import { addDomEvent, getOverflowAncestors, isComposingEvent } from "@zag-js/dom-query"
import { trackFocusVisible as trackFocusVisibleFn } from "@zag-js/focus-visible"
import { getPlacement } from "@zag-js/popper"
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
      action(["reposition"])
    })
  },

  on: {
    "triggerValue.set": {
      actions: ["setTriggerValue", "repositionImmediate"],
    },
  },

  states: {
    closed: {
      entry: ["clearGlobalId"],
      on: {
        "controlled.open": {
          target: "open",
        },
        open: [
          {
            guard: "isOpenControlled",
            actions: ["setTriggerValue", "invokeOnOpen"],
          },
          {
            target: "open",
            actions: ["setTriggerValue", "invokeOnOpen"],
          },
        ],
        "pointer.leave": {
          actions: ["clearPointerMoveOpened"],
        },
        "pointer.move": [
          {
            guard: and("noVisibleTooltip", not("hasPointerMoveOpened")),
            target: "opening",
            actions: ["setTriggerValue"],
          },
          {
            guard: not("hasPointerMoveOpened"),
            target: "open",
            actions: ["setPointerMoveOpened", "invokeOnOpen", "setTriggerValue"],
          },
        ],
      },
    },

    opening: {
      effects: ["trackScroll", "trackPointerlockChange", "waitForOpenDelay"],
      on: {
        "after.openDelay": [
          {
            guard: "isOpenControlled",
            actions: ["setPointerMoveOpened", "invokeOnOpen"],
          },
          {
            target: "open",
            actions: ["setPointerMoveOpened", "invokeOnOpen"],
          },
        ],
        "controlled.open": {
          target: "open",
        },
        "controlled.close": {
          target: "closed",
        },
        open: [
          {
            guard: "isOpenControlled",
            actions: ["setTriggerValue", "invokeOnOpen"],
          },
          {
            target: "open",
            actions: ["setTriggerValue", "invokeOnOpen"],
          },
        ],
        "pointer.leave": [
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
        close: [
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
      effects: ["trackEscapeKey", "trackScroll", "trackPointerlockChange", "trackPositioning"],
      entry: ["setGlobalId"],
      on: {
        "controlled.close": {
          target: "closed",
        },
        close: [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnClose"],
          },
          {
            target: "closed",
            actions: ["invokeOnClose"],
          },
        ],
        "pointer.leave": [
          {
            guard: "isVisible",
            target: "closing",
            actions: ["clearPointerMoveOpened"],
          },
          // == group ==
          {
            guard: "isOpenControlled",
            actions: ["clearPointerMoveOpened", "invokeOnClose"],
          },
          {
            target: "closed",
            actions: ["clearPointerMoveOpened", "invokeOnClose"],
          },
        ],
        "content.pointer.leave": {
          guard: "isInteractive",
          target: "closing",
        },
        "positioning.set": {
          actions: ["reposition"],
        },
        "triggerValue.set": {
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
        "after.closeDelay": [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnClose"],
          },
          {
            target: "closed",
            actions: ["invokeOnClose"],
          },
        ],
        "controlled.close": {
          target: "closed",
        },
        "controlled.open": {
          target: "open",
        },
        close: [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnClose"],
          },
          {
            target: "closed",
            actions: ["invokeOnClose"],
          },
        ],
        "pointer.move": [
          {
            guard: "isOpenControlled",
            // We trigger toggleVisibility manually since the `ctx.open` has not changed yet (at this point)
            actions: ["setPointerMoveOpened", "setTriggerValue", "invokeOnOpen", "toggleVisibility"],
          },
          {
            target: "open",
            actions: ["setPointerMoveOpened", "setTriggerValue", "invokeOnOpen"],
          },
        ],
        "triggerValue.set": {
          target: "open",
          actions: ["setTriggerValue", "repositionImmediate"],
        },
        reopen: {
          target: "open",
        },
        "content.pointer.move": {
          guard: "isInteractive",
          target: "open",
        },
        "positioning.set": {
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
      setGlobalId: ({ prop }) => {
        const prevId = store.get("id")
        const isInstant = prevId !== null && prevId !== prop("id")
        store.update({ id: prop("id"), prevId: isInstant ? prevId : null, instant: isInstant })
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
        send({ type: "close", src: "disabled.change" })
      },

      reposition: ({ context, event, prop, scope }) => {
        if (event.type !== "positioning.set") return
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
            type: prop("open") ? "controlled.open" : "controlled.close",
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

      setTriggerValue: ({ context, event }) => {
        context.set("triggerValue", event.value ?? null)
      },

      immediateReopen: ({ send }) => {
        // Immediately transition back to open to re-create the positioning effect
        queueMicrotask(() => {
          send({ type: "reopen" })
        })
      },
    },
    effects: {
      trackFocusVisible: ({ scope }) => {
        return trackFocusVisibleFn({ root: scope.getRootNode?.() })
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
        const onChange = () => send({ type: "close", src: "pointerlock:change" })
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
            send({ type: "close", src: "scroll" })
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
            if (store.get("id") !== prop("id")) {
              send({ type: "close", src: "id.change" })
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
          send({ type: "close", src: "keydown.escape" })
        }

        return addDomEvent(document, "keydown", onKeyDown, true)
      },

      waitForOpenDelay: ({ send, prop, event }) => {
        const id = setTimeout(() => {
          send({ type: "after.openDelay", previousEvent: event })
        }, prop("openDelay"))
        return () => clearTimeout(id)
      },

      waitForCloseDelay: ({ send, prop, event }) => {
        const id = setTimeout(() => {
          send({ type: "after.closeDelay", previousEvent: event })
        }, prop("closeDelay"))
        return () => clearTimeout(id)
      },
    },
  },
})
