import { createMachine, guards, ref } from "@ui-machines/core"
import { addPointerEvent } from "tiny-dom-event"
import { contains } from "tiny-dom-query"
import { isFocusable } from "tiny-dom-query/focusable"
import { nextTick } from "tiny-fn"
import { fromPointerEvent } from "tiny-point/dom"
import { withinPolygon } from "tiny-point/within"
import { corners } from "tiny-rect"
import { fromElement } from "tiny-rect/from-element"
import { inset } from "tiny-rect/operations"
import { trackPointerDown, uuid } from "../utils"
import { dom } from "./menu.dom"
import { MenuMachineContext, MenuMachineState } from "./menu.types"

const { not, and } = guards

export const menuMachine = createMachine<MenuMachineContext, MenuMachineState>(
  {
    id: "menu-machine",
    initial: "unknown",
    context: {
      pointerdownNode: null,
      orientation: "vertical",
      activeId: null,
      uid: uuid(),
      parent: null,
      children: {},
      intentPolygon: null,
      hoverId: null,
      loop: false,
      suspendPointer: false,
    },
    computed: {
      isSubmenu: (ctx) => ctx.parent !== null,
      isRtl: (ctx) => ctx.dir === "rtl",
      isHorizontal: (ctx) => ctx.orientation === "horizontal",
      isVertical: (ctx) => ctx.orientation === "vertical",
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
        after: { 100: "open" },
        on: {
          BLUR: "close",
          TRIGGER_POINTERLEAVE: "close",
        },
      },

      closing: {
        activities: "trackPointerMove",
        after: {
          150: {
            target: "close",
            actions: ["resumePointer", "focusParentMenu", "sendRestoreFocus"],
          },
        },
        on: {
          MENU_POINTERENTER: {
            target: "open",
            actions: "clearIntentPolygon",
          },
        },
      },

      close: {
        entry: ["clearActiveId", "focusButton", "clearPointerDownNode", "resumePointer", "closeChildren"],
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
        entry: ["focusMenu", "resumePointer"],
        on: {
          TRIGGER_CLICK: {
            cond: not("isTriggerItem"),
            target: "close",
          },
          ARROW_UP: [
            {
              cond: "hasActiveId",
              actions: ["focusPrevItem", "focusMenu"],
            },
            {
              actions: ["focusLastItem"],
            },
          ],
          ARROW_DOWN: [
            {
              cond: "hasActiveId",
              actions: ["focusNextItem", "focusMenu"],
            },
            {
              actions: ["focusFirstItem"],
            },
          ],
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
              cond: and(not("isMenuFocused"), not("isTriggerActiveItem"), not("suspendPointer"), not("isActiveItem")),
              actions: ["focusItem", "focusMenu", "closeChildren"],
            },
            {
              cond: and(not("suspendPointer"), not("isActiveItem")),
              actions: "focusItem",
            },
            {
              cond: not("isActiveItem"),
              actions: "setHoveredItem",
            },
          ],
          ITEM_POINTERLEAVE: {
            cond: and(not("isTriggerItem"), not("suspendPointer")),
            actions: "clearActiveId",
          },
          ITEM_CLICK: {
            cond: and(not("isTriggerActiveItem"), not("isActiveItemFocusable")),
            target: "close",
            actions: ["invokeOnSelect", "closeParents"],
          },
          TRIGGER_POINTERLEAVE: {
            target: "closing",
            actions: "setIntentPolygon",
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
      hasActiveId: (ctx) => ctx.activeId !== null,
      isRtl: (ctx) => ctx.isRtl && ctx.isHorizontal,
      isHorizontal: (ctx) => ctx.isHorizontal,
      isVertical: (ctx) => ctx.isVertical,
      isMenuFocused: (ctx) => {
        const menu = dom.getMenuEl(ctx)
        const activeElement = dom.getActiveElement(ctx)
        return contains(menu, activeElement)
      },
      isActiveItem: (ctx, evt) => ctx.activeId === evt.target.id,
      isParentActiveItem: (ctx, evt) => ctx.parent?.state.context.activeId === evt.target.id,
      // whether the trigger is also a menu item
      isTriggerItem: (ctx, evt) => {
        const target = (evt.target ?? dom.getTriggerEl(ctx)) as HTMLElement
        return !!target.getAttribute("role")?.startsWith("menuitem") && !!target.hasAttribute("aria-controls")
      },
      // whether the trigger item is the active item
      isTriggerActiveItem: (ctx, evt) => {
        const target = (evt.target ?? dom.getActiveItemEl(ctx)) as HTMLElement
        return !!target.hasAttribute("aria-controls")
      },
      isSubmenu: (ctx) => ctx.isSubmenu,
      suspendPointer: (ctx) => ctx.suspendPointer,
      isActiveItemFocusable: (ctx) => isFocusable(dom.getActiveItemEl(ctx)),
      isWithinPolygon: (ctx, evt) => {
        if (!ctx.intentPolygon) return false
        return withinPolygon(ctx.intentPolygon, evt.point)
      },
    },
    activities: {
      trackPointerDown,
      trackPointerMove(ctx, _evt, { guards = {}, send }) {
        const { isWithinPolygon } = guards
        ctx.parent!.state.context.suspendPointer = true

        const doc = dom.getDoc(ctx)
        return addPointerEvent(doc, "pointermove", (e) => {
          const isMovingToSubmenu = isWithinPolygon(ctx, {
            point: fromPointerEvent(e),
          })
          if (!isMovingToSubmenu) {
            send("CLOSE")
            ctx.parent!.state.context.suspendPointer = false
          }
        })
      },
    },
    actions: {
      setIntentPolygon(ctx, evt) {
        const menu = dom.getMenuEl(ctx)
        if (!menu) return
        let menuRect = fromElement(menu)
        const BUFFER = 20
        menuRect = inset(menuRect, { dx: -BUFFER, dy: -BUFFER })
        const [top, right, left, bottom] = corners(menuRect).value
        ctx.intentPolygon = [evt.point, top, right, bottom, left]
      },
      clearIntentPolygon(ctx) {
        ctx.intentPolygon = null
      },
      resumePointer(ctx) {
        if (!ctx.parent) return
        ctx.parent.state.context.suspendPointer = false
      },
      setId: (ctx, evt) => {
        ctx.uid = evt.id
      },
      setOwnerDocument(ctx, evt) {
        ctx.doc = ref(evt.doc)
      },
      clearActiveId(ctx) {
        ctx.activeId = null
      },
      clearPointerDownNode(ctx) {
        ctx.pointerdownNode = null
      },
      focusMenu(ctx) {
        const menu = dom.getMenuEl(ctx)
        const doc = dom.getDoc(ctx)
        if (menu && doc.activeElement !== menu) {
          nextTick(() => menu.focus())
        }
      },
      focusFirstItem(ctx) {
        const first = dom.getFirstEl(ctx)
        if (!first) return
        ctx.activeId = first.id
      },
      focusLastItem(ctx) {
        const last = dom.getLastEl(ctx)
        if (!last) return
        ctx.activeId = last.id
      },
      focusNextItem(ctx) {
        if (!ctx.activeId) return
        const next = dom.getNextEl(ctx)
        ctx.activeId = next?.id ?? null
      },
      focusPrevItem(ctx) {
        if (!ctx.activeId) return
        const prev = dom.getPrevEl(ctx)
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
        const trigger = dom.getTriggerEl(ctx)
        nextTick(() => trigger?.focus())
      },
      focusMatchedItem(ctx, evt) {
        const node = dom.getElemByKey(ctx, evt.key)
        if (node) ctx.activeId = node.id
      },
      setParent(ctx, evt) {
        ctx.parent = ref(evt.value)
      },
      setChild(ctx, evt) {
        ctx.children[evt.id] = ref(evt.value)
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
        const activeItem = dom.getActiveItemEl(ctx)
        const id = activeItem?.getAttribute("data-uid")
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
        if (!ctx.hoverId) return
        ctx.activeId = ctx.hoverId
        ctx.hoverId = null
      },
      sendRestoreFocus(ctx) {
        ctx.parent?.send("RESTORE_FOCUS")
      },
    },
  },
)
