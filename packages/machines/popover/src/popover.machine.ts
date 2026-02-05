import { ariaHidden } from "@zag-js/aria-hidden"
import { createMachine } from "@zag-js/core"
import { trackDismissableElement } from "@zag-js/dismissable"
import { getInitialFocus, proxyTabFocus, raf } from "@zag-js/dom-query"
import { trapFocus } from "@zag-js/focus-trap"
import { getPlacement } from "@zag-js/popper"
import { preventBodyScroll } from "@zag-js/remove-scroll"
import * as dom from "./popover.dom"
import type { Placement, PopoverSchema } from "./popover.types"

export const machine = createMachine<PopoverSchema>({
  props({ props }) {
    return {
      closeOnInteractOutside: true,
      closeOnEscape: true,
      autoFocus: true,
      modal: false,
      portalled: true,
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

  context({ bindable, prop, scope }) {
    return {
      currentPlacement: bindable<Placement | undefined>(() => ({
        defaultValue: undefined,
      })),
      renderedElements: bindable<{ title: boolean; description: boolean }>(() => ({
        defaultValue: { title: true, description: true },
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

  computed: {
    currentPortalled: ({ prop }) => !!prop("modal") || !!prop("portalled"),
  },

  watch({ track, prop, action }) {
    track([() => prop("open")], () => {
      action(["toggleVisibility"])
    })
  },

  entry: ["checkRenderedElements"],

  on: {
    "TRIGGER_VALUE.SET": {
      actions: ["setTriggerValue", "reposition"],
    },
  },

  states: {
    closed: {
      on: {
        "CONTROLLED.OPEN": {
          target: "open",
          actions: ["setInitialFocus"],
        },
        TOGGLE: [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnOpen", "setTriggerValue"],
          },
          {
            target: "open",
            actions: ["invokeOnOpen", "setTriggerValue", "setInitialFocus"],
          },
        ],
        OPEN: [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnOpen", "setTriggerValue"],
          },
          {
            target: "open",
            actions: ["invokeOnOpen", "setTriggerValue", "setInitialFocus"],
          },
        ],
      },
    },

    open: {
      effects: [
        "trapFocus",
        "preventScroll",
        "hideContentBelow",
        "trackPositioning",
        "trackDismissableElement",
        "proxyTabFocus",
      ],
      on: {
        "CONTROLLED.CLOSE": {
          target: "closed",
          actions: ["setFinalFocus"],
        },
        CLOSE: [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnClose"],
          },
          {
            target: "closed",
            actions: ["invokeOnClose", "setFinalFocus"],
          },
        ],
        TOGGLE: [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnClose"],
          },
          {
            target: "closed",
            actions: ["invokeOnClose"],
          },
        ],
        "POSITIONING.SET": {
          actions: ["reposition"],
        },
      },
    },
  },

  implementations: {
    guards: {
      isOpenControlled: ({ prop }) => prop("open") != undefined,
    },
    effects: {
      trackPositioning({ context, prop, scope }) {
        context.set("currentPlacement", prop("positioning").placement)
        const anchorEl = dom.getAnchorEl(scope)
        const getPositionerEl = () => dom.getPositionerEl(scope)
        const getTriggerEl = () => anchorEl ?? dom.getActiveTriggerEl(scope, context.get("triggerValue"))
        return getPlacement(getTriggerEl, getPositionerEl, {
          ...prop("positioning"),
          defer: true,
          onComplete(data) {
            context.set("currentPlacement", data.placement)
          },
        })
      },

      trackDismissableElement({ send, prop, scope }) {
        const getContentEl = () => dom.getContentEl(scope)
        let restoreFocus = true
        return trackDismissableElement(getContentEl, {
          type: "popover",
          pointerBlocking: prop("modal"),
          exclude: dom.getTriggerEls(scope),
          defer: true,
          onEscapeKeyDown(event) {
            prop("onEscapeKeyDown")?.(event)
            if (prop("closeOnEscape")) return
            event.preventDefault()
          },
          onInteractOutside(event) {
            prop("onInteractOutside")?.(event)
            if (event.defaultPrevented) return
            restoreFocus = !(event.detail.focusable || event.detail.contextmenu)
            if (!prop("closeOnInteractOutside")) {
              event.preventDefault()
            }
          },
          onPointerDownOutside: prop("onPointerDownOutside"),
          onFocusOutside: prop("onFocusOutside"),
          persistentElements: prop("persistentElements"),
          onRequestDismiss: prop("onRequestDismiss"),
          onDismiss() {
            send({ type: "CLOSE", src: "interact-outside", restoreFocus })
          },
        })
      },

      proxyTabFocus({ prop, scope, context }) {
        if (prop("modal") || !prop("portalled")) return
        const getContentEl = () => dom.getContentEl(scope)
        return proxyTabFocus(getContentEl, {
          triggerElement: dom.getActiveTriggerEl(scope, context.get("triggerValue")),
          defer: true,
          getShadowRoot: true,
          onFocus(el) {
            el.focus({ preventScroll: true })
          },
        })
      },

      hideContentBelow({ prop, scope, context }) {
        if (!prop("modal")) return
        const getElements = () => [dom.getContentEl(scope), dom.getActiveTriggerEl(scope, context.get("triggerValue"))]
        return ariaHidden(getElements, { defer: true })
      },

      preventScroll({ prop, scope }) {
        if (!prop("modal")) return
        return preventBodyScroll(scope.getDoc())
      },

      trapFocus({ prop, scope }) {
        if (!prop("modal")) return
        const contentEl = () => dom.getContentEl(scope)
        return trapFocus(contentEl, {
          initialFocus: () =>
            getInitialFocus({
              root: dom.getContentEl(scope),
              getInitialEl: prop("initialFocusEl"),
              enabled: prop("autoFocus"),
            }),
          getShadowRoot: true,
        })
      },
    },

    actions: {
      reposition({ event, prop, scope, context }) {
        const anchorEl = dom.getAnchorEl(scope)
        const getPositionerEl = () => dom.getPositionerEl(scope)
        const getTriggerEl = () => anchorEl ?? dom.getActiveTriggerEl(scope, context.get("triggerValue"))
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
        context.set("triggerValue", event.value ?? null)
      },

      checkRenderedElements({ context, scope }) {
        raf(() => {
          Object.assign(context.get("renderedElements"), {
            title: !!dom.getTitleEl(scope),
            description: !!dom.getDescriptionEl(scope),
          })
        })
      },

      setInitialFocus({ prop, scope }) {
        // handoff to `trapFocus` activity for initial focus
        if (prop("modal")) return
        raf(() => {
          const element = getInitialFocus({
            root: dom.getContentEl(scope),
            getInitialEl: prop("initialFocusEl"),
            enabled: prop("autoFocus"),
          })
          element?.focus({ preventScroll: true })
        })
      },

      setFinalFocus({ event, scope, context }) {
        const restoreFocus = event.restoreFocus ?? event.previousEvent?.restoreFocus
        if (restoreFocus != null && !restoreFocus) return
        raf(() => {
          const element = dom.getActiveTriggerEl(scope, context.get("triggerValue"))
          element?.focus({ preventScroll: true })
        })
      },
      invokeOnOpen({ prop, flush }) {
        flush(() => {
          prop("onOpenChange")?.({ open: true })
        })
      },
      invokeOnClose({ prop, flush }) {
        flush(() => {
          prop("onOpenChange")?.({ open: false })
        })
      },
      toggleVisibility({ event, send, prop }) {
        send({ type: prop("open") ? "CONTROLLED.OPEN" : "CONTROLLED.CLOSE", previousEvent: event })
      },
    },
  },
})
