import { setup } from "@zag-js/core"
import { addDomEvent, contains, navigate, raf } from "@zag-js/dom-query"
import type { Point, Rect, Size } from "@zag-js/types"
import { callAll, ensureProps } from "@zag-js/utils"
import { trackDismissableElement } from "@zag-js/dismissable"
import * as dom from "./navigation-menu.dom"
import type { NavigationMenuSchema, NavigationMenuService } from "./navigation-menu.types"
import { autoReset } from "./utils/auto-reset"
import { debounceFn } from "./utils/debounce-fn"

const { createMachine, guards } = setup<NavigationMenuSchema>()

const { not } = guards

export const machine = createMachine({
  props({ props }) {
    ensureProps(props, ["id"])
    return {
      dir: "ltr",
      openDelay: 200,
      closeDelay: 300,
      orientation: "horizontal",
      defaultValue: "",
      viewportAlign: "center",
      ...props,
    }
  },

  context({ prop, bindable }) {
    return {
      // value tracking
      value: bindable<string>(() => ({
        defaultValue: prop("defaultValue"),
        value: prop("value"),
        sync: true,
        onChange(value) {
          prop("onValueChange")?.({ value })
        },
      })),
      previousValue: bindable<string>(() => ({
        defaultValue: "",
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
      viewportPosition: bindable<Point | null>(() => ({
        defaultValue: null,
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

      isSubmenu: bindable<boolean>(() => ({
        defaultValue: false,
      })),

      // timers + event trackers
      isDelaySkipped: autoReset(bindable, () => ({
        defaultValue: false,
        resetAfter: 300,
        sync: true,
      })),
      pointerMoveOpenedValue: autoReset(bindable, () => ({
        defaultValue: "",
        resetAfter: 300,
        sync: true,
      })),
      clickCloseValue: bindable<string | null>(() => ({
        defaultValue: null,
      })),
      escapeCloseValue: bindable<string | null>(() => ({
        defaultValue: null,
      })),
    }
  },

  computed: {
    isRootMenu: ({ refs, context }) => refs.get("parent") == null && !context.get("isSubmenu"),
    isSubmenu: ({ refs, context }) => refs.get("parent") != null && context.get("isSubmenu"),
    open: ({ context }) => context.get("value") != null,
  },

  watch({ track, action, context }) {
    track([() => context.get("value")], () => {
      action(["restoreTabOrder", "setTriggerNode", "syncContentNode", "syncMotionAttribute"])
    })
  },

  refs({ context, prop }) {
    return {
      restoreContentTabOrder: undefined,
      contentResizeObserverCleanup: undefined,
      contentDismissableCleanup: undefined,
      contentExitCompleteCleanup: undefined,
      triggerResizeObserverCleanup: undefined,
      parent: null,
      children: {},
      setValue: debounceFn(
        (val) => {
          // passing `undefined` meant to reset the debounce timer
          if (typeof val === "string") {
            // If we're rapidly switching (setting a new value while previous animation is still running)
            // clear previousValue immediately to prevent overlap
            const currentValue = context.get("value")
            const previousValue = context.get("previousValue")

            if (previousValue && currentValue && val && val !== currentValue) {
              context.set("previousValue", "")
            }

            context.set("previousValue", context.get("value"))
            context.set("value", val)
          }
        },
        () => {
          const open = context.get("value") !== ""
          return open || context.get("isDelaySkipped") ? 150 : prop("openDelay")
        },
      ),
    }
  },

  entry: ["checkViewportNode", "syncContentNode"],

  exit: ["cleanupObservers"],

  effects: ["trackDocumentResize"],

  initialState() {
    return "idle"
  },

  on: {
    "PARENT.SET": {
      actions: ["setParentMenu", "setTriggerNode"],
    },
    "CHILD.SET": {
      actions: ["setChildMenu"],
    },
    "VIEWPORT.POSITION": {
      actions: ["setViewportPosition"],
    },
    "TRIGGER.POINTERENTER": {
      actions: ["clearClickCloseValue", "clearEscapeCloseValue", "clearValueWithDelay"],
    },
    "TRIGGER.POINTERMOVE": [
      {
        guard: "isSubmenu",
        actions: ["setValue", "setPointerMoveOpenedValue"],
      },
      {
        actions: ["setValueWithDelay", "setPointerMoveOpenedValue"],
      },
    ],
    "TRIGGER.POINTERLEAVE": [
      {
        guard: "isSubmenu",
        actions: ["clearPointerMoveOpenedValue"],
      },
      {
        actions: ["setDelaySkipped", "resetValueWithDelay", "clearPointerMoveOpenedValue"],
      },
    ],
    "TRIGGER.CLICK": [
      {
        guard: "isItemOpen",
        actions: ["deselectValue", "setClickCloseValue"],
      },
      {
        actions: ["selectValue", "setClickCloseValue"],
      },
    ],
    "CONTENT.FOCUS": {
      actions: ["restoreTabOrder", "focusFirstTabbableEl"],
    },
    "CONTENT.BLUR": {
      actions: ["removeFromTabOrder"],
    },
    "CONTENT.POINTERENTER": {
      guard: not("isSubmenu"),
      actions: ["clearValueWithDelay"],
    },
    "CONTENT.POINTERLEAVE": {
      guard: not("isSubmenu"),
      actions: ["resetValueWithDelay"],
    },
    "ITEM.NAVIGATE": {
      actions: ["focusNextLink"],
    },
    "ITEM.CLOSE": {
      actions: ["focusTrigger", "deselectValue"],
    },
    "CONTENT.ESCAPE_KEYDOWN": {
      actions: ["focusTrigger", "deselectValue", "setEscapeCloseValue"],
    },
    "ROOT.CLOSE": {
      actions: ["closeRootMenu"],
    },
    CLOSE: {
      actions: ["deselectValue", "focusTriggerIfNeeded", "removeFromTabOrder"],
    },
  },

  states: {
    idle: {},
  },

  implementations: {
    guards: {
      isRootMenu: ({ computed }) => computed("isRootMenu"),
      isSubmenu: ({ computed }) => computed("isSubmenu"),
      isItemOpen: ({ context, event }) => context.get("value") === event.value,
    },

    effects: {
      trackDocumentResize({ scope, send }) {
        const doc = scope.getDoc()
        return dom.trackResizeObserver([doc.body, dom.getRootEl(scope)], () => {
          send({ type: "VIEWPORT.POSITION" })
        })
      },
    },

    actions: {
      setClickCloseValue({ context, event }) {
        context.set("clickCloseValue", event.value)
      },
      clearClickCloseValue({ context }) {
        context.set("clickCloseValue", null)
      },
      clearEscapeCloseValue({ context }) {
        context.set("escapeCloseValue", null)
      },
      setValue({ context, event }) {
        context.set("value", event.value)
      },
      clearValue({ context }) {
        context.set("value", "")
        // Also clear previousValue
        context.set("previousValue", "")
      },
      setPointerMoveOpenedValue({ context, event }) {
        context.set("pointerMoveOpenedValue", event.value)
      },
      clearPointerMoveOpenedValue({ context }) {
        context.set("pointerMoveOpenedValue", "")
      },
      setDelaySkipped({ context }) {
        context.set("isDelaySkipped", true)
      },
      resetValueWithDelay({ refs }) {
        refs.get("setValue")("")
      },
      setValueWithDelay({ refs, event }) {
        // Cancel any pending setValue operations before setting new value
        refs.get("setValue")()
        refs.get("setValue")(event.value)
      },
      clearValueWithDelay({ refs }) {
        refs.get("setValue")()
      },
      selectValue: ({ context, event }) => {
        if (context.get("isSubmenu")) {
          context.set("value", event.value)
        } else {
          // When selecting item we trigger update immediately
          context.set("previousValue", context.get("value"))
          context.set("value", event.value)
        }
      },
      deselectValue: ({ context }) => {
        if (context.get("isSubmenu")) {
          context.set("value", "")
        } else {
          // When deselecting, clear immediately to prevent overlap
          context.set("value", "")
          context.set("previousValue", "")
        }
      },

      syncContentNode({ context, scope, refs, send, computed }) {
        refs.get("contentResizeObserverCleanup")?.()
        refs.get("contentDismissableCleanup")?.()
        refs.get("contentExitCompleteCleanup")?.()

        // If there's a previous value, listen for exitcomplete on its content
        const previousValue = context.get("previousValue")
        if (previousValue) {
          const previousContentEl = dom.getContentEl(scope, previousValue)
          if (previousContentEl) {
            const onExitComplete = () => context.set("previousValue", "")
            refs.set("contentExitCompleteCleanup", addDomEvent(previousContentEl, "exitcomplete", onExitComplete))
          }
        }

        const contentEl = dom.getContentEl(scope, context.get("value"))

        if (!contentEl) return
        context.set("contentNode", contentEl)

        if (context.get("isViewportRendered")) {
          refs.set(
            "contentResizeObserverCleanup",
            dom.trackResizeObserver([contentEl], () => {
              context.set("viewportSize", { width: contentEl.offsetWidth, height: contentEl.offsetHeight })
              send({ type: "VIEWPORT.POSITION" })
            }),
          )
        }

        const getContentEl = () =>
          context.get("isViewportRendered") ? dom.getViewportEl(scope) : dom.getContentEl(scope, context.get("value"))
        refs.set(
          "contentDismissableCleanup",
          trackDismissableElement(getContentEl, {
            defer: true,
            onFocusOutside(event) {
              const target = event.detail.target as HTMLElement

              if (
                target.matches("[data-scope=navigation-menu][data-part=trigger]") ||
                target.matches("[data-trigger-proxy]")
              ) {
                event.preventDefault()
              }

              if (!event.defaultPrevented) {
                send({ type: "CONTENT.BLUR" })
                // Only dismiss content when focus moves outside of the menu
                if (contains(dom.getRootEl(scope), target)) {
                  event.preventDefault()
                }
              }
            },

            onPointerDownOutside(event) {
              const target = event.detail.target as HTMLElement
              if (!event.defaultPrevented) {
                const isTrigger = dom.getTriggerEls(scope).some((node) => node.contains(target))
                const isRootViewport = computed("isRootMenu") && contains(dom.getViewportEl(scope), target)
                if (isTrigger || isRootViewport || !computed("isRootMenu")) {
                  event.preventDefault()
                }
              }
            },
            onEscapeKeyDown(event) {
              if (!event.defaultPrevented) {
                send({ type: "CONTENT.ESCAPE_KEYDOWN" })
              }
            },
            onDismiss() {
              send({ type: "ROOT.CLOSE" })
            },
          }),
        )
      },

      setTriggerNode({ context, scope, refs }) {
        refs.get("triggerResizeObserverCleanup")?.()

        const node = dom.getTriggerEl(scope, context.get("value"))
        if (!node) return

        context.set("triggerNode", node)

        const exec = () => {
          const rect = { x: node.offsetLeft, y: node.offsetTop, width: node.offsetWidth, height: node.offsetHeight }
          context.set("triggerRect", rect)
        }

        const indicatorTrackEl = dom.getIndicatorTrackEl(scope)
        refs.set("triggerResizeObserverCleanup", callAll(dom.trackResizeObserver([node, indicatorTrackEl], exec)))
      },
      syncMotionAttribute({ context, scope, computed }) {
        if (!context.get("isViewportRendered")) return
        if (computed("isSubmenu")) return
        dom.setMotionAttr(scope, context.get("value"), context.get("previousValue"))
      },

      focusFirstTabbableEl({ event, scope, context }) {
        raf(() => {
          const value = event.value || context.get("value")
          const candidates = dom.getTabbableEls(scope, value)
          const elements = event.side === "start" ? candidates : candidates.reverse()
          if (elements.length) dom.focusFirst(scope, elements)
        })
      },

      focusNextLink({ event, scope }) {
        const activeEl = scope.getActiveElement()
        const linkEls = dom.getLinkEls(scope, event.value)
        if (activeEl == null || !linkEls.includes(activeEl)) return
        const el = navigate(linkEls, activeEl, { key: event.key, loop: false })
        el?.focus()
      },

      focusTrigger({ scope, event, context }) {
        const value = event.value ?? context.get("value")
        dom.getTriggerEl(scope, value)?.focus()
      },

      focusTriggerIfNeeded({ context, event, scope }) {
        const value = event.value ?? context.get("value")
        const contentEl = dom.getContentEl(scope, value)
        if (!contains(contentEl, scope.getActiveElement())) return
        dom.getTriggerEl(scope, value)?.focus()
      },

      removeFromTabOrder({ event, scope, refs, context }) {
        const value = event.value ?? context.get("value")
        const candidates = dom.getTabbableEls(scope, value)
        if (candidates.length) refs.set("restoreContentTabOrder", dom.removeFromTabOrder(candidates))
      },
      restoreTabOrder({ refs }) {
        refs.get("restoreContentTabOrder")?.()
      },

      cleanupObservers({ refs }) {
        refs.get("contentResizeObserverCleanup")?.()
        refs.get("contentDismissableCleanup")?.()
        refs.get("triggerResizeObserverCleanup")?.()
        refs.get("restoreContentTabOrder")?.()
        refs.get("contentExitCompleteCleanup")?.()
      },

      setParentMenu({ refs, event, context }) {
        refs.set("parent", event.parent)
        context.set("isSubmenu", true)
      },
      setChildMenu({ refs, event }) {
        refs.set("children", { ...refs.get("children"), [event.id]: event.value })
      },
      closeRootMenu({ refs, send }) {
        send({ type: "CLOSE" })
        closeRootMenu({ parent: refs.get("parent") })
      },

      checkViewportNode({ context, scope }) {
        context.set("isViewportRendered", !!dom.getViewportEl(scope))
      },

      setViewportPosition: ({ context, scope }) => {
        const triggerNode = context.get("triggerNode")
        const contentNode = context.get("contentNode")
        const rootNavigationMenu = !context.get("isSubmenu") ? dom.getRootEl(scope) : null

        const viewportEl = dom.getViewportEl(scope)
        const align = viewportEl?.dataset.align || "center"

        if (contentNode && triggerNode && rootNavigationMenu) {
          const bodyWidth = document.documentElement.offsetWidth
          const bodyHeight = document.documentElement.offsetHeight
          const rootRect = rootNavigationMenu.getBoundingClientRect()
          const rect = triggerNode.getBoundingClientRect()
          const { offsetWidth, offsetHeight } = contentNode

          // Find the beginning of the position of the menu item
          const startPositionLeft = rect.left - rootRect.left
          const startPositionTop = rect.top - rootRect.top

          // Aligning to specified alignment
          let x = null
          let y = null
          switch (align) {
            case "start":
              x = startPositionLeft
              y = startPositionTop
              break
            case "end":
              x = startPositionLeft - offsetWidth + rect.width
              y = startPositionTop - offsetHeight + rect.height
              break
            default:
              // center
              x = startPositionLeft - offsetWidth / 2 + rect.width / 2
              y = startPositionTop - offsetHeight / 2 + rect.height / 2
          }

          const screenOffset = 10

          // Do not let go of the left side of the screen
          if (x + rootRect.left < screenOffset) {
            x = screenOffset - rootRect.left
          }

          // Now also check the right side of the screen
          const rightOffset = x + rootRect.left + offsetWidth
          if (rightOffset > bodyWidth - screenOffset) {
            x -= rightOffset - bodyWidth + screenOffset

            // Recheck the left side of the screen
            if (x < screenOffset - rootRect.left) {
              // Just set the menu to the full width of the screen
              x = screenOffset - rootRect.left
            }
          }

          // Do not let go of the top side of the screen
          if (y + rootRect.top < screenOffset) {
            y = screenOffset - rootRect.top
          }

          // Now also check the bottom side of the screen
          const bottomOffset = y + rootRect.top + offsetHeight
          if (bottomOffset > bodyHeight - screenOffset) {
            y -= bottomOffset - bodyHeight + screenOffset

            // Recheck the top side of the screen
            if (y < screenOffset - rootRect.top) {
              // Just set the menu to the full height of the screen
              y = screenOffset - rootRect.top
            }
          }

          // Possible blurring font with decimal values
          x = Math.round(x)
          y = Math.round(y)

          context.set("viewportPosition", { x, y })
        }
      },
    },
  },
})

function closeRootMenu(ctx: { parent: NavigationMenuService | null }) {
  let parent = ctx.parent
  while (parent && parent.context.get("isSubmenu")) {
    parent = parent.refs.get("parent")
  }
  parent?.send({ type: "CLOSE" })
}
