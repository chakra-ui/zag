import { attrs, contains, isFocusable } from "@core-dom/element"
import { addPointerEvent } from "@core-dom/event/pointer"
import { nextTick } from "@core-foundation/utils/fn"
import { Point, PointValue } from "@core-graphics/point"
import { containsPoint } from "@core-graphics/polygon/contains"
import { fromElement } from "@core-graphics/rect/create"
import { inset } from "@core-graphics/rect/operations"
import { createMachine, guards, Machine, preserve } from "@ui-machines/core"
import { trackPointerDown } from "../utils/pointer-down"
import { WithDOM } from "../utils/types"
import { dom, getElements } from "./menu.dom"

const { not, and } = guards

export type MenuMachine = Machine<MenuMachineContext, MenuMachineState>

export type MenuMachineContext = WithDOM<{
  activeId: string | null
  onSelect?: (value: string) => void
  parent: MenuMachine | null
  children: Record<string, MenuMachine>
  orientation: "horizontal" | "vertical"
  pointerExitPoint: PointValue | null
  hoverId: string | null
}>

export type MenuMachineState = {
  value: "unknown" | "idle" | "open" | "close" | "opening" | "closing"
}

export const menuMachine = createMachine<MenuMachineContext, MenuMachineState>(
  {
    id: "menu-machine",
    initial: "unknown",
    context: {
      pointerdownNode: null,
      orientation: "vertical",
      activeId: null,
      uid: "testing",
      parent: null,
      children: {},
      pointerExitPoint: null,
      hoverId: null,
    },
    on: {
      SET_PARENT: {
        actions: "setParent",
      },
      SET_CHILD: {
        actions: "setChild",
      },
      OPEN: {
        target: "open",
        actions: "focusFirstItem",
      },
      CLOSE: "close",
      SET_POINTER_EXIT: {
        cond: "isTriggerItem",
        actions: "setPointerExit",
      },
      RESTORE_FOCUS: {
        actions: "restoreFocus",
      },
    },
    states: {
      unknown: {
        on: {
          SETUP: {
            target: "idle",
            actions: ["setId", "setOwnerDocument"],
          },
        },
      },

      idle: {
        on: {
          TRIGGER_CLICK: {
            target: "open",
            actions: "focusFirstItem",
          },
          TRIGGER_FOCUS: {
            cond: not("isSubmenu"),
            target: "close",
          },
          TRIGGER_POINTERMOVE: {
            cond: and("isTriggerItem", "isParentActiveItem"),
            target: "opening",
          },
        },
      },

      opening: {
        after: { 150: "open" },
        on: {
          BLUR: "close",
          TRIGGER_POINTERLEAVE: "close",
        },
      },

      closing: {
        activities: "trackPointerMove",
        after: {
          300: {
            target: "close",
            actions: ["clearPause", "focusParentMenu", "sendRestoreFocus"],
          },
        },
        on: {
          MENU_POINTERENTER: {
            target: "open",
            actions: "clearPointerExitPoint",
          },
        },
      },

      close: {
        entry: ["clearActiveId", "focusButton", "clearPointerDownNode", "clearPause", "closeChildren"],
        on: {
          TRIGGER_CLICK: {
            target: "open",
            actions: "focusFirstItem",
          },
          TRIGGER_POINTERMOVE: {
            cond: "isTriggerItem",
            target: "opening",
          },
          TRIGGER_BLUR: "idle",
          ARROW_DOWN: {
            target: "open",
            actions: "focusFirstItem",
          },
          ARROW_UP: {
            target: "open",
            actions: "focusLastItem",
          },
        },
      },

      open: {
        activities: "trackPointerDown",
        entry: ["focusMenu", "clearPause"],
        on: {
          TRIGGER_CLICK: {
            cond: not("isTriggerItem"),
            target: "close",
          },
          ARROW_UP: {
            actions: ["focusPrevItem", "focusMenu"],
          },
          ARROW_DOWN: {
            actions: ["focusNextItem", "focusMenu"],
          },
          ARROW_LEFT: {
            target: "close",
            actions: "focusParentMenu",
          },
          HOME: {
            actions: ["focusFirstItem", "focusMenu"],
          },
          END: {
            actions: ["focusLastItem", "focusMenu"],
          },
          BLUR: {
            target: "close",
            actions: "closeParents",
          },
          ARROW_RIGHT: {
            cond: "isTriggerActiveItem",
            actions: "openSubmenu",
          },
          ENTER: [
            {
              cond: "isTriggerActiveItem",
              actions: "openSubmenu",
            },
            {
              target: "close",
              actions: ["invokeOnSelect", "closeParents"],
            },
          ],
          ESCAPE: [
            {
              cond: "isSubmenu",
              target: "close",
              actions: "closeParents",
            },
            { target: "close" },
          ],
          ITEM_POINTERMOVE: [
            {
              cond: and(not("isMenuFocused"), not("isTriggerActiveItem"), not("shouldPause"), not("isActiveItem")),
              actions: ["focusItem", "focusMenu", "closeChildren"],
            },
            {
              cond: and(not("shouldPause"), not("isActiveItem")),
              actions: "focusItem",
            },
            {
              cond: not("isActiveItem"),
              actions: "setHoveredItem",
            },
          ],
          ITEM_POINTERLEAVE: {
            cond: and(not("isTriggerItem"), not("shouldPause")),
            actions: "clearActiveId",
          },
          ITEM_CLICK: {
            cond: and(not("isTriggerActiveItem"), not("isActiveItemFocusable")),
            target: "close",
            actions: ["invokeOnSelect", "closeParents"],
          },
          TRIGGER_POINTERLEAVE: {
            target: "closing",
            actions: "setPointerExitPoint",
          },
          TYPEAHEAD: {
            actions: "focusMatchedItem",
          },
          FOCUS_MENU: {
            actions: "focusMenu",
          },
        },
      },
    },
  },
  {
    guards: {
      isRtl: (ctx) => ctx.dir === "rtl",
      isHorizontal: (ctx) => ctx.orientation === "horizontal",
      isVertical: (ctx) => ctx.orientation === "vertical",
      isMenuFocused: (ctx) => {
        const { menu, activeElement } = getElements(ctx)
        return contains(menu, activeElement)
      },
      isActiveItem: (ctx, evt) => {
        return ctx.activeId === evt.target.id
      },
      isParentActiveItem: (ctx, evt) => {
        return ctx.parent?.state.context.activeId === evt.target.id
      },
      isTriggerItem: (ctx, evt) => {
        const target = evt.target ?? getElements(ctx).trigger
        const attr = attrs(target)
        return !!attr.get("role")?.startsWith("menuitem") && !!attr.has("aria-controls")
      },
      isTriggerActiveItem: (ctx, evt) => {
        const target = evt.target ?? getElements(ctx).activeItem
        return !!attrs(target).has("aria-controls")
      },
      isSubmenu: (ctx) => ctx.parent !== null,
      shouldPause: (ctx) => {
        const { menu } = getElements(ctx)
        return menu?.dataset.pause === "true"
      },
      isActiveItemFocusable: (ctx) => {
        const { activeItem } = getElements(ctx)
        return isFocusable(activeItem)
      },
      isWithinPolygon: (ctx, evt) => {
        const { pointerExitPoint } = ctx
        const { x, y } = evt.point
        const { menu } = getElements(ctx)

        if (!menu || !pointerExitPoint) return false
        let menuRect = fromElement(menu)
        if (!menuRect) return false

        // expand menu rect with some padding
        menuRect = inset(menuRect, { dx: -20, dy: -20 })

        const poly = menuRect.cornerPoints.map((p) => p.value)
        poly.unshift(pointerExitPoint)

        return containsPoint(poly, { x, y })
      },
    },
    activities: {
      trackPointerDown,
      trackPointerMove(ctx, _evt, { guards = {}, send }) {
        const { isWithinPolygon } = guards
        const { doc } = getElements(ctx)

        const { menu } = getElements(ctx!.parent!.state.context)
        menu!.dataset.pause = "true"

        return addPointerEvent(doc, "pointermove", (e) => {
          const isMovingToSubmenu = isWithinPolygon(ctx, {
            point: Point.fromPointerEvent(e),
          })
          if (!isMovingToSubmenu) {
            send("CLOSE")
            menu!.dataset.pause = "false"
          }
        })
      },
    },
    actions: {
      setPointerExitPoint(ctx, evt) {
        ctx.pointerExitPoint = evt.point
      },
      clearPointerExitPoint(ctx) {
        ctx.pointerExitPoint = null
      },
      clearPause(ctx) {
        if (!ctx.parent) return
        const { menu } = getElements(ctx.parent.state.context)
        if (menu) {
          menu.dataset.pause = "false"
        }
      },
      setId: (ctx, evt) => {
        ctx.uid = evt.id
      },
      setOwnerDocument(ctx, evt) {
        ctx.doc = preserve(evt.doc)
      },
      clearActiveId(ctx) {
        ctx.activeId = null
      },
      clearPointerDownNode(ctx) {
        ctx.pointerdownNode = null
      },
      focusMenu(ctx) {
        const { menu, doc } = getElements(ctx)
        if (menu && doc.activeElement !== menu) {
          nextTick(() => menu.focus())
        }
      },
      focusFirstItem(ctx) {
        const menuitems = dom(ctx)
        if (!menuitems.first) return
        ctx.activeId = menuitems.first.id
      },
      focusLastItem(ctx) {
        const menuitems = dom(ctx)
        if (!menuitems.last) return
        ctx.activeId = menuitems.last.id
      },
      focusNextItem(ctx) {
        const menuitems = dom(ctx)
        const next = menuitems.next(ctx.activeId ?? "")
        ctx.activeId = next?.id ?? null
      },
      focusPrevItem(ctx) {
        const menuitems = dom(ctx)
        const prev = menuitems.prev(ctx.activeId ?? "")
        ctx.activeId = prev?.id ?? null
      },
      invokeOnSelect(ctx) {
        ctx.onSelect?.(ctx.activeId ?? "")
      },
      focusItem(ctx, event) {
        ctx.activeId = event.id
      },
      focusButton(ctx) {
        if (ctx.parent) return
        const { trigger } = getElements(ctx)
        nextTick(() => trigger?.focus())
      },
      focusMatchedItem(ctx, evt) {
        const menuitems = dom(ctx)
        const node = menuitems.searchByKey(evt.key)
        ctx.activeId = node?.id ?? ctx.activeId
      },
      setParent(ctx, evt) {
        ctx.parent = preserve(evt.value)
      },
      setChild(ctx, evt) {
        ctx.children[evt.id] = preserve(evt.value)
      },
      closeChildren(ctx) {
        for (const child of Object.values(ctx.children)) {
          child.send("CLOSE")
        }
      },
      closeParents(ctx) {
        let parent = ctx.parent
        while (parent) {
          parent.send("CLOSE")
          parent = parent.state.context.parent
        }
      },
      openSubmenu(ctx) {
        const { activeItem } = getElements(ctx)
        const id = attrs(activeItem).get("data-uid")
        const child = id ? ctx.children[id] : null
        child?.send("OPEN")
      },
      focusParentMenu(ctx) {
        const { parent } = ctx
        parent?.send("FOCUS_MENU")
      },
      setHoveredItem(ctx, evt) {
        ctx.hoverId = evt.id
      },
      restoreFocus(ctx) {
        if (ctx.hoverId) {
          ctx.activeId = ctx.hoverId
          ctx.hoverId = null
        }
      },
      sendRestoreFocus(ctx) {
        ctx.parent?.send("RESTORE_FOCUS")
      },
    },
  },
)
