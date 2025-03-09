import { setup } from "@zag-js/core"
import { addDomEvent, contains, proxyTabFocus, raf } from "@zag-js/dom-query"
import { trackInteractOutside } from "@zag-js/interact-outside"
import type { Rect, Size } from "@zag-js/types"
import { callAll, ensureProps, setRafTimeout } from "@zag-js/utils"
import { autoReset } from "./auto-reset"
import * as dom from "./navigation-menu.dom"
import type { NavigationMenuSchema } from "./navigation-menu.types"

const { createMachine, guards } = setup<NavigationMenuSchema>()

const { and } = guards

export const machine = createMachine({
  props({ props }) {
    ensureProps(props, ["id"])
    return {
      dir: "ltr",
      openDelay: 200,
      closeDelay: 300,
      orientation: "horizontal",
      defaultValue: null,
      ...props,
    }
  },

  context({ prop, bindable }) {
    return {
      // value tracking
      value: bindable<string | null>(() => ({
        defaultValue: prop("defaultValue"),
        value: prop("value"),
        sync: true,
        onChange(value) {
          prop("onValueChange")?.({ value })
        },
      })),
      previousValue: bindable<string | null>(() => ({
        defaultValue: null,
        sync: true,
      })),

      // viewport
      viewportSize: bindable<Size | null>(() => ({
        defaultValue: null,
        sync: true,
      })),
      isViewportRendered: bindable<boolean>(() => ({
        defaultValue: false,
      })),

      // nodes
      contentNode: bindable<HTMLElement | null>(() => ({
        defaultValue: null,
      })),
      triggerRect: bindable<Rect | null>(() => ({
        defaultValue: null,
        sync: true,
      })),
      triggerNode: bindable<HTMLElement | null>(() => ({
        defaultValue: null,
      })),
    }
  },

  computed: {
    isRootMenu: ({ refs }) => refs.get("parent") == null,
    isSubmenu: ({ refs }) => refs.get("parent") != null,
  },

  watch({ track, action, context }) {
    track([() => context.get("value")], () => {
      action(["restoreTabOrder", "setTriggerNode", "setContentNode", "syncMotionAttribute"])
    })
  },

  refs() {
    return {
      pointerMoveOpenedRef: autoReset(null, 300),
      clickCloseRef: null,
      wasEscapeClose: false,
      tabOrderCleanup: null,
      contentCleanup: null,
      triggerCleanup: null,
      parent: null,
      children: {},
    }
  },

  entry: ["checkViewportNode"],

  exit: ["cleanupObservers", "cleanupAutoResetRef"],

  initialState() {
    return "closed"
  },

  on: {
    "PARENT.SET": {
      target: "open",
      actions: ["setParentMenu", "setTriggerNode"],
    },
    "CHILD.SET": {
      actions: ["setChildMenu"],
    },
    "TRIGGER.FOCUS": {
      actions: ["focusTopLevelEl"],
    },
    "TRIGGER.ENTER": {
      actions: ["clearPreviousValue", "clearCloseRefs"],
    },
    "TRIGGER.CLICK": [
      {
        guard: and("isItemOpen", "isRootMenu"),
        target: "closed",
        actions: ["setPreviousValue", "clearValue", "setClickCloseRef"],
      },
      {
        guard: and("wasItemOpen", "isRootMenu"),
        target: "open",
        actions: ["setPreviousValue", "setValueOnNextTick"],
      },
      {
        reenter: true,
        target: "open",
        actions: ["setPreviousValue", "setValue"],
      },
    ],
    "TRIGGER.MOVE": [
      {
        guard: "isItemOpen",
        actions: ["setPreviousValue", "setValue", "setPointerMoveOpenedRef"],
      },
      {
        guard: "isSubmenu",
        target: "open",
        actions: ["setValue", "setPointerMoveOpenedRef"],
      },
      {
        target: "opening",
        actions: ["setPointerMoveOpenedRef"],
      },
    ],
    "VALUE.SET": {
      actions: ["setValue"],
    },
  },

  states: {
    closed: {
      entry: ["cleanupObservers", "propagateClose"],
      on: {
        "TRIGGER.LEAVE": {
          actions: ["clearPointerMoveRef"],
        },
      },
    },

    opening: {
      effects: ["waitForOpenDelay"],
      on: {
        "OPEN.DELAY": {
          target: "open",
          actions: ["setPreviousValue", "setValue"],
        },
        "TRIGGER.LEAVE": {
          target: "closed",
          actions: ["setPreviousValue", "clearValue", "clearPointerMoveRef"],
        },
        "CONTENT.FOCUS": {
          actions: ["focusContent", "restoreTabOrder"],
        },
        "LINK.FOCUS": {
          actions: ["focusLink"],
        },
      },
    },

    open: {
      tags: ["open"],
      effects: ["trackEscapeKey", "trackInteractionOutside", "preserveTabOrder"],
      on: {
        "CONTENT.LEAVE": {
          target: "closing",
        },
        "TRIGGER.LEAVE": {
          target: "closing",
          actions: ["clearPointerMoveRef"],
        },
        "CONTENT.FOCUS": {
          actions: ["focusContent", "restoreTabOrder"],
        },
        "LINK.FOCUS": {
          actions: ["focusLink"],
        },
        "CONTENT.DISMISS": {
          target: "closed",
          actions: ["focusTrigger", "clearValue", "clearPointerMoveRef"],
        },
        "CONTENT.ENTER": {
          actions: ["restoreTabOrder"],
        },
        "ROOT.CLOSE": {
          // clear the previous value so indicator doesn't animate
          actions: ["clearPreviousValue", "cleanupObservers"],
        },
      },
    },

    closing: {
      tags: ["open"],
      effects: ["trackInteractionOutside", "waitForCloseDelay"],
      on: {
        "CLOSE.DELAY": {
          target: "closed",
          actions: ["clearValue"],
        },
        "CONTENT.DISMISS": {
          target: "closed",
          actions: ["focusTrigger", "clearValue", "clearPointerMoveRef"],
        },
        "CONTENT.ENTER": {
          target: "open",
          actions: ["restoreTabOrder"],
        },
      },
    },
  },

  implementations: {
    guards: {
      isItemOpen: ({ context, event }) => context.get("value") === event.value,
      wasItemOpen: ({ context, event }) => context.get("previousValue") === event.value,
      isRootMenu: ({ refs }) => refs.get("parent") == null,
      isSubmenu: ({ refs }) => refs.get("parent") != null,
    },

    effects: {
      waitForOpenDelay: ({ send, prop, event }) => {
        return setRafTimeout(() => {
          send({ type: "OPEN.DELAY", value: event.value })
        }, prop("openDelay"))
      },
      waitForCloseDelay: ({ send, prop, event }) => {
        return setRafTimeout(() => {
          send({ type: "CLOSE.DELAY", value: event.value })
        }, prop("closeDelay"))
      },
      preserveTabOrder({ context, scope, refs }) {
        if (!context.get("isViewportRendered")) return
        const value = context.get("value")
        if (value == null) return
        const contentEl = () => dom.getContentEl(scope, value)
        return proxyTabFocus(contentEl, {
          triggerElement: dom.getTriggerEl(scope, value),
          onFocusEnter() {
            refs.get("tabOrderCleanup")?.()
          },
        })
      },
      trackInteractionOutside({ context, computed, refs, send, scope }) {
        if (context.get("value") == null) return
        if (computed("isSubmenu")) return

        const getContentEl = () =>
          context.get("isViewportRendered") ? dom.getViewportEl(scope) : dom.getContentEl(scope, context.get("value")!)

        return trackInteractOutside(getContentEl, {
          defer: true,
          onFocusOutside(event) {
            // remove tabbable elements from tab order
            refs.get("tabOrderCleanup")?.()
            refs.set("tabOrderCleanup", removeFromTabOrder(dom.getTabbableEls(scope, context.get("value")!)))

            const { target } = event.detail.originalEvent
            const rootEl = dom.getRootMenuEl(scope)
            if (contains(rootEl, target)) event.preventDefault()
          },
          onPointerDownOutside(event) {
            const { target } = event.detail.originalEvent

            const topLevelEls = dom.getTopLevelEls(scope)
            const isTrigger = topLevelEls.some((item) => contains(item, target))

            const viewportEl = dom.getViewportEl(scope)
            const isRootViewport = computed("isRootMenu") && contains(viewportEl, target)
            if (isTrigger || isRootViewport) event.preventDefault()
          },
          onInteractOutside(event) {
            if (event.defaultPrevented) return
            send({ type: "CONTENT.DISMISS", src: "interact-outside" })
          },
        })
      },

      trackEscapeKey({ computed, refs, send, scope }) {
        if (computed("isSubmenu")) return
        const onKeyDown = (evt: KeyboardEvent) => {
          if (evt.isComposing) return
          if (evt.key !== "Escape") return
          refs.set("wasEscapeClose", true)
          send({ type: "CONTENT.DISMISS", src: "key.esc" })
        }
        return addDomEvent(scope.getDoc(), "keydown", onKeyDown)
      },
    },

    actions: {
      clearCloseRefs({ refs }) {
        refs.set("clickCloseRef", null)
        refs.set("wasEscapeClose", false)
      },
      setPointerMoveOpenedRef({ refs, event }) {
        refs.get("pointerMoveOpenedRef").set(event.value)
      },
      clearPointerMoveRef({ refs }) {
        refs.get("pointerMoveOpenedRef").set(null)
      },
      cleanupObservers({ refs }) {
        refs.get("contentCleanup")?.()
        refs.get("triggerCleanup")?.()
        refs.get("tabOrderCleanup")?.()
      },
      cleanupAutoResetRef({ refs }) {
        refs.get("pointerMoveOpenedRef").cleanup()
      },

      setContentNode({ context, scope, refs }) {
        const value = context.get("value")
        const node = value != null ? dom.getContentEl(scope, value) : null

        // set node
        if (!node) return
        context.set("contentNode", node)

        if (!context.get("isViewportRendered")) return

        // cleanup
        refs.get("contentCleanup")?.()
        const exec = () => {
          const size = { width: node.offsetWidth, height: node.offsetHeight }
          context.set("viewportSize", size)
        }
        refs.set("contentCleanup", dom.trackResizeObserver(node, exec))
      },

      setTriggerNode({ context, scope, refs }) {
        const value = context.get("value")
        const node = value != null ? dom.getTriggerEl(scope, value) : null

        // set node
        if (!node) return
        context.set("triggerNode", node)

        // cleanup
        refs.get("triggerCleanup")?.()
        const exec = () => {
          const rect = { x: node.offsetLeft, y: node.offsetTop, width: node.offsetWidth, height: node.offsetHeight }
          context.set("triggerRect", rect)
        }

        const indicatorTrackEl = dom.getIndicatorTrackEl(scope)
        refs.set(
          "triggerCleanup",
          callAll(dom.trackResizeObserver(node, exec), dom.trackResizeObserver(indicatorTrackEl, exec)),
        )
      },
      syncMotionAttribute({ context, scope, computed }) {
        if (!context.get("isViewportRendered")) return
        if (computed("isSubmenu")) return
        dom.setMotionAttr(scope, context.get("value"), context.get("previousValue"))
      },
      setClickCloseRef({ refs, event }) {
        refs.set("clickCloseRef", event.value)
      },
      checkViewportNode({ context, scope }) {
        context.set("isViewportRendered", !!dom.getViewportEl(scope))
      },
      setPreviousValue({ context }) {
        context.set("previousValue", context.get("value"))
      },
      clearPreviousValue({ context }) {
        context.set("previousValue", null)
      },
      setValue({ context, event }) {
        context.set("value", event.value)
      },
      setValueOnNextTick({ context, event }) {
        raf(() => {
          context.set("value", event.value)
        })
      },
      clearValue({ context }) {
        context.set("value", null)
      },
      focusTopLevelEl({ event, scope }) {
        const value = event.value
        if (event.target === "next") dom.getNextTopLevelEl(scope, value)?.focus()
        else if (event.target === "prev") dom.getPrevTopLevelEl(scope, value)?.focus()
        else if (event.target === "first") dom.getFirstTopLevelEl(scope)?.focus()
        else if (event.target === "last") dom.getLastTopLevelEl(scope)?.focus()
        else dom.getTriggerEl(scope, value)?.focus()
      },
      focusLink({ event, scope }) {
        const value = event.value
        if (event.target === "next") dom.getNextLinkEl(scope, value, event.node)?.focus()
        else if (event.target === "prev") dom.getPrevLinkEl(scope, value, event.node)?.focus()
        else if (event.target === "first") dom.getFirstLinkEl(scope, value)?.focus()
        else if (event.target === "last") dom.getLastLinkEl(scope, value)?.focus()
      },
      focusContent({ event, scope }) {
        raf(() => {
          const tabbableEls = dom.getTabbableEls(scope, event.value)
          tabbableEls[0]?.focus()
        })
      },
      focusTrigger({ context, scope }) {
        if (context.get("value") == null) return
        const contentEl = dom.getContentEl(scope, context.get("value")!)
        if (!contains(contentEl, scope.getActiveElement())) return
        context.get("triggerNode")?.focus()
      },
      restoreTabOrder({ refs }) {
        refs.get("tabOrderCleanup")?.()
      },
      setParentMenu({ refs, event }) {
        refs.set("parent", event.parent)
      },
      setChildMenu({ refs, event }) {
        refs.set("children", { ...refs.get("children"), [event.id]: event.value })
      },
      propagateClose({ refs, prop }) {
        const menus = Object.values(refs.get("children"))
        menus.forEach((child) => {
          child?.send({ type: "ROOT.CLOSE", src: prop("id")! })
        })
      },
    },
  },
})

function removeFromTabOrder(nodes: HTMLElement[]) {
  nodes.forEach((node) => {
    node.dataset.tabindex = node.getAttribute("tabindex") || ""
    node.setAttribute("tabindex", "-1")
  })
  return () => {
    nodes.forEach((node) => {
      if (node.dataset.tabindex == null) return
      const prevTabIndex = node.dataset.tabindex
      node.setAttribute("tabindex", prevTabIndex)
      delete node.dataset.tabindex
      if (node.getAttribute("tabindex") === "") node.removeAttribute("tabindex")
    })
  }
}
