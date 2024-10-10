import { createMachine } from "@zag-js/core"
import { contains, raf } from "@zag-js/dom-query"
import { compact } from "@zag-js/utils"
import { dom, trackResizeObserver } from "./navigation-menu.dom"
import type { MachineContext, MachineState, UserDefinedContext } from "./navigation-menu.types"

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "navigation-menu",

      context: {
        viewportRect: null,
        isViewportRendered: false,
        activeTriggerRect: null,
        value: null,
        previousValue: null,
        openDelay: 200,
        closeDelay: 300,
        orientation: "horizontal",
        wasClickCloseRef: null,
        hasPointerMoveOpenedRef: null,
        activeContentCleanup: null,
        activeContentNode: null,
        activeTriggerNode: null,
        activeTriggerCleanup: null,
        ...ctx,
      },

      watch: {
        value: ["setActiveTriggerNode", "syncTriggerRectObserver", "setActiveContentNode", "syncMotionAttribute"],
      },

      initial: "closed",

      entry: ["checkViewportNode"],
      exit: ["cleanupObservers"],

      on: {
        TRIGGER_CLICK: [
          {
            guard: "isItemOpen",
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
          entry: ["cleanupObservers"],
          on: {
            TRIGGER_ENTER: {
              actions: ["clearRefs"],
            },
            TRIGGER_MOVE: {
              target: "opening",
              actions: ["clearPointerMoveRef"],
            },
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
              actions: ["clearValue"],
            },
            CONTENT_FOCUS: {
              actions: ["focusContent"],
            },
            LINK_FOCUS: {
              actions: ["focusLinkEl"],
            },
          },
        },

        open: {
          tags: ["open"],
          on: {
            CONTENT_LEAVE: {
              target: "closing",
            },
            TRIGGER_LEAVE: {
              target: "closing",
            },
            CONTENT_FOCUS: {
              actions: ["focusContent"],
            },
            LINK_FOCUS: {
              actions: ["focusLinkEl"],
            },
            CONTENT_DISMISS: {
              target: "closed",
              actions: ["focusTriggerIfNeeded", "clearValue"],
            },
          },
        },

        closing: {
          tags: ["open"],
          after: {
            CLOSE_DELAY: {
              target: "closed",
              actions: ["clearValue"],
            },
          },
          on: {
            CONTENT_ENTER: {
              target: "open",
            },
            TRIGGER_ENTER: {
              actions: ["clearRefs"],
            },
            TRIGGER_MOVE: [
              {
                guard: "isOpen",
                target: "open",
                actions: ["setValue", "clearPointerMoveRef"],
              },
              {
                target: "opening",
                actions: ["clearPointerMoveRef"],
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
      },
      delays: {
        OPEN_DELAY: (ctx) => ctx.openDelay,
        CLOSE_DELAY: (ctx) => ctx.closeDelay,
      },
      actions: {
        clearRefs(ctx) {
          ctx.wasClickCloseRef = null
          ctx.hasPointerMoveOpenedRef = null
        },
        clearPointerMoveRef(ctx) {
          ctx.hasPointerMoveOpenedRef = null
        },
        cleanupObservers(ctx) {
          ctx.activeContentCleanup?.()
          ctx.activeTriggerCleanup?.()
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
            const rect = node.getBoundingClientRect()
            const listEl = dom.getListEl(ctx)

            const listRect = listEl?.getBoundingClientRect()
            if (!listRect) return

            const x = rect.x
            const y = rect.y
            ctx.activeTriggerRect = { x, y, width: node.offsetWidth, height: node.offsetHeight }
          }

          exec()

          ctx.activeTriggerCleanup = trackResizeObserver(node, exec)
        },
        syncMotionAttribute(ctx) {
          set.motionAttr(ctx)
        },
        setClickCloseRef(ctx, evt) {
          ctx.wasClickCloseRef = evt.value
        },
        checkViewportNode(ctx) {
          ctx.isViewportRendered = !!dom.getViewportEl(ctx)
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
        focusLinkEl(ctx, evt) {
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
        removeFromTabOrder(ctx, evt) {
          const nodes = dom.getTabbableEls(ctx, evt.value)
          // TODO: add this cleanup
          removeFromTabOrder(nodes)
        },
      },
    },
  )
}

function removeFromTabOrder(candidates: HTMLElement[]) {
  candidates.forEach((candidate) => {
    candidate.dataset.tabindex = candidate.getAttribute("tabindex") || ""
    candidate.setAttribute("tabindex", "-1")
  })
  return () => {
    candidates.forEach((candidate) => {
      const prevTabIndex = candidate.dataset.tabindex as string
      candidate.setAttribute("tabindex", prevTabIndex)
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
