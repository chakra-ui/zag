import { ariaHidden } from "@zag-js/aria-hidden"
import { createMachine } from "@zag-js/core"
import { trackDismissableElement } from "@zag-js/dismissable"
import { getInitialFocus, isFocusOutside, raf } from "@zag-js/dom-query"
import { trapFocus } from "@zag-js/focus-trap"
import { preventBodyScroll } from "@zag-js/remove-scroll"
import * as dom from "./dialog.dom"
import type { DialogSchema } from "./dialog.types"

export const machine = createMachine<DialogSchema>({
  props({ props, scope }) {
    const alertDialog = props.role === "alertdialog"
    const initialFocusEl: any = alertDialog ? () => dom.getCloseTriggerEl(scope) : undefined
    const modal = typeof props.modal === "boolean" ? props.modal : true
    return {
      role: "dialog",
      modal,
      trapFocus: modal,
      preventScroll: modal,
      closeOnInteractOutside: modal && !alertDialog,
      closeOnEscape: true,
      restoreFocus: true,
      initialFocusEl,
      ...props,
    }
  },

  initialState({ prop }) {
    const open = prop("open") || prop("defaultOpen")
    return open ? "open" : "closed"
  },

  context({ bindable, prop, scope }) {
    return {
      rendered: bindable<{ title: boolean; description: boolean }>(() => ({
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

  refs() {
    return {
      returnFocusEl: null,
    }
  },

  watch({ track, action, prop }) {
    track([() => prop("open")], () => {
      action(["toggleVisibility"])
    })
  },

  states: {
    open: {
      entry: ["checkRenderedElements", "setReturnFocusEl", "setInitialFocus"],
      effects: ["trackDismissableElement", "trapFocus", "preventScroll", "hideContentBelow"],
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
            actions: ["invokeOnClose", "setFinalFocus"],
          },
        ],
        "TRIGGER_VALUE.SET": {
          actions: ["setTriggerValue"],
        },
      },
    },

    closed: {
      on: {
        "CONTROLLED.OPEN": {
          target: "open",
        },
        OPEN: [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnOpen", "setTriggerValue"],
          },
          {
            target: "open",
            actions: ["invokeOnOpen", "setTriggerValue"],
          },
        ],
        TOGGLE: [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnOpen", "setTriggerValue"],
          },
          {
            target: "open",
            actions: ["invokeOnOpen", "setTriggerValue"],
          },
        ],
        "TRIGGER_VALUE.SET": {
          actions: ["setTriggerValue"],
        },
      },
    },
  },

  implementations: {
    guards: {
      isOpenControlled: ({ prop }) => prop("open") != undefined,
    },

    effects: {
      trackDismissableElement({ scope, send, prop }) {
        const getContentEl = () => dom.getContentEl(scope)
        let restoreFocus = true
        return trackDismissableElement(getContentEl, {
          type: "dialog",
          defer: true,
          getRootNode: scope.getRootNode,
          pointerBlocking: prop("modal"),
          layerStyleTargets: [() => dom.getBackdropEl(scope), () => dom.getPositionerEl(scope)],
          exclude: [dom.getTriggerEl(scope), ...dom.getTriggerEls(scope)].filter(Boolean) as HTMLElement[],
          onInteractOutside(event) {
            prop("onInteractOutside")?.(event)
            if (!prop("closeOnInteractOutside")) {
              event.preventDefault()
            }
            // Keep focus on what the user pressed outside
            restoreFocus = !(event.detail.focusable || event.detail.contextmenu)
          },
          persistentElements: prop("persistentElements"),
          onFocusOutside: prop("onFocusOutside"),
          onPointerDownOutside: prop("onPointerDownOutside"),
          onRequestDismiss: prop("onRequestDismiss"),
          onEscapeKeyDown(event) {
            prop("onEscapeKeyDown")?.(event)
            if (!prop("closeOnEscape")) {
              event.preventDefault()
            }
          },
          onDismiss() {
            send({ type: "CLOSE", src: "interact-outside", restoreFocus })
          },
        })
      },

      preventScroll({ scope, prop }) {
        if (!prop("preventScroll")) return
        return preventBodyScroll(scope.getDoc())
      },

      trapFocus({ scope, prop, context }) {
        if (!prop("trapFocus")) return
        const contentEl = () => dom.getContentEl(scope)
        return trapFocus(contentEl, {
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
      },

      hideContentBelow({ scope, prop }) {
        if (!prop("modal")) return
        const getElements = () => [dom.getContentEl(scope)]
        return ariaHidden(getElements, { defer: true })
      },
    },

    actions: {
      setReturnFocusEl({ refs, scope }) {
        // Read on the next frame, like a focus trap, so an opener that closes (e.g. a menu) has restored focus first
        raf(() => refs.set("returnFocusEl", scope.getActiveElement()))
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

        raf(() => {
          // Don't take focus back from an element the user moved to
          if (isFocusOutside(scope.getActiveElement(), [contentEl])) return
          returnFocusEl?.focus({ preventScroll: true })
        })
      },

      setInitialFocus({ prop, scope }) {
        if (prop("trapFocus")) return
        raf(() => {
          const element = getInitialFocus({
            root: dom.getContentEl(scope),
            getInitialEl: prop("initialFocusEl"),
          })
          if (!element) return
          element.focus({ preventScroll: true })
        })
      },

      checkRenderedElements({ context, scope }) {
        raf(() => {
          context.set("rendered", {
            title: !!dom.getTitleEl(scope),
            description: !!dom.getDescriptionEl(scope),
          })
        })
      },

      invokeOnClose({ prop }) {
        prop("onOpenChange")?.({ open: false })
      },

      invokeOnOpen({ prop }) {
        prop("onOpenChange")?.({ open: true })
      },

      setTriggerValue({ context, event }) {
        if (event.value === undefined) return
        context.set("triggerValue", event.value)
      },

      toggleVisibility({ prop, send, event }) {
        send({
          type: prop("open") ? "CONTROLLED.OPEN" : "CONTROLLED.CLOSE",
          previousEvent: event,
        })
      },
    },
  },
})
