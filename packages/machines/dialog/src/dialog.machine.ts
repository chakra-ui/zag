import { ariaHidden } from "@zag-js/aria-hidden"
import { createMachine } from "@zag-js/core"
import { trackDismissableElement } from "@zag-js/dismissable"
import { getComputedStyle, raf } from "@zag-js/dom-query"
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
      closeOnInteractOutside: !alertDialog,
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

  watch({ track, action, prop }) {
    track([() => prop("open")], () => {
      action(["toggleVisibility"])
    })
  },

  states: {
    open: {
      entry: ["checkRenderedElements", "syncZIndex"],
      effects: ["trackDismissableElement", "trapFocus", "preventScroll", "hideContentBelow"],
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
        "ACTIVE_TRIGGER.SET": {
          actions: ["setActiveTrigger"],
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
            actions: ["invokeOnOpen", "setActiveTrigger"],
          },
          {
            target: "open",
            actions: ["invokeOnOpen", "setActiveTrigger"],
          },
        ],
        TOGGLE: [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnOpen", "setActiveTrigger"],
          },
          {
            target: "open",
            actions: ["invokeOnOpen", "setActiveTrigger"],
          },
        ],
        "ACTIVE_TRIGGER.SET": {
          actions: ["setActiveTrigger"],
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
        return trackDismissableElement(getContentEl, {
          type: "dialog",
          defer: true,
          pointerBlocking: prop("modal"),
          exclude: dom.getTriggerEls(scope),
          onInteractOutside(event) {
            prop("onInteractOutside")?.(event)
            if (!prop("closeOnInteractOutside")) {
              event.preventDefault()
            }
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
            send({ type: "CLOSE", src: "interact-outside" })
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
          initialFocus: prop("initialFocusEl"),
          setReturnFocus: (el) => {
            // If finalFocusEl is provided, use it
            const finalFocusEl = prop("finalFocusEl")?.()
            if (finalFocusEl) return finalFocusEl

            // If there's an active trigger, focus it
            const triggerValue = context.get("triggerValue")
            if (triggerValue) {
              const activeTriggerEl = dom.getActiveTriggerEl(scope, triggerValue)
              if (activeTriggerEl) return activeTriggerEl
            }

            // Fallback: try first available trigger
            const fallbackTrigger = dom.getTriggerEls(scope)[0]
            if (fallbackTrigger) return fallbackTrigger

            // Otherwise, use default behavior
            return el
          },
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
      checkRenderedElements({ context, scope }) {
        raf(() => {
          context.set("rendered", {
            title: !!dom.getTitleEl(scope),
            description: !!dom.getDescriptionEl(scope),
          })
        })
      },

      syncZIndex({ scope }) {
        raf(() => {
          const contentEl = dom.getContentEl(scope)
          if (!contentEl) return

          const styles = getComputedStyle(contentEl)
          const elems = [dom.getPositionerEl(scope), dom.getBackdropEl(scope)]
          elems.forEach((node) => {
            node?.style.setProperty("--z-index", styles.zIndex)
            node?.style.setProperty("--layer-index", styles.getPropertyValue("--layer-index"))
          })
        })
      },

      invokeOnClose({ prop }) {
        prop("onOpenChange")?.({ open: false })
      },

      invokeOnOpen({ prop }) {
        prop("onOpenChange")?.({ open: true })
      },

      setActiveTrigger({ context, event }) {
        context.set("triggerValue", event.value ?? null)
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
