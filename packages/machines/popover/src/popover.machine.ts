import { ariaHidden } from "@zag-js/aria-hidden"
import { createMachine, type Params } from "@zag-js/core"
import { trackDismissableElement, type LayerSnapshot } from "@zag-js/dismissable"
import {
  AnimationFrame,
  contains,
  getInitialFocus,
  getPopupActivationDirection,
  waitForAnimationEnd,
  proxyTabFocus,
  raf,
  resizeObserverBorderBox,
} from "@zag-js/dom-query"
import { trapFocus } from "@zag-js/focus-trap"
import { getPlacement } from "@zag-js/popper"
import { preventBodyScroll } from "@zag-js/remove-scroll"
import * as dom from "./popover.dom"
import { getViewportSizeStyle, type ViewportSize } from "./popover.style"
import type { PopupActivationDirection } from "@zag-js/types"
import type { InstantType, Placement, PopoverSchema } from "./popover.types"

export const machine = createMachine<PopoverSchema>({
  props({ props }) {
    return {
      closeOnInteractOutside: true,
      closeOnEscape: true,
      autoFocus: true,
      modal: false,
      restoreFocus: true,
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
      layer: bindable<LayerSnapshot | null>(() => ({
        defaultValue: null,
      })),
      currentPlacement: bindable<Placement | undefined>(() => ({
        defaultValue: undefined,
      })),
      renderedElements: bindable<{ title: boolean; description: boolean; viewport: boolean }>(() => ({
        defaultValue: { title: true, description: true, viewport: false },
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
      activationDirection: bindable<PopupActivationDirection | null>(() => ({
        defaultValue: null,
      })),
      previousTriggerValue: bindable<string | null>(() => ({ defaultValue: null })),
      instant: bindable<InstantType>(() => ({
        defaultValue: null,
      })),
      transitioning: bindable<boolean>(() => ({
        defaultValue: false,
      })),
      viewportSize: bindable<{ width: number; height: number } | null>(() => ({
        defaultValue: null,
      })),
    }
  },

  refs() {
    return {
      renderedFrame: AnimationFrame.create(),
      initialFocusFrame: AnimationFrame.create(),
      cancelTriggerSwitch: null,
      awaitingViewportSize: false,
    }
  },

  watch({ track, prop, action }) {
    track([() => prop("open")], () => {
      action(["toggleVisibility"])
    })
  },

  entry: ["checkRenderedElements"],

  exit: ["cancelFrames"],

  states: {
    closed: {
      on: {
        "TRIGGER_VALUE.SET": {
          actions: ["setTriggerValue"],
        },
        "CONTROLLED.OPEN": {
          target: "open",
          actions: ["setInitialFocus"],
        },
        TOGGLE: [
          {
            guard: "isOpenControlled",
            actions: ["setInstant", "invokeOnOpen", "setTriggerValue"],
          },
          {
            target: "open",
            actions: ["setInstant", "invokeOnOpen", "setTriggerValue", "setInitialFocus"],
          },
        ],
        OPEN: [
          {
            guard: "isOpenControlled",
            actions: ["setInstant", "invokeOnOpen", "setTriggerValue"],
          },
          {
            target: "open",
            actions: ["setInstant", "invokeOnOpen", "setTriggerValue", "setInitialFocus"],
          },
        ],
      },
    },

    open: {
      entry: ["checkRenderedElements"],
      exit: ["cancelInitialFocus", "endTriggerSwitch", "clearActivationDirection"],
      effects: [
        "trapFocus",
        "preventScroll",
        "hideContentBelow",
        "trackDismissableElement",
        "trackPositioning",
        "trackViewportSize",
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
            actions: ["setInstant", "invokeOnClose"],
          },
          {
            target: "closed",
            actions: ["setInstant", "invokeOnClose", "setFinalFocus"],
          },
        ],
        TOGGLE: [
          {
            guard: "isOpenControlled",
            actions: ["setInstant", "invokeOnClose"],
          },
          {
            target: "closed",
            actions: ["setInstant", "invokeOnClose"],
          },
        ],
        "POSITIONING.SET": {
          actions: ["reposition"],
        },
        "TRIGGER_VALUE.SET": {
          guard: "isNewTriggerValue",
          actions: [
            "setActivationDirection",
            "setPreviousTriggerValue",
            "setTriggerValue",
            "startTriggerSwitch",
            "reposition",
          ],
        },
        "TRIGGER_SWITCH.END": {
          actions: ["endTriggerSwitch", "setTriggerChangeInstant"],
        },
      },
    },
  },

  implementations: {
    guards: {
      isOpenControlled: ({ prop }) => prop("open") != undefined,
      isNewTriggerValue: ({ context, event }) => event.value !== context.get("triggerValue"),
    },
    effects: {
      trackPositioning({ context, prop, scope, refs }) {
        context.set("currentPlacement", prop("positioning").placement)
        const anchorEl = dom.getAnchorEl(scope)
        const getPositionerEl = () => dom.getPositionerEl(scope)
        const getTriggerEl = () => anchorEl ?? dom.getTriggerEl(scope, context.get("triggerValue"))
        const positioning = prop("positioning")
        return getPlacement(getTriggerEl, getPositionerEl, {
          getArrowElement: () => dom.getArrowEl(scope),
          ...positioning,
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
            if (!dom.getViewportEl(scope) || !contentEl) return

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

      trackDismissableElement({ send, prop, scope, context, watchEffect }) {
        // pointerBlocking is read at setup, so `modal` has to re-run this
        return watchEffect([() => prop("modal")], () => {
          const getLayerEl = () => dom.getLayerEl(scope, context.get("triggerValue"))
          let restoreFocus = true
          return trackDismissableElement(getLayerEl, {
            type: "popover",
            pointerBlocking: prop("modal"),
            onLayerChange(layer) {
              context.set("layer", layer)
            },
            exclude: dom.getTriggerEls(scope),
            defer: true,
            getRootNode: scope.getRootNode,
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
            onDismiss(event) {
              send({
                type: "CLOSE",
                src: "interact-outside",
                restoreFocus,
                focusVisible: event?.type === "keydown",
                instant: getDismissInstant(event),
              })
            },
          })
        })
      },

      proxyTabFocus({ prop, scope, context, watchEffect }) {
        return watchEffect([() => prop("modal"), () => context.get("triggerValue")], () => {
          if (prop("modal")) return
          const getContentEl = () => dom.getContentEl(scope, context.get("triggerValue"))
          let cleanup: VoidFunction | undefined
          const rafCleanup = raf(() => {
            const triggerEl = dom.getTriggerEl(scope, context.get("triggerValue"))
            const contentEl = getContentEl()
            // only proxy when content is portalled out of the trigger's subtree (else it traps focus)
            if (!triggerEl || !contentEl || contains(triggerEl.parentElement, contentEl)) return
            cleanup = proxyTabFocus(getContentEl, {
              triggerElement: triggerEl,
              getShadowRoot: true,
              onFocus(el) {
                el.focus({ preventScroll: true })
              },
            })
          })
          return () => {
            rafCleanup()
            cleanup?.()
          }
        })
      },

      hideContentBelow({ prop, scope, context, watchEffect }) {
        return watchEffect([() => prop("modal"), () => context.get("triggerValue")], () => {
          if (!prop("modal")) return
          const getElements = () => [
            dom.getLayerEl(scope, context.get("triggerValue")),
            dom.getTriggerEl(scope, context.get("triggerValue")),
          ]
          return ariaHidden(getElements, { defer: true })
        })
      },

      preventScroll({ prop, scope, watchEffect }) {
        return watchEffect([() => prop("modal")], () => {
          if (!prop("modal")) return
          return preventBodyScroll(scope.getDoc())
        })
      },

      trapFocus({ prop, scope, context, watchEffect }) {
        return watchEffect([() => prop("modal"), () => context.get("triggerValue")], () => {
          if (!prop("modal")) return
          const getContentEl = () => dom.getContentEl(scope, context.get("triggerValue"))
          const destroy = trapFocus(getContentEl, {
            preventScroll: true,
            returnFocusOnDeactivate: !!prop("restoreFocus"),
            initialFocus: () =>
              getInitialFocus({
                root: dom.getContentEl(scope, context.get("triggerValue")),
                getInitialEl: prop("initialFocusEl"),
                enabled: prop("autoFocus"),
              }),
            setReturnFocus: (el) => {
              const finalFocusEl = prop("finalFocusEl")?.()
              if (finalFocusEl) return finalFocusEl

              const triggerValue = context.get("triggerValue")
              if (triggerValue) {
                const triggerEl = dom.getTriggerEl(scope, triggerValue)
                if (triggerEl) return triggerEl
              }

              const fallbackTrigger = dom.getTriggerEls(scope)[0]
              if (fallbackTrigger) return fallbackTrigger

              return el
            },
            getShadowRoot: true,
          })

          return (reason) => destroy({ returnFocus: reason === "exit" && !!prop("restoreFocus") && !!prop("modal") })
        })
      },
    },

    actions: {
      reposition({ event, prop, scope, context, refs }) {
        if (refs.get("awaitingViewportSize")) return
        const anchorEl = dom.getAnchorEl(scope)
        const getPositionerEl = () => dom.getPositionerEl(scope)
        const getTriggerEl = () => anchorEl ?? dom.getTriggerEl(scope, context.get("triggerValue"))
        getPlacement(getTriggerEl, getPositionerEl, {
          getArrowElement: () => dom.getArrowEl(scope),
          ...prop("positioning"),
          ...event.options,
          defer: true,
          listeners: false,
          onComplete(data) {
            context.set("currentPlacement", data.placement)
          },
        })
      },

      cancelInitialFocus({ refs }) {
        refs.get("initialFocusFrame").cancel()
      },

      cancelFrames({ refs }) {
        refs.get("renderedFrame").cancel()
        refs.get("initialFocusFrame").cancel()
        refs.get("cancelTriggerSwitch")?.()
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
        context.set("instant", null)
        const positionerEl = dom.getPositionerEl(scope)
        if (!positionerEl) return
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

      setInstant({ context, event }) {
        context.set("instant", event.instant ?? null)
      },
      setTriggerChangeInstant({ context }) {
        context.set("instant", "trigger-change")
      },
      setTriggerValue({ context, event }) {
        if (event.value === undefined) return
        context.set("triggerValue", event.value)
      },

      checkRenderedElements({ context, scope, refs }) {
        refs.get("renderedFrame").request(() => {
          context.set("renderedElements", {
            title: !!dom.getTitleEl(scope),
            description: !!dom.getDescriptionEl(scope),
            viewport: !!dom.getViewportEl(scope),
          })
        })
      },

      setInitialFocus({ prop, scope, refs, context }) {
        // handoff to `trapFocus` activity for initial focus
        if (prop("modal")) return
        refs.get("initialFocusFrame").request(() => {
          const element = getInitialFocus({
            root: dom.getContentEl(scope, context.get("triggerValue")),
            getInitialEl: prop("initialFocusEl"),
            enabled: prop("autoFocus"),
          })
          if (!element) return
          element.focus({ preventScroll: true })
        })
      },

      setFinalFocus({ event, prop, scope, context }) {
        // skip if interact-outside says no restore (e.g. clicked a focusable element)
        const eventRestoreFocus = event.restoreFocus ?? event.previousEvent?.restoreFocus
        if (eventRestoreFocus != null && !eventRestoreFocus) return

        // skip if restoreFocus prop is false
        if (!prop("restoreFocus")) return

        const focusOptions = getReturnFocusOptions(event)

        // not cancelled on exit: restore must still run if the popover unmounts on close
        raf(() => {
          // prefer finalFocusEl if provided
          const finalFocusEl = prop("finalFocusEl")?.()
          if (finalFocusEl) {
            finalFocusEl.focus(focusOptions)
            return
          }

          const element = dom.getTriggerEl(scope, context.get("triggerValue"))
          element?.focus(focusOptions)
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

// Show the focus ring when closed from the keyboard; leave it to the browser otherwise
function getReturnFocusOptions(event: Record<string, any>): FocusOptions {
  const focusVisible = event.focusVisible ?? event.previousEvent?.focusVisible
  return focusVisible ? { preventScroll: true, focusVisible: true } : { preventScroll: true }
}

function setViewportSize(params: Params<PopoverSchema>, size: ViewportSize) {
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

function getDismissInstant(event: Event | undefined): InstantType {
  if (event?.type === "keydown") return "dismiss"
  if (event?.type === "focus.outside") return "focus"
  return null
}
