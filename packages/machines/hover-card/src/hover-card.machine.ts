import { createGuards, createMachine } from "@zag-js/core"
import { trackDismissableElement } from "@zag-js/dismissable"
import { addDomEvent, getEventPoint } from "@zag-js/dom-query"
import { getPlacement, getPlacementSide } from "@zag-js/popper"
import { closestSideToPoint, createRect, isPointInPolygon, type Point } from "@zag-js/rect-utils"
import { callAll } from "@zag-js/utils"
import * as dom from "./hover-card.dom"
import type { HoverCardSchema, Placement } from "./hover-card.types"
import { createGraceArea, getOppositeSide } from "./hover-card.utils"

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

  refs() {
    return {
      graceArea: null,
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
      entry: ["clearIsPointer", "clearGraceArea"],
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
          actions: ["setGraceArea"],
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
      effects: ["trackPositioning", "waitForCloseDelay", "trackGraceArea"],
      on: {
        CLOSE_DELAY: [
          {
            guard: and("isOpenControlled", not("isPointerInTransit")),
            actions: ["invokeOnClose"],
          },
          {
            guard: not("isPointerInTransit"),
            target: "closed",
            actions: ["invokeOnClose"],
          },
        ],
        "GRACE_AREA.EXIT": {
          // restart the close delay now that the pointer is no longer
          // moving towards the content (or trigger)
          target: "closing",
          reenter: true,
          actions: ["clearGraceArea"],
        },
        "CONTROLLED.CLOSE": {
          target: "closed",
        },
        "CONTROLLED.OPEN": {
          target: "open",
        },
        POINTER_ENTER: {
          target: "open",
          // no need to invokeOnOpen here because it's still open (but about to close)
          actions: ["setIsPointer", "clearGraceArea"],
        },
        TRIGGER_FOCUS: {
          target: "open",
          actions: ["setTriggerValue"],
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
      isPointerInTransit: ({ refs }) => refs.get("graceArea") != null,
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

      trackGraceArea({ send, refs, scope }) {
        if (!refs.get("graceArea")) return

        const onPointerMove = (event: PointerEvent) => {
          const graceArea = refs.get("graceArea")
          if (!graceArea) return
          if (isPointInPolygon(graceArea, getEventPoint(event))) return
          send({ type: "GRACE_AREA.EXIT" })
        }

        const onPointerLeave = () => {
          // the pointer left the document, so it can no longer be moving
          // towards the content (or trigger)
          send({ type: "GRACE_AREA.EXIT" })
        }

        const doc = scope.getDoc()
        return callAll(addDomEvent(doc, "pointermove", onPointerMove), addDomEvent(doc, "pointerleave", onPointerLeave))
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
          exclude: [dom.getTriggerEl(scope), ...dom.getTriggerEls(scope)].filter(Boolean) as HTMLElement[],
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
      setGraceArea({ context, event, refs, scope }) {
        const point = event.point
        const placement = context.get("currentPlacement")

        let graceArea: Point[] | null = null

        if (point && placement) {
          // protect the path between the element the pointer left and the
          // element it may be moving towards
          const side = getPlacementSide(placement)
          const fromContent = event.src === "content"
          const targetSide = fromContent ? getOppositeSide(side) : side

          const triggerEl = dom.getActiveTriggerEl(scope, context.get("triggerValue"))
          const contentEl = dom.getContentEl(scope)
          const exitedEl = fromContent ? contentEl : triggerEl
          const targetEl = fromContent ? triggerEl : contentEl

          // create the grace area only if the pointer left towards the target
          // element (and not, say, in the opposite direction)
          const exitSide = exitedEl ? closestSideToPoint(createRect(exitedEl.getBoundingClientRect()), point) : null

          if (targetEl && exitSide === targetSide) {
            graceArea = createGraceArea(point, targetSide, targetEl.getBoundingClientRect())
          }
        }

        refs.set("graceArea", graceArea)
      },
      clearGraceArea({ refs }) {
        refs.set("graceArea", null)
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
