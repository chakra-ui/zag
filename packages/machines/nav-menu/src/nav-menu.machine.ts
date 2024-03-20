import { createMachine, guards, ref } from "@zag-js/core"
import { cast, compact, isEqual } from "@zag-js/utils"
import type { MachineContext, MachineState, UserDefinedContext } from "./nav-menu.types"
import { trackDismissableElement } from "@zag-js/dismissable"
import { dom } from "./nav-menu.dom"

const { not, and } = guards

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "nav-menu",
      initial: "idle",
      context: {
        parent: null,
        children: cast(ref({})),
        orientation: "horizontal",
        focusedId: null,
        activeId: null,
        highlightedLinkId: null,
        activeLinkId: null,
        ...ctx,
      },

      computed: {
        isSubmenu: (ctx) => ctx.parent !== null,
        childrenIds: (ctx) => Object.keys(ctx.children),
      },

      on: {
        SET_PARENT: {
          actions: "setParentMenu",
        },
        SET_CHILD: {
          actions: "setChildMenu",
        },
        CLOSE: {
          actions: ["collapseMenu", "focusTrigger"],
          target: "collapsed",
        },
        ITEM_CLICK: [
          {
            guard: "isExpanded",
            actions: "collapseMenu",
            target: "collapsed",
          },
          {
            actions: "expandMenu",
            target: "expanded",
          },
        ],

        ITEM_POINTERMOVE: {
          actions: ["setFocusedId", "removeHighlightedLinkId"],
        },
        ITEM_POINTERLEAVE: {
          actions: "removeFocusedId",
        },
        LINK_CLICK: {
          actions: ["setActiveLink", "collapseMenu", "removeFocusedId"],
        },
        LINK_FOCUS: [
          {
            guard: not("isItemEl"),
            actions: "highlightLink",
          },
          {
            actions: ["setFocusedId", "removeHighlightedLinkId"],
          },
        ],
        LINK_POINTERMOVE: [
          {
            guard: not("isItemEl"),
            actions: "highlightLink",
          },
          {
            actions: ["setFocusedId", "removeHighlightedLinkId"],
          },
        ],
        LINK_POINTERLEAVE: [
          {
            guard: not("isItemEl"),
            actions: "removeHighlightedLinkId",
          },
          {
            actions: ["removeFocusedId"],
          },
        ],
        SUB_ITEMFOCUS: {
          internal: true,
          actions: "focusFirstItem",
          target: "collapsed",
        },
      },
      states: {
        idle: {
          on: {
            ITEM_FOCUS: {
              actions: ["setFocusedId", "removeHighlightedLinkId"],
              target: "collapsed",
            },
          },
        },
        collapsed: {
          on: {
            ITEM_FOCUS: {
              actions: ["setFocusedId", "removeHighlightedLinkId"],
            },
            ITEM_BLUR: {
              actions: "removeFocusedId",
            },
            ITEM_ARROWRIGHT: {
              actions: "focusNextItem",
            },
            ITEM_ARROWDOWN: {
              actions: "focusNextItem",
            },
            ITEM_ARROWLEFT: {
              actions: "focusPrevItem",
            },
            ITEM_FIRST: {
              actions: "focusFirstItem",
            },
            ITEM_LAST: {
              actions: "focusLastItem",
            },
          },
        },
        expanded: {
          tags: ["expanded"],
          activities: ["trackInteractOutside"],
          on: {
            ITEM_FOCUS: {
              actions: ["setFocusedId", "removeHighlightedLinkId"],
            },
            ITEM_ARROWRIGHT: [
              {
                guard: and("isVertical", "hasSubmenu"),
                actions: "focusSubMenu",
              },
              {
                guard: "isVertical",
                actions: "highlightFirstLink",
              },
              {
                actions: "focusNextItem",
              },
            ],
            ITEM_ARROWDOWN: [
              {
                guard: and(not("isVertical"), "hasSubmenu"),
                actions: "focusSubMenu",
              },
              {
                guard: not("isVertical"),
                actions: "highlightFirstLink",
              },
              {
                actions: "focusNextItem",
              },
            ],
            ITEM_ARROWLEFT: {
              actions: "focusPrevItem",
            },
            ITEM_FIRST: {
              actions: "focusFirstItem",
            },
            ITEM_LAST: {
              actions: "focusLastItem",
            },
            LINK_FIRST: {
              actions: "highlightFirstLink",
            },
            LINK_LAST: {
              actions: "highlightLastLink",
            },
            LINK_NEXT: {
              actions: "highlightNextLink",
            },
            LINK_PREV: {
              actions: "highlightPrevLink",
            },
          },
        },
      },
    },
    {
      guards: {
        isExpanded: (ctx, evt) => evt.id === ctx.activeId,
        isItemEl: (_ctx, evt) => !!dom.isItemEl(evt.target),
        hasSubmenu: (ctx, evt) => {
          return !!get.currentChildId(ctx, evt.id)
        },
        isVertical: (ctx) => ctx.orientation === "vertical",
      },
      actions: {
        setParentMenu(ctx, evt) {
          ctx.parent = ref(evt.value)
        },
        setChildMenu(ctx, evt) {
          ctx.children[evt.id] = ref(evt.value)
        },
        setFocusedId: (ctx, evt) => {
          ctx.focusedId = evt.id
        },
        removeFocusedId: (ctx) => {
          ctx.focusedId = null
        },
        focusTrigger: (ctx, evt) => {
          const trigger = dom.getTriggerEl(ctx, evt.id)
          trigger?.focus()
          ctx.focusedId = trigger?.id ?? null
        },
        focusNextItem: (ctx) => {
          const nextItem = dom.getNextItemEl(ctx)
          nextItem.focus()
          ctx.focusedId = nextItem?.id ?? null
        },
        focusPrevItem: (ctx) => {
          const prevItem = dom.getPrevItemEl(ctx)
          prevItem?.focus()
          ctx.focusedId = prevItem?.id ?? null
        },
        focusFirstItem: (ctx) => {
          const firstItem = dom.getFirstItemEl(ctx)
          firstItem?.focus()
          ctx.focusedId = firstItem?.id ?? null
        },
        focusLastItem: (ctx) => {
          const lastItem = dom.getLastItemEl(ctx)
          lastItem?.focus()
          ctx.focusedId = lastItem?.id ?? null
        },
        expandMenu: (ctx, evt) => {
          set.activeId(ctx, evt.id)
        },
        collapseMenu: (ctx) => {
          set.activeId(ctx, null)
          ctx.highlightedLinkId = null
        },
        highlightLink: (ctx, evt) => {
          ctx.highlightedLinkId = evt.id
        },
        highlightFirstLink: (ctx, evt) => {
          const firstLink = dom.getFirstMenuLinkEl(ctx, evt.id)
          firstLink?.focus()
          ctx.highlightedLinkId = firstLink?.id ?? null
        },
        highlightLastLink: (ctx, evt) => {
          const lastLink = dom.getLastMenuLinkEl(ctx, evt.id)
          lastLink?.focus()
          ctx.highlightedLinkId = lastLink?.id ?? null
        },
        highlightNextLink: (ctx, evt) => {
          if (!ctx.highlightedLinkId) return
          const nextLink = dom.getNextMenuLinkEl(ctx, evt.id)
          if (!nextLink) return
          nextLink.focus()
          ctx.highlightedLinkId = nextLink?.id ?? null
        },
        highlightPrevLink: (ctx, evt) => {
          if (!ctx.highlightedLinkId) return
          const prevLink = dom.getPrevMenuLinkEl(ctx, evt.id)
          if (!prevLink) return
          prevLink.focus()
          ctx.highlightedLinkId = prevLink?.id ?? null
        },
        removeHighlightedLinkId: (ctx) => {
          ctx.highlightedLinkId = null
        },
        setActiveLink: (ctx, evt) => {
          set.activeLinkId(ctx, evt.id)
        },
        focusSubMenu: (ctx, evt) => {
          const currentChildId = get.currentChildId(ctx, evt.id)
          if (!currentChildId) return
          return ctx.children[currentChildId].send("SUB_ITEMFOCUS")
        },
      },
      activities: {
        trackInteractOutside(ctx, evt, { send }) {
          const triggerEl = dom.getTriggerEl(ctx, evt.id)
          const contentEl = dom.getContentEl(ctx, evt.id)
          // Do not reach tracker if trigger is a link with no existance of matching portal
          if (dom.isItemEl(dom.getItemEl(ctx, evt.id))) return
          const dispatch = () => send({ type: "CLOSE", src: "interact-outside", id: evt.id })
          return trackDismissableElement(contentEl, {
            defer: true,
            exclude: [triggerEl],
            onInteractOutside: ctx.onInteractOutside,
            onFocusOutside(evt) {
              evt.preventDefault()

              ctx.onFocusOutside
            },
            onEscapeKeyDown() {
              // if (ctx.isSubmenu) event.preventDefault()
              dispatch()
            },
            onPointerDownOutside(event) {
              // ctx.restoreFocus = !event.detail.focusable
              ctx.onPointerDownOutside?.(event)
              dispatch()
            },
            onDismiss() {
              dispatch()
            },
          })
        },
      },
    },
  )
}

const set = {
  activeId(ctx: MachineContext, id: string | null) {
    if (isEqual(ctx.activeId, id)) return
    ctx.activeId = id
  },
  activeLinkId(ctx: MachineContext, id: string | null) {
    ctx.activeLinkId = id
  },
}

const get = {
  currentChildId(ctx: MachineContext, id: string) {
    return ctx.childrenIds.find((childId) => childId.startsWith(id))
  },
}
