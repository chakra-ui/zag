import { createGuards, createMachine, type Params } from "@zag-js/core"
import { isInNestedLayer, trackDismissableElement, type LayerSnapshot } from "@zag-js/dismissable"
import {
  AnimationFrame,
  getPopupActivationDirection,
  isShadowRoot,
  observeChildren,
  raf,
  resizeObserverBorderBox,
  waitForAnimationEnd,
} from "@zag-js/dom-query"
import { trackFocusVisible } from "@zag-js/focus-visible"
import { inline, getPlacement } from "@zag-js/popper"
import { trackSafeArea } from "@zag-js/safe-area"
import * as dom from "./hover-card.dom"
import { getViewportSizeStyle } from "./hover-card.style"
import type { HoverCardSchema, InstantType, OpenChangeReason, Placement, ViewportSize } from "./hover-card.types"
import type { PopupActivationDirection } from "@zag-js/types"

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

  exit: ["endTriggerSwitch"],

  initialState({ prop }) {
    const open = prop("open") || prop("defaultOpen")
    return open ? "open" : "closed"
  },

  refs() {
    return {
      inlineCoords: undefined,
      inlineLines: undefined,
      isInteractionInside: false,
      cancelTriggerSwitch: null,
      awaitingViewportSize: false,
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
          const triggerElement = dom.getTriggerEl(scope, value)
          onTriggerValueChange({ value, triggerElement })
        },
      })),
      activationDirection: bindable<PopupActivationDirection | null>(() => ({ defaultValue: null })),
      previousTriggerValue: bindable<string | null>(() => ({ defaultValue: null })),
      transitioning: bindable<boolean>(() => ({ defaultValue: false })),
      viewportRendered: bindable<boolean>(() => ({ defaultValue: false })),
      viewportSize: bindable<ViewportSize | null>(() => ({ defaultValue: null })),
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
    "TRIGGER_SWITCH.END": {
      actions: ["endTriggerSwitch"],
    },
  },

  states: {
    closed: {
      tags: ["closed"],
      entry: ["clearIsPointer", "clearInteractionInside", "endTriggerSwitch", "clearActivationDirection"],
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
      effects: [
        "trackDismissableElement",
        "trackPositioning",
        "trackViewportSize",
        "trackSafeArea",
        "trackTriggerRemoval",
      ],
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
        "TRIGGER_VALUE.SET": {
          guard: "isNewTriggerValue",
          target: "open.idle",
          actions: ["setActivationDirection", "setPreviousTriggerValue", "setTriggerValue", "startTriggerSwitch"],
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
      isNewTriggerValue: ({ context, event }) => event.value != null && event.value !== context.get("triggerValue"),
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
          getTriggerEl: () => dom.getTriggerEl(scope, context.get("triggerValue")),
          getContentEl: () => dom.getLayerEl(scope, context.get("triggerValue")),
          openedByPointer: () => context.get("isPointer"),
          isTargetInside: (target) => isInNestedLayer(dom.getLayerEl(scope, context.get("triggerValue")), target),
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
        const getTriggerEl = () => dom.getTriggerEl(scope, context.get("triggerValue"))
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
        const getTriggerEl = () => dom.getTriggerEl(scope, context.get("triggerValue"))
        const positioning = prop("positioning")
        return getPlacement(getTriggerEl, getPositionerEl, {
          getArrowElement: () => dom.getArrowEl(scope),
          ...positioning,
          // Triggers are links in prose, which wrap.
          middleware: [inline({ getCoords: () => refs.get("inlineCoords") }), ...(positioning.middleware ?? [])],
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

      trackViewportSize(params) {
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

      trackDismissableElement({ send, scope, prop, context }) {
        const getLayerEl = () => dom.getLayerEl(scope, context.get("triggerValue"))
        return trackDismissableElement(getLayerEl, {
          type: "popover",
          onLayerChange(layer) {
            context.set("layer", layer)
          },
          defer: true,
          getRootNode: scope.getRootNode,
          exclude: dom.getTriggerEls(scope),
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
        if (refs.get("awaitingViewportSize")) return
        const getPositionerEl = () => dom.getPositionerEl(scope)
        const getTriggerEl = () => dom.getTriggerEl(scope, context.get("triggerValue"))
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
      setActivationDirection({ context, event, scope }) {
        const fromEl = dom.getTriggerEl(scope, context.get("triggerValue"))
        const toEl = dom.getTriggerEl(scope, event.value)
        context.set("activationDirection", getPopupActivationDirection(fromEl, toEl))
      },
      clearActivationDirection({ context }) {
        context.set("activationDirection", null)
      },
      setPreviousTriggerValue({ context }) {
        context.set("previousTriggerValue", context.get("triggerValue"))
      },
      startTriggerSwitch({ context, refs, scope, send }) {
        refs.get("cancelTriggerSwitch")?.()
        context.set("transitioning", true)
        const positionerEl = dom.getPositionerEl(scope)
        if (!positionerEl) return
        positionerEl.setAttribute("data-transitioning", "")
        refs.set("awaitingViewportSize", !!dom.getViewportEl(scope))
        const cancel = waitForAnimationEnd(positionerEl, () => send({ type: "TRIGGER_SWITCH.END" }))
        refs.set("cancelTriggerSwitch", cancel)
      },
      endTriggerSwitch({ context, refs }) {
        context.set("previousTriggerValue", null)
        refs.get("cancelTriggerSwitch")?.()
        refs.set("cancelTriggerSwitch", null)
        refs.set("awaitingViewportSize", false)
        context.set("transitioning", false)
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

function setViewportSize(params: Params<HoverCardSchema>, size: ViewportSize) {
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
