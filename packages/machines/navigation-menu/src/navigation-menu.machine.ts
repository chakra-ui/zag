import { setup } from "@zag-js/core"
import { trackDismissableElement } from "@zag-js/dismissable"
import { addDomEvent, contains, navigate, raf } from "@zag-js/dom-query"
import type { Point, Rect, Size } from "@zag-js/types"
import { callAll, ensureProps } from "@zag-js/utils"
import * as dom from "./navigation-menu.dom"
import type { NavigationMenuSchema } from "./navigation-menu.types"
import {
  clearAllOpenTimeouts,
  clearCloseTimeout,
  clearOpenTimeout,
  setCloseTimeout,
  setOpenTimeout,
} from "./navigation-menu.utils"

const { createMachine } = setup<NavigationMenuSchema>()

export const machine = createMachine({
  props({ props }) {
    ensureProps(props, ["id"])
    return {
      dir: "ltr",
      openDelay: 200,
      closeDelay: 300,
      orientation: "horizontal",
      defaultValue: "",
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
    }
  },

  computed: {
    open: ({ context }) => context.get("value") != null,
  },

  watch({ track, action, context }) {
    track([() => context.get("value")], () => {
      action(["restoreTabOrder", "setTriggerNode", "syncContentNode", "syncMotionAttribute"])
    })
  },

  refs() {
    return {
      restoreContentTabOrder: undefined,
      contentResizeObserverCleanup: undefined,
      contentDismissableCleanup: undefined,
      contentExitCompleteCleanup: undefined,
      triggerResizeObserverCleanup: undefined,
      closeTimeoutId: null,
      openTimeoutIds: {},
    }
  },

  entry: ["checkViewportNode"],

  exit: ["cleanupObservers"],

  effects: ["trackDocumentResize"],

  initialState() {
    return "idle"
  },

  on: {
    "VALUE.SET": {
      actions: ["setValue"],
    },
    "VIEWPORT.POSITION": {
      actions: ["setViewportPosition"],
    },
    "TRIGGER.POINTERENTER": {
      actions: ["clearCloseTimeout", "setValueWithDelay"],
    },
    "TRIGGER.POINTERLEAVE": [
      {
        actions: ["setCloseTimeout", "resetValueWithDelay"],
      },
    ],
    "TRIGGER.CLICK": [
      {
        guard: "isItemOpen",
        actions: ["deselectValue"],
      },
      {
        actions: ["selectValue"],
      },
    ],
    "CONTENT.FOCUS": {
      actions: ["restoreTabOrder", "focusFirstTabbableEl"],
    },
    "CONTENT.BLUR": {
      actions: ["removeFromTabOrder"],
    },
    "CONTENT.POINTERENTER": {
      actions: ["clearCloseTimeout"],
    },
    "CONTENT.POINTERLEAVE": {
      actions: ["setCloseTimeout"],
    },
    "ITEM.NAVIGATE": {
      actions: ["focusNextLink"],
    },
    "ITEM.CLOSE": {
      actions: ["focusTrigger", "deselectValue"],
    },
    CLOSE: {
      actions: ["clearAllOpenTimeouts", "deselectValue", "focusTriggerIfNeeded", "removeFromTabOrder"],
    },
  },

  states: {
    idle: {},
  },

  implementations: {
    guards: {
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
      setValue({ context, event }) {
        context.set("value", event.value)
      },
      clearCloseTimeout({ refs }) {
        clearCloseTimeout(refs)
      },
      clearAllOpenTimeouts({ refs }) {
        clearAllOpenTimeouts(refs)
      },
      setCloseTimeout({ refs, context, prop }) {
        setCloseTimeout(refs, context, prop)
      },
      resetValueWithDelay({ event, refs }) {
        clearOpenTimeout(refs, event.value)
      },
      setValueWithDelay({ event, prop, context, refs }) {
        // Skip delay if the menu is already open (within grace period)
        const shouldSkipDelay = context.get("value") !== ""

        const openTimeoutId = window.setTimeout(
          () => {
            setTimeout(() => {
              context.set("previousValue", context.get("value"))
              context.set("value", event.value)
            })
          },
          shouldSkipDelay ? 0 : prop("openDelay"),
        )

        setOpenTimeout(refs, event.value, openTimeoutId)
      },
      selectValue: ({ context, event }) => {
        // When selecting item we trigger update immediately
        context.set("previousValue", context.get("value"))
        context.set("value", event.value)
      },
      deselectValue: ({ context }) => {
        // When deselecting, clear immediately to prevent overlap
        context.set("value", "")
        context.set("previousValue", "")
      },

      syncContentNode({ context, scope, refs, send }) {
        refs.get("contentResizeObserverCleanup")?.()
        refs.get("contentDismissableCleanup")?.()
        refs.get("contentExitCompleteCleanup")?.()

        // If there's a previous value, listen for exitcomplete on its content
        const previousValue = context.get("previousValue")
        if (previousValue) {
          const previousContentEl = dom.getContentEl(scope, previousValue)
          const viewportEl = dom.getViewportEl(scope)
          if (previousContentEl) {
            const onExitComplete = () => context.set("previousValue", "")
            refs.set(
              "contentExitCompleteCleanup",
              callAll(
                addDomEvent(previousContentEl, "exitcomplete", onExitComplete),
                addDomEvent(viewportEl, "exitcomplete", onExitComplete),
              ),
            )
          }
        }

        const contentEl = dom.getContentEl(scope, context.get("value"))

        if (!contentEl) return
        context.set("contentNode", contentEl)

        /////////////////////////////////////////////////////////////////////////////////////////

        if (context.get("isViewportRendered")) {
          const contentResizeObserver = dom.trackResizeObserver([contentEl], () => {
            const contentEl = dom.getContentEl(scope, context.get("value"))
            if (!contentEl) return
            context.set("viewportSize", { width: contentEl.offsetWidth, height: contentEl.offsetHeight })
            send({ type: "VIEWPORT.POSITION" })
          })
          refs.set("contentResizeObserverCleanup", contentResizeObserver)
        }

        /////////////////////////////////////////////////////////////////////////////////////////

        const getContentEl = () => {
          return dom.getViewportEl(scope) || dom.getContentEl(scope, context.get("value"))
        }

        const contentDismissable = trackDismissableElement(getContentEl, {
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
              const isRootViewport = contains(dom.getViewportEl(scope), target)
              if (isTrigger || isRootViewport) {
                event.preventDefault()
              }
            }
          },
          onDismiss() {
            send({ type: "CLOSE", value: context.get("value") })
          },
        })

        refs.set("contentDismissableCleanup", contentDismissable)
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

        const listEl = dom.getListEl(scope)
        const triggerResizeObserver = dom.trackResizeObserver([node, listEl], exec)
        refs.set("triggerResizeObserverCleanup", triggerResizeObserver)
      },
      syncMotionAttribute({ context, scope }) {
        if (!context.get("isViewportRendered")) return
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

      focusTriggerIfNeeded({ event, scope }) {
        const value = event.value
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

      checkViewportNode({ context, scope }) {
        context.set("isViewportRendered", !!dom.getViewportEl(scope))
      },

      setViewportPosition({ context, scope }) {
        const triggerNode = context.get("triggerNode")
        const contentNode = context.get("contentNode")

        const rootEl = dom.getRootEl(scope)
        const doc = scope.getDoc()

        const viewportEl = dom.getViewportEl(scope)
        const align = viewportEl?.dataset.align || "center"

        if (contentNode && triggerNode && rootEl) {
          const bodyWidth = doc.documentElement.offsetWidth
          const bodyHeight = doc.documentElement.offsetHeight

          const rootRect = rootEl.getBoundingClientRect()
          const triggerRect = triggerNode.getBoundingClientRect()

          const { offsetWidth, offsetHeight } = contentNode

          // Find the beginning of the position of the menu item
          const startPositionLeft = triggerRect.left - rootRect.left
          const startPositionTop = triggerRect.top - rootRect.top

          // Aligning to specified alignment
          let x = null
          let y = null
          switch (align) {
            case "start":
              x = startPositionLeft
              y = startPositionTop
              break
            case "end":
              x = startPositionLeft - offsetWidth + triggerRect.width
              y = startPositionTop - offsetHeight + triggerRect.height
              break
            default:
              // center
              x = startPositionLeft - offsetWidth / 2 + triggerRect.width / 2
              y = startPositionTop - offsetHeight / 2 + triggerRect.height / 2
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
