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
      openDelay: 700,
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

  context({ prop, bindable }) {
    return {
      open: bindable<boolean>(() => ({
        defaultValue: prop("defaultOpen"),
        value: prop("open"),
        onChange(value) {
          prop("onOpenChange")?.({ open: value })
        },
      })),
      currentPlacement: bindable<Placement | undefined>(() => ({
        defaultValue: undefined,
      })),
      isPointer: bindable<boolean>(() => ({
        defaultValue: false,
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
          actions: ["setIsPointer"],
        },
        TRIGGER_FOCUS: {
          target: "opening",
        },
        OPEN: {
          target: "opening",
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
        return getPlacement(dom.getTriggerEl(scope), getPositionerEl, {
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
          exclude: [dom.getTriggerEl(scope)],
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
        getPlacement(dom.getTriggerEl(scope), getPositionerEl, {
          ...prop("positioning"),
          ...event.options,
          defer: true,
          listeners: false,
          onComplete(data) {
            context.set("currentPlacement", data.placement)
          },
        })
      },
      toggleVisibility({ prop, event, send }) {
        queueMicrotask(() => {
          send({ type: prop("open") ? "CONTROLLED.OPEN" : "CONTROLLED.CLOSE", previousEvent: event })
        })
      },
    },
  },
})
