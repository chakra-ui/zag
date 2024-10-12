import { createMachine, guards, ref } from "@zag-js/core"
import { addDomEvent } from "@zag-js/dom-event"
import { contains, proxyTabFocus, raf } from "@zag-js/dom-query"
import { trackInteractOutside } from "@zag-js/interact-outside"
import { callAll, cast, compact } from "@zag-js/utils"
import { dom, trackResizeObserver } from "./navigation-menu.dom"
import type { MachineContext, MachineState, UserDefinedContext } from "./navigation-menu.types"

const { and } = guards

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "navigation-menu",

      context: {
        // value tracking
        value: null,
        previousValue: null,
        // viewport
        viewportSize: null,
        isViewportRendered: false,
        // timings
        openDelay: 200,
        closeDelay: 300,
        // orientation
        orientation: "horizontal",
        // nodes for measurement
        activeTriggerRect: null,
        activeContentNode: null,
        activeTriggerNode: null,
        // close refs
        wasEscapeCloseRef: false,
        wasClickCloseRef: null,
        hasPointerMoveOpenedRef: null,
        // cleanup functions
        activeContentCleanup: null,
        activeTriggerCleanup: null,
        tabOrderCleanup: null,
        // support nesting
        parentMenu: null,
        childMenus: cast(ref({})),
        ...ctx,
      },

      computed: {
        isRootMenu: (ctx) => ctx.parentMenu == null,
        isSubmenu: (ctx) => ctx.parentMenu != null,
      },

      watch: {
        value: [
          "restoreTabOrder",
          "setActiveTriggerNode",
          "syncTriggerRectObserver",
          "setActiveContentNode",
          "syncContentRectObserver",
          "syncMotionAttribute",
        ],
      },

      initial: "closed",

      entry: ["checkViewportNode"],
      exit: ["cleanupObservers"],

      on: {
        SET_PARENT: {
          target: "open",
          actions: ["setParentMenu", "setActiveTriggerNode", "syncTriggerRectObserver"],
        },
        SET_CHILD: {
          actions: ["setChildMenu"],
        },
        TRIGGER_CLICK: [
          {
            guard: and("isItemOpen", "isRootMenu"),
            actions: ["clearValue", "setClickCloseRef"],
          },
          {
            target: "open",
            actions: ["setValue", "setClickCloseRef"],
          },
        ],
        TRIGGER_FOCUS: {
          actions: ["focusTopLevelEl"],
        },
      },

      states: {
        closed: {
          entry: ["cleanupObservers", "propagateClose"],
          on: {
            TRIGGER_ENTER: {
              actions: ["clearCloseRefs"],
            },
            TRIGGER_MOVE: [
              {
                guard: "isSubmenu",
                target: "open",
                actions: ["setValue"],
              },
              {
                target: "opening",
                actions: ["setPointerMoveRef"],
              },
            ],
          },
        },

        opening: {
          after: {
            OPEN_DELAY: {
              target: "open",
              actions: ["setValue"],
            },
          },
          on: {
            TRIGGER_LEAVE: {
              target: "closed",
              actions: ["clearValue", "clearPointerMoveRef"],
            },
            CONTENT_FOCUS: {
              actions: ["focusContent", "restoreTabOrder"],
            },
            LINK_FOCUS: {
              actions: ["focusLink"],
            },
          },
        },

        open: {
          tags: ["open"],
          activities: ["trackEscapeKey", "trackInteractionOutside", "preserveTabOrder"],
          on: {
            CONTENT_LEAVE: {
              target: "closing",
            },
            TRIGGER_LEAVE: {
              target: "closing",
              actions: ["clearPointerMoveRef"],
            },
            CONTENT_FOCUS: {
              actions: ["focusContent", "restoreTabOrder"],
            },
            LINK_FOCUS: {
              actions: ["focusLink"],
            },
            CONTENT_DISMISS: {
              target: "closed",
              actions: ["focusTriggerIfNeeded", "clearValue", "clearPointerMoveRef"],
            },
            CONTENT_ENTER: {
              actions: ["restoreTabOrder"],
            },
            TRIGGER_MOVE: {
              guard: "isSubmenu",
              actions: ["setValue"],
            },
            ROOT_CLOSE: {
              // clear the previous value so indicator doesn't animate
              actions: ["clearPreviousValue", "cleanupObservers"],
            },
          },
        },

        closing: {
          tags: ["open"],
          activities: ["trackInteractionOutside"],
          after: {
            CLOSE_DELAY: {
              target: "closed",
              actions: ["clearValue"],
            },
          },
          on: {
            CONTENT_DISMISS: {
              target: "closed",
              actions: ["focusTriggerIfNeeded", "clearValue", "clearPointerMoveRef"],
            },
            CONTENT_ENTER: {
              target: "open",
              actions: ["restoreTabOrder"],
            },
            TRIGGER_ENTER: {
              actions: ["clearCloseRefs"],
            },
            TRIGGER_MOVE: [
              {
                guard: "isOpen",
                target: "open",
                actions: ["setValue", "setPointerMoveRef"],
              },
              {
                target: "opening",
                actions: ["setPointerMoveRef"],
              },
            ],
          },
        },
      },
    },
    {
      guards: {
        isOpen: (ctx) => ctx.value !== null,
        isItemOpen: (ctx, evt) => ctx.value === evt.value,
        isRootMenu: (ctx) => ctx.isRootMenu,
        isSubmenu: (ctx) => ctx.isSubmenu,
      },
      delays: {
        OPEN_DELAY: (ctx) => ctx.openDelay,
        CLOSE_DELAY: (ctx) => ctx.closeDelay,
      },
      activities: {
        preserveTabOrder(ctx) {
          if (!ctx.isViewportRendered) return
          if (ctx.value == null) return
          const contentEl = () => dom.getContentEl(ctx, ctx.value!)
          return proxyTabFocus(contentEl, {
            triggerElement: dom.getTriggerEl(ctx, ctx.value),
            onFocusEnter() {
              ctx.tabOrderCleanup?.()
            },
          })
        },
        trackInteractionOutside(ctx, _evt, { send }) {
          if (ctx.value == null) return
          if (ctx.isSubmenu) return

          const getContentEl = () =>
            ctx.isViewportRendered ? dom.getViewportEl(ctx) : dom.getContentEl(ctx, ctx.value!)

          return trackInteractOutside(getContentEl, {
            onFocusOutside(event) {
              // remove tabbable elements from tab order
              ctx.tabOrderCleanup?.()
              ctx.tabOrderCleanup = removeFromTabOrder(dom.getTabbableEls(ctx, ctx.value!))

              const { target } = event.detail.originalEvent
              const rootEl = dom.getRootMenuEl(ctx)
              if (contains(rootEl, target)) event.preventDefault()
            },
            onPointerDownOutside(event) {
              const { target } = event.detail.originalEvent

              const topLevelEls = dom.getTopLevelEls(ctx)
              const isTrigger = topLevelEls.some((item) => contains(item, target))

              const viewportEl = dom.getViewportEl(ctx)
              const isRootViewport = ctx.isRootMenu && contains(viewportEl, target)
              if (isTrigger || isRootViewport) event.preventDefault()
            },
            onInteractOutside(event) {
              if (event.defaultPrevented) return
              send({ type: "CONTENT_DISMISS", src: "interact-outside" })
            },
          })
        },
        trackEscapeKey(ctx, _evt, { send }) {
          if (ctx.isSubmenu) return
          const onKeyDown = (evt: KeyboardEvent) => {
            if (evt.key === "Escape" && !evt.isComposing) {
              ctx.wasEscapeCloseRef = true
              send({ type: "CONTENT_DISMISS", src: "key.esc" })
            }
          }
          return addDomEvent(dom.getDoc(ctx), "keydown", onKeyDown)
        },
      },
      actions: {
        clearCloseRefs(ctx) {
          ctx.wasClickCloseRef = null
          ctx.wasEscapeCloseRef = false
        },
        setPointerMoveRef(ctx, evt) {
          ctx.hasPointerMoveOpenedRef = evt.value
        },
        clearPointerMoveRef(ctx) {
          ctx.hasPointerMoveOpenedRef = null
        },
        cleanupObservers(ctx) {
          ctx.activeContentCleanup?.()
          ctx.activeTriggerCleanup?.()
          ctx.tabOrderCleanup?.()
        },
        setActiveContentNode(ctx) {
          ctx.activeContentNode = ctx.value != null ? dom.getContentEl(ctx, ctx.value) : null
        },
        setActiveTriggerNode(ctx) {
          ctx.activeTriggerNode = ctx.value != null ? dom.getTriggerEl(ctx, ctx.value) : null
        },
        syncTriggerRectObserver(ctx) {
          const node = ctx.activeTriggerNode
          if (!node) return

          ctx.activeTriggerCleanup?.()
          const exec = () => {
            ctx.activeTriggerRect = {
              x: node.offsetLeft,
              y: node.offsetTop,
              width: node.offsetWidth,
              height: node.offsetHeight,
            }
          }

          ctx.activeTriggerCleanup = callAll(
            trackResizeObserver(node, exec),
            trackResizeObserver(dom.getIndicatorTrackEl(ctx), exec),
          )
        },
        syncContentRectObserver(ctx) {
          if (!ctx.isViewportRendered) return
          const node = ctx.activeContentNode
          if (!node) return
          ctx.activeContentCleanup?.()
          const exec = () => {
            ctx.viewportSize = { width: node.offsetWidth, height: node.offsetHeight }
          }
          ctx.activeContentCleanup = trackResizeObserver(node, exec)
        },
        syncMotionAttribute(ctx) {
          if (!ctx.isViewportRendered) return
          if (ctx.isSubmenu) return
          set.motionAttr(ctx)
        },
        setClickCloseRef(ctx, evt) {
          ctx.wasClickCloseRef = evt.value
        },
        checkViewportNode(ctx) {
          ctx.isViewportRendered = !!dom.getViewportEl(ctx)
        },
        clearPreviousValue(ctx) {
          ctx.previousValue = null
        },
        clearValue(ctx) {
          set.value(ctx, null)
        },
        setValue(ctx, evt) {
          set.value(ctx, evt.value)
        },
        focusTopLevelEl(ctx, evt) {
          const value = evt.value
          if (evt.target === "next") dom.getNextTopLevelEl(ctx, value)?.focus()
          else if (evt.target === "prev") dom.getPrevTopLevelEl(ctx, value)?.focus()
          else if (evt.target === "first") dom.getFirstTopLevelEl(ctx)?.focus()
          else if (evt.target === "last") dom.getLastTopLevelEl(ctx)?.focus()
          else dom.getTriggerEl(ctx, value)?.focus()
        },
        focusLink(ctx, evt) {
          const value = evt.value
          if (evt.target === "next") dom.getNextLinkEl(ctx, value, evt.node)?.focus()
          else if (evt.target === "prev") dom.getPrevLinkEl(ctx, value, evt.node)?.focus()
          else if (evt.target === "first") dom.getFirstLinkEl(ctx, value)?.focus()
          else if (evt.target === "last") dom.getLastLinkEl(ctx, value)?.focus()
        },
        focusContent(ctx, evt) {
          raf(() => {
            const tabbableEls = dom.getTabbableEls(ctx, evt.value)
            tabbableEls[0]?.focus()
          })
        },
        focusTriggerIfNeeded(ctx) {
          if (!ctx.value) return
          const contentEl = dom.getContentEl(ctx, ctx.value)
          if (!contains(contentEl, dom.getActiveElement(ctx))) return
          ctx.activeTriggerNode?.focus()
        },
        restoreTabOrder(ctx) {
          ctx.tabOrderCleanup?.()
        },
        setParentMenu(ctx, evt) {
          ctx.parentMenu = ref(evt.parent)
        },
        setChildMenu(ctx, evt) {
          ctx.childMenus[evt.id] = evt.value
        },
        propagateClose(ctx) {
          const menus = Object.values(ctx.childMenus)
          menus.forEach((child) => {
            child?.send({ type: "ROOT_CLOSE", src: ctx.id })
          })
        },
      },
    },
  )
}

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

const invoke = {
  valueChange(ctx: MachineContext) {
    ctx.onValueChange?.({ value: ctx.value })
  },
}

const set = {
  value(ctx: MachineContext, value: string | null) {
    if (ctx.value === value) return
    ctx.previousValue = ctx.value
    ctx.value = value
    invoke.valueChange(ctx)
  },

  motionAttr(ctx: MachineContext) {
    const triggers = dom.getTriggerEls(ctx)

    let values = triggers.map((trigger) => trigger.getAttribute("data-value"))
    if (ctx.dir === "rtl") values.reverse()

    const index = values.indexOf(ctx.value)
    const prevIndex = values.indexOf(ctx.previousValue)

    const contentEls = dom.getContentEls(ctx)
    contentEls.forEach((contentEl) => {
      const value = contentEl.dataset.value!
      const selected = ctx.value === value
      const prevSelected = prevIndex === values.indexOf(value)

      if (!selected && !prevSelected) {
        delete contentEl.dataset.motion
        return
      }

      const attribute = (() => {
        // Don't provide a direction on the initial open
        if (index !== prevIndex) {
          // If we're moving to this item from another
          if (selected && prevIndex !== -1) return index > prevIndex ? "from-end" : "from-start"
          // If we're leaving this item for another
          if (prevSelected && index !== -1) return index > prevIndex ? "to-start" : "to-end"
        }
        // Otherwise we're entering from closed or leaving the list
        // entirely and should not animate in any direction
        return undefined
      })()

      if (attribute) {
        contentEl.dataset.motion = attribute
      } else {
        delete contentEl.dataset.motion
      }
    })
  },
}
