import { createGuards, createMachine } from "@zag-js/core"
import { trackDismissableElement } from "@zag-js/dismissable"
import { getPlacement } from "@zag-js/popper"
import * as dom from "./hover-card.dom"
import type { HoverCardSchema, Placement } from "./hover-card.types"

const { not, and } = createGuards<HoverCardSchema>()

export const machine = createMachine<HoverCardSchema>({
  props({ props }) {
    return {
      disabled: false,
      openDelay: 600,
      closeDelay: 300,
      ...props,
      positioning: {
        placement: "bottom",
        ...props.positioning,
      },
    }
  },

  initialState({ prop }) {
    const open = prop("open") || prop("defaultOpen")
    return open ? "open" : "closed"
  },

  context({ prop, bindable, scope }) {
    return {
      open: bindable<boolean>(() => ({
        defaultValue: prop("defaultOpen"),
        value: prop("open"),
      })),
      currentPlacement: bindable<Placement | undefined>(() => ({
        defaultValue: undefined,
      })),
      isPointer: bindable<boolean>(() => ({
        defaultValue: false,
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
    }
  },

  watch({ track, context, action, prop, send }) {
    track([() => prop("disabled")], () => {
      if (prop("disabled")) {
        send({ type: "CLOSE", src: "disabled.change" })
      }
    })
    track([() => context.get("open")], () => {
      action(["toggleVisibility"])
    })
  },

  on: {
    "TRIGGER_VALUE.SET": {
      actions: ["setTriggerValue", "reposition"],
    },
  },

  states: {
    closed: {
      tags: ["closed"],
      entry: ["clearIsPointer"],
      on: {
        "CONTROLLED.OPEN": {
          target: "open",
        },
        POINTER_ENTER: {
          target: "opening",
          actions: ["setIsPointer", "setTriggerValue"],
        },
        TRIGGER_FOCUS: {
          target: "opening",
          actions: ["setTriggerValue"],
        },
        OPEN: {
          target: "opening",
          actions: ["setTriggerValue"],
        },
      },
    },

    opening: {
      tags: ["closed"],
      effects: ["waitForOpenDelay"],
      on: {
        OPEN_DELAY: [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnOpen"],
          },
          {
            target: "open",
            actions: ["invokeOnOpen"],
          },
        ],
        "CONTROLLED.OPEN": {
          target: "open",
        },
        "CONTROLLED.CLOSE": {
          target: "closed",
        },
        POINTER_LEAVE: [
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
        TRIGGER_BLUR: [
          {
            guard: and("isOpenControlled", not("isPointer")),
            // We trigger toggleVisibility manually since the `ctx.open` has not changed yet (at this point)
            actions: ["invokeOnClose", "toggleVisibility"],
          },
          {
            guard: not("isPointer"),
            target: "closed",
            actions: ["invokeOnClose"],
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
        "TRIGGER_VALUE.SET": {
          // Stay in opening state but update trigger value (will reposition when opened)
          actions: ["setTriggerValue"],
        },
      },
    },

    open: {
      tags: ["open"],
      effects: ["trackDismissableElement", "trackPositioning"],
      on: {
        "CONTROLLED.CLOSE": {
          target: "closed",
        },
        POINTER_ENTER: {
          actions: ["setIsPointer"],
        },
        POINTER_LEAVE: {
          target: "closing",
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
        TRIGGER_BLUR: [
          {
            guard: and("isOpenControlled", not("isPointer")),
            actions: ["invokeOnClose"],
          },
          {
            guard: not("isPointer"),
            target: "closed",
            actions: ["invokeOnClose"],
          },
        ],
        "POSITIONING.SET": {
          actions: ["reposition"],
        },
      },
    },

    closing: {
      tags: ["open"],
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
        POINTER_ENTER: {
          target: "open",
          // no need to invokeOnOpen here because it's still open (but about to close)
          actions: ["setIsPointer"],
        },
        "TRIGGER_VALUE.SET": {
          target: "open",
          actions: ["setTriggerValue", "reposition"],
        },
      },
    },
  },

  implementations: {
    guards: {
      isPointer: ({ context }) => !!context.get("isPointer"),
      isOpenControlled: ({ prop }) => prop("open") != null,
    },

    effects: {
      waitForOpenDelay({ send, prop }) {
        const id = setTimeout(() => {
          send({ type: "OPEN_DELAY" })
        }, prop("openDelay"))

        return () => clearTimeout(id)
      },

      waitForCloseDelay({ send, prop }) {
        const id = setTimeout(() => {
          send({ type: "CLOSE_DELAY" })
        }, prop("closeDelay"))

        return () => clearTimeout(id)
      },

      trackPositioning({ context, prop, scope }) {
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

      trackDismissableElement({ send, scope, prop }) {
        const getContentEl = () => dom.getContentEl(scope)
        return trackDismissableElement(getContentEl, {
          type: "popover",
          defer: true,
          exclude: dom.getTriggerEls(scope),
          onDismiss() {
            send({ type: "CLOSE", src: "interact-outside" })
          },
          onInteractOutside: prop("onInteractOutside"),
          onPointerDownOutside: prop("onPointerDownOutside"),
          onFocusOutside(event) {
            event.preventDefault()
            prop("onFocusOutside")?.(event)
          },
        })
      },
    },

    actions: {
      invokeOnClose({ prop }) {
        prop("onOpenChange")?.({ open: false })
      },
      invokeOnOpen({ prop }) {
        prop("onOpenChange")?.({ open: true })
      },
      setIsPointer({ context }) {
        context.set("isPointer", true)
      },
      clearIsPointer({ context }) {
        context.set("isPointer", false)
      },
      reposition({ context, prop, scope, event }) {
        const getPositionerEl = () => dom.getPositionerEl(scope)
        const getTriggerEl = () => dom.getActiveTriggerEl(scope, context.get("triggerValue"))
        getPlacement(getTriggerEl, getPositionerEl, {
          ...prop("positioning"),
          ...event.options,
          defer: true,
          listeners: false,
          onComplete(data) {
            context.set("currentPlacement", data.placement)
          },
        })
      },
      setTriggerValue({ context, event }) {
        if (event.value === undefined) return
        context.set("triggerValue", event.value)
      },
      toggleVisibility({ prop, event, send }) {
        queueMicrotask(() => {
          send({ type: prop("open") ? "CONTROLLED.OPEN" : "CONTROLLED.CLOSE", previousEvent: event })
        })
      },
    },
  },
})
