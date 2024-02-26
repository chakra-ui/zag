import { createMachine, guards, ref } from "@zag-js/core"
import { trackDismissableElement } from "@zag-js/dismissable"
import { cast, compact, isEqual } from "@zag-js/utils"
import type { MachineContext, MachineState, UserDefinedContext } from "./nav-menu.types"
import { dom } from "./nav-menu.dom"
import { getPlacement } from "@zag-js/popper"
import { raf } from "@zag-js/dom-query"

const { not } = guards

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "nav-menu",
      initial: "idle",
      context: {
        parent: null,
        children: cast(ref({})),
        focusedMenuId: null,
        activeId: null,
        highlightedItemId: null,
        activeContentId: null,
        orientation: "horizontal",
        anchorPoint: null,
        restoreFocus: true,
        activeLink: null,
        ...ctx,
        positioning: {
          placement: "bottom-start",
          ...ctx.positioning,
        },
      },
      computed: {
        isSubmenu: (ctx) => ctx.parent !== null,
        isVertical: (ctx) => ctx.orientation === "vertical",
      },
      on: {
        "PARENT.SET": {
          actions: "setParentMenu",
        },
        "CHILD.SET": {
          actions: "setChildMenu",
        },
        CLOSE: {
          target: "closed",
          actions: ["collapseMenu", "removeActiveContentId"],
        },
      },
      states: {
        idle: {
          on: {
            TRIGGER_FOCUS: {
              target: "closed",
              actions: "setFocusedMenuId",
            },
          },
        },
        closed: {
          tags: ["closed"],
          entry: ["clearAnchorPoint", "focusTrigger"],
          on: {
            TRIGGER_FOCUS: {
              actions: "setFocusedMenuId",
            },
            TRIGGER_BLUR: {
              target: "idle",
              actions: "setFocusedMenuId",
            },
            TRIGGER_CLICK: [
              {
                guard: "isExpanded",
                actions: ["collapseMenu"],
              },
              {
                guard: not("isExpanded"),
                actions: ["expandMenu"],
                target: "open",
              },
            ],
            ARROW_LEFT: {
              actions: "focusPrevTrigger",
            },
            ARROW_RIGHT: {
              actions: "focusNextTrigger",
            },
            HOME: {
              actions: "focusFirstTrigger",
            },
            END: {
              actions: "focusLastTrigger",
            },
          },
        },
        open: {
          tags: ["open"],
          activities: ["trackPositioning", "trackInteractOutside"],
          on: {
            TRIGGER_FOCUS: {
              actions: ["setFocusedMenuId", "collapseMenu"],
              target: "closed",
            },
            TRIGGER_CLICK: [
              {
                guard: "isExpanded",
                actions: ["collapseMenu"],
                target: "closed",
              },
              {
                guard: not("isExpanded"),
                actions: ["expandMenu"],
              },
            ],
            TO_FIRST_ITEM: {
              guard: "isExpanded",
              actions: "highlightFirstItem",
            },
            ITEM_NEXT: [
              {
                guard: "isNotItemFocused",
                actions: "highlightFirstItem",
              },
              {
                actions: "highlightNextItem",
              },
            ],
            ITEM_PREV: {
              actions: "highlightPrevItem",
            },
            ARROW_LEFT: {
              guard: "isExpanded",
              actions: ["focusPrevTrigger", "collapseMenu"],
              target: "closed",
            },
            ARROW_RIGHT: {
              guard: "isExpanded",
              actions: ["focusNextTrigger", "collapseMenu"],
              target: "closed",
            },
            HOME: {
              actions: "highlightFirstItem",
            },
            END: {
              actions: "highlightLastItem",
            },
            LINK_ACTIVE: {
              target: "closed",
              actions: ["collapseMenu", "setActiveLink"],
            },
          },
        },
      },
    },
    {
      guards: {
        isExpanded: (ctx, evt) => ctx.activeId === evt.id,
        isNotItemFocused: (ctx) => !ctx.highlightedItemId,
      },
      actions: {
        setParentMenu(ctx, evt) {
          ctx.parent = ref(evt.value)
        },
        setChildMenu(ctx, evt) {
          ctx.children[evt.id] = ref(evt.value)
        },
        setFocusedMenuId(ctx, evt) {
          set.focusedMenuId(ctx, evt.id)
        },
        removeActiveContentId(ctx) {
          ctx.activeContentId = null
        },
        expandMenu(ctx, evt) {
          set.activeId(ctx, evt.id)
          const contentEl = dom.getMenuContentEl(ctx, evt.id)
          ctx.activeContentId = contentEl?.id ?? null
        },
        collapseMenu(ctx) {
          set.activeId(ctx, null)
          ctx.highlightedItemId = null
          ctx.activeContentId = null
        },
        highlightFirstItem(ctx, evt) {
          const firstItemEl = dom.getFirstMenuItemEl(ctx, evt.id)
          if (!firstItemEl) return
          firstItemEl.focus()
          ctx.highlightedItemId = firstItemEl.id
        },
        highlightLastItem(ctx, evt) {
          const lastItemEl = dom.getLastMenuItemEl(ctx, evt.id)
          if (!lastItemEl) return
          lastItemEl.focus()
          ctx.highlightedItemId = lastItemEl.id
        },
        highlightNextItem(ctx, evt) {
          if (!ctx.highlightedItemId) return
          const nextItemEl = dom.getNextMenuItemEl(ctx, evt.id, ctx.highlightedItemId)
          ctx.highlightedItemId = nextItemEl.id
          nextItemEl.focus()
        },
        highlightPrevItem(ctx, evt) {
          if (!ctx.highlightedItemId) return
          const prevItemEl = dom.getPrevMenuItemEl(ctx, evt.id, ctx.highlightedItemId)
          if (!prevItemEl) return
          ctx.highlightedItemId = prevItemEl.id
          prevItemEl.focus()
        },
        focusTrigger(ctx) {
          if (ctx.isSubmenu || ctx.anchorPoint || !ctx.restoreFocus) return
          raf(() => {
            if (!ctx.focusedMenuId) return
            dom.getTriggerEl(ctx, ctx.focusedMenuId)?.focus({ preventScroll: true })
          })
        },
        focusFirstTrigger(ctx) {
          if (!ctx.focusedMenuId) return
          const triggerEl = dom.getFirstTriggerEl(ctx)
          triggerEl?.focus()
        },
        focusLastTrigger(ctx) {
          if (!ctx.focusedMenuId) return
          const triggerEl = dom.getLastTriggerEl(ctx)
          triggerEl?.focus()
        },
        focusNextTrigger(ctx) {
          if (!ctx.focusedMenuId) return
          const triggerEl = dom.getNextTriggerEl(ctx, ctx.focusedMenuId)
          triggerEl?.focus()
        },
        focusPrevTrigger(ctx) {
          if (!ctx.focusedMenuId) return
          const triggerEl = dom.getPrevTriggerEl(ctx, ctx.focusedMenuId)
          triggerEl?.focus()
        },
        clearAnchorPoint(ctx) {
          ctx.anchorPoint = null
        },
        setActiveLink(ctx, evt) {
          return (ctx.activeLink = evt.href)
        },
      },
      activities: {
        trackPositioning(ctx, evt) {
          if (ctx.anchorPoint) return
          ctx.currentPlacement = ctx.positioning.placement
          const getPositionerEl = () => dom.getPositionerEl(ctx, evt.id)
          return getPlacement(dom.getTriggerEl(ctx, evt.id), getPositionerEl, {
            ...ctx.positioning,
            defer: true,
            onComplete(data) {
              ctx.currentPlacement = data.placement
            },
          })
        },
        trackInteractOutside(ctx, evt, { send }) {
          const triggerEl = dom.getTriggerEl(ctx, evt.id)
          const positionerEl = dom.getPositionerEl(ctx, evt.id)
          // Do not reach tracker if trigger is a link with no existance of matching portal
          if (triggerEl?.matches("a[href]") && !positionerEl) return
          const dispatch = () => send({ type: "CLOSE", src: "interact-outside" })
          return trackDismissableElement(dom.getMenuContentEl(ctx, evt.id), {
            defer: true,
            exclude: [triggerEl],
            onInteractOutside: ctx.onInteractOutside,
            onFocusOutside(evt) {
              evt.preventDefault()

              ctx.onFocusOutside
            },
            onEscapeKeyDown() {
              // if (ctx.isSubmenu) event.preventDefault()
              // closeRootMenu(ctx)
              dispatch()
            },
            onPointerDownOutside(event) {
              ctx.restoreFocus = !event.detail.focusable
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
  focusedMenuId(ctx: MachineContext, id: string | null) {
    if (isEqual(ctx.focusedMenuId, id)) return
    ctx.focusedMenuId = id
  },
}
