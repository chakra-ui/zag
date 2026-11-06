import { createGuards, createMachine } from "@zag-js/core"
import { isInNestedLayer, trackDismissableElement, type LayerSnapshot } from "@zag-js/dismissable"
import { isShadowRoot, observeChildren } from "@zag-js/dom-query"
import { trackFocusVisible } from "@zag-js/focus-visible"
import { inline, getPlacement } from "@zag-js/popper"
import { trackSafeArea } from "@zag-js/safe-area"
import * as dom from "./hover-card.dom"
import type { HoverCardSchema, InstantType, OpenChangeReason, Placement } from "./hover-card.types"

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

  effects: ["trackFocusVisible"],

  initialState({ prop }) {
    const open = prop("open") || prop("defaultOpen")
    return open ? "open" : "closed"
  },

  refs() {
    return {
      inlineCoords: undefined,
      inlineLines: undefined,
      isInteractionInside: false,
    }
  },

  context({ prop, bindable, scope }) {
    return {
      layer: bindable<LayerSnapshot | null>(() => ({
        defaultValue: null,
      })),
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
      instant: bindable<InstantType>(() => ({
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
    }
  },

  watch({ track, context, action, prop, send }) {
    track([() => prop("disabled")], () => {
      if (prop("disabled")) {
        send({ type: "CLOSE", src: "script" })
      }
    })
    track([() => context.get("open")], () => {
      action(["toggleVisibility"])
    })
    // `context.set` commits asynchronously, so acting on the event resolves the previous trigger.
    track([() => context.get("triggerValue")], () => {
      action(["reposition"])
    })
  },

  on: {
    "TRIGGER_VALUE.SET": {
      actions: ["setTriggerValue"],
    },
  },

  states: {
    closed: {
      tags: ["closed"],
      entry: ["clearIsPointer", "clearInteractionInside"],
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

    // Nothing here reports a close: the card never opened, so there is no open state to close.
    // `toggleVisibility` drives the controlled exit, since `ctx.open` has not changed at this point.
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
            actions: ["toggleVisibility"],
          },
          {
            target: "closed",
          },
        ],
        TRIGGER_BLUR: [
          {
            guard: and("isOpenControlled", not("isPointer")),
            actions: ["toggleVisibility"],
          },
          {
            guard: not("isPointer"),
            target: "closed",
          },
        ],
        CLOSE: [
          {
            guard: "isOpenControlled",
            actions: ["toggleVisibility"],
          },
          {
            target: "closed",
          },
        ],
        "TRIGGER_VALUE.SET": {
          // Stay in opening state but update trigger value (will reposition when opened)
          actions: ["setTriggerValue"],
        },
      },
    },

    // Effects live on the parent so they survive the hop between `idle` and `closing` —
    // rebuilding the safe area tracker there would lose the pointer's position.
    open: {
      tags: ["open"],
      initial: "idle",
      effects: ["trackDismissableElement", "trackPositioning", "trackSafeArea", "trackTriggerRemoval"],
      on: {
        "CONTROLLED.CLOSE": {
          target: "closed",
        },
        CLOSE: [
          {
            guard: "isOpenControlled",
            target: "open.idle",
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
            target: "open.idle",
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
      states: {
        idle: {
          on: {
            POINTER_ENTER: {
              actions: ["setIsPointer"],
            },
            "CONTENT.INTERACT": {
              actions: ["setInteractionInside"],
            },
            "SAFE_AREA.EXIT": {
              guard: and("isPointer", not("isInteractionInside")),
              target: "closing",
            },
          },
        },

        closing: {
          effects: ["waitForCloseDelay"],
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
            "CONTROLLED.OPEN": {
              target: "idle",
            },
            "SAFE_AREA.ENTER": {
              target: "idle",
            },
            POINTER_ENTER: {
              target: "idle",
              // no need to invokeOnOpen here because it's still open (but about to close)
              actions: ["setIsPointer"],
            },
            "CONTENT.POINTER_ENTER": {
              target: "idle",
            },
            "CONTENT.INTERACT": {
              target: "idle",
              actions: ["setInteractionInside"],
            },
            TRIGGER_FOCUS: {
              target: "idle",
              actions: ["setTriggerValue"],
            },
            "TRIGGER_VALUE.SET": {
              target: "idle",
              actions: ["setTriggerValue"],
            },
          },
        },
      },
    },
  },

  implementations: {
    guards: {
      isPointer: ({ context }) => !!context.get("isPointer"),
      isInteractionInside: ({ refs }) => refs.get("isInteractionInside"),
      isOpenControlled: ({ prop }) => prop("open") != null,
    },

    effects: {
      trackFocusVisible({ scope }) {
        return trackFocusVisible({ root: scope.getRootNode?.() })
      },

      waitForOpenDelay({ send, prop, event }) {
        const id = setTimeout(() => {
          // Forward the event that started the warmup, so `onOpenChange` reports what caused it.
          send({ type: "OPEN_DELAY", previousEvent: event })
        }, prop("openDelay"))

        return () => clearTimeout(id)
      },

      waitForCloseDelay({ send, prop, event }) {
        const id = setTimeout(() => {
          send({ type: "CLOSE_DELAY", previousEvent: event })
        }, prop("closeDelay"))

        return () => clearTimeout(id)
      },

      trackSafeArea({ send, scope, context }) {
        return trackSafeArea({
          getTriggerEl: () => dom.getActiveTriggerEl(scope, context.get("triggerValue")),
          getContentEl: () => dom.getContentEl(scope),
          openedByPointer: () => context.get("isPointer"),
          isTargetInside: (target) => isInNestedLayer(dom.getContentEl(scope), target),
          defer: true,
          onLeave() {
            send({ type: "SAFE_AREA.EXIT", src: "pointer-leave" })
          },
          onEnter() {
            send({ type: "SAFE_AREA.ENTER" })
          },
        })
      },

      trackTriggerRemoval({ send, scope, context }) {
        const getTriggerEl = () => dom.getActiveTriggerEl(scope, context.get("triggerValue"))
        const root = scope.getRootNode()
        const node = (isShadowRoot(root) ? root : scope.getDoc().body) as HTMLElement
        return observeChildren(() => (getTriggerEl() ? node : null), {
          defer: true,
          callback() {
            if (!getTriggerEl()) send({ type: "CLOSE" })
          },
        })
      },

      trackPositioning({ context, prop, refs, scope }) {
        if (!context.get("currentPlacement")) {
          context.set("currentPlacement", prop("positioning").placement)
        }
        const getPositionerEl = () => dom.getPositionerEl(scope)
        const getTriggerEl = () => dom.getActiveTriggerEl(scope, context.get("triggerValue"))
        const positioning = prop("positioning")
        return getPlacement(getTriggerEl, getPositionerEl, {
          getArrowElement: () => dom.getArrowEl(scope),
          ...positioning,
          // Triggers are links in prose, which wrap.
          middleware: [inline({ getCoords: () => refs.get("inlineCoords") }), ...(positioning.middleware ?? [])],
          defer: true,
          onComplete(data) {
            context.set("currentPlacement", data.placement)
          },
        })
      },

      trackDismissableElement({ send, scope, prop, context }) {
        const getContentEl = () => dom.getContentEl(scope)
        return trackDismissableElement(getContentEl, {
          type: "popover",
          onLayerChange(layer) {
            context.set("layer", layer)
          },
          defer: true,
          getRootNode: scope.getRootNode,
          exclude: [dom.getTriggerEl(scope), ...dom.getTriggerEls(scope)].filter(Boolean) as HTMLElement[],
          onEscapeKeyDown(event) {
            // Claim the event so the layer's own dismiss does not also fire.
            event.preventDefault()
            send({ type: "CLOSE", src: "escape-key" })
          },
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
      invokeOnClose({ prop, event, context }) {
        const reason = getOpenChangeReason(event)
        if (reason === "escape-key") context.set("instant", "dismiss")
        prop("onOpenChange")?.({ open: false, reason })
      },
      invokeOnOpen({ prop, event, context }) {
        const reason = getOpenChangeReason(event)
        context.set("instant", reason === "trigger-focus" ? "focus" : null)
        prop("onOpenChange")?.({ open: true, reason })
      },
      setIsPointer({ context }) {
        context.set("isPointer", true)
      },
      clearIsPointer({ context }) {
        context.set("isPointer", false)
      },
      setInteractionInside({ refs }) {
        refs.set("isInteractionInside", true)
      },
      clearInteractionInside({ refs }) {
        refs.set("isInteractionInside", false)
      },
      reposition({ context, prop, refs, scope, event }) {
        const getPositionerEl = () => dom.getPositionerEl(scope)
        const getTriggerEl = () => dom.getActiveTriggerEl(scope, context.get("triggerValue"))
        const positioning = { ...prop("positioning"), ...event.options }
        getPlacement(getTriggerEl, getPositionerEl, {
          getArrowElement: () => dom.getArrowEl(scope),
          ...positioning,
          middleware: [inline({ getCoords: () => refs.get("inlineCoords") }), ...(positioning.middleware ?? [])],
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

// The delay events (`OPEN_DELAY`, `CLOSE_DELAY`) are what open and close, so the cause is the
// user event before them.
function getOpenChangeReason(event: HoverCardSchema["event"]): OpenChangeReason | undefined {
  return (event.previousEvent || event).src
}
