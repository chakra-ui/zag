import { createMachine, guards, ref } from "@ui-machines/core"
import { addPointerEvent, contains, isFocusable, nextTick, trackPointerDown } from "@ui-machines/dom-utils"
import { getElementRect, getEventPoint, inset, withinPolygon } from "@ui-machines/rect-utils"
import { dom } from "./menu.dom"
import { MachineContext, MachineState } from "./menu.types"

const { not, and } = guards

export const machine = createMachine<MachineContext, MachineState>(
  {
    id: "menu-machine",
    initial: "unknown",
    context: {
      pointerdownNode: null,
      orientation: "vertical",
      activeId: null,
      uid: "",
      parent: null,
      children: {},
      intentPolygon: null,
      hoverId: null,
      loop: false,
      suspendPointer: false,
      contextMenuPoint: null,
    },

    computed: {
      isSubmenu: (ctx) => ctx.parent !== null,
      isHorizontal: (ctx) => ctx.orientation === "horizontal",
      isRtl: (ctx) => ctx.isHorizontal && ctx.dir === "rtl",
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
        guard: "isTriggerItem",
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
            actions: "setupDocument",
          },
        },
      },

      idle: {
        on: {
          CONTEXT_MENU_START: "opening:contextmenu",
          TRIGGER_CLICK: {
            target: "open",
            actions: "focusFirstItem",
          },
          TRIGGER_FOCUS: {
            guard: not("isSubmenu"),
            target: "close",
          },
          TRIGGER_POINTERMOVE: {
            guard: and("isTriggerItem", "isParentActiveItem"),
            target: "opening",
          },
        },
      },

      "opening:contextmenu": {
        after: {
          LONG_PRESS_DELAY: "open",
        },
        on: {
          CONTEXT_MENU_CANCEL: "close",
          CONTEXT_MENU: {
            target: "open",
            actions: "setContextMenuPoint",
          },
        },
      },

      opening: {
        after: {
          SUBMENU_OPEN_DELAY: "open",
        },
        on: {
          BLUR: "close",
          TRIGGER_POINTERLEAVE: "close",
        },
      },

      closing: {
        activities: "trackPointerMove",
        after: {
          SUBMENU_CLOSE_DELAY: {
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
        entry: [
          "clearActiveId",
          "focusButton",
          "clearPointerDownNode",
          "resumePointer",
          "closeChildren",
          "clearContextMenuPoint",
        ],
        on: {
          TRIGGER_CLICK: {
            target: "open",
            actions: "focusFirstItem",
          },
          TRIGGER_POINTERMOVE: {
            guard: "isTriggerItem",
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
            guard: not("isTriggerItem"),
            target: "close",
          },
          ARROW_UP: [
            {
              guard: "hasActiveId",
              actions: ["focusPrevItem", "focusMenu"],
            },
            {
              actions: ["focusLastItem"],
            },
          ],
          ARROW_DOWN: [
            {
              guard: "hasActiveId",
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
            guard: "isTriggerActiveItem",
            actions: "openSubmenu",
          },
          ENTER: [
            {
              guard: "isTriggerActiveItem",
              actions: "openSubmenu",
            },
            {
              target: "close",
              actions: ["invokeOnSelect", "closeParents"],
            },
          ],
          ESCAPE: [
            {
              guard: "isSubmenu",
              target: "close",
              actions: "closeParents",
            },
            { target: "close" },
          ],
          ITEM_POINTERMOVE: [
            {
              guard: and(not("isMenuFocused"), not("isTriggerActiveItem"), not("suspendPointer"), not("isActiveItem")),
              actions: ["focusItem", "focusMenu", "closeChildren"],
            },
            {
              guard: and(not("suspendPointer"), not("isActiveItem")),
              actions: "focusItem",
            },
            {
              guard: not("isActiveItem"),
              actions: "setHoveredItem",
            },
          ],
          ITEM_POINTERLEAVE: {
            guard: and(not("isTriggerItem"), not("suspendPointer")),
            actions: "clearActiveId",
          },
          ITEM_CLICK: {
            guard: and(not("isTriggerActiveItem"), not("isActiveItemFocusable")),
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
    delays: {
      LONG_PRESS_DELAY: 700,
      SUBMENU_OPEN_DELAY: 100,
      SUBMENU_CLOSE_DELAY: 150,
    },
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
        const target = (evt.target ?? dom.getTriggerEl(ctx)) as HTMLElement | null
        return !!target?.getAttribute("role")?.startsWith("menuitem") && !!target?.hasAttribute("aria-controls")
      },
      // whether the trigger item is the active item
      isTriggerActiveItem: (ctx, evt) => {
        const target = (evt.target ?? dom.getActiveItemEl(ctx)) as HTMLElement | null
        return !!target?.hasAttribute("aria-controls")
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
      trackPointerDown(ctx) {
        return trackPointerDown(dom.getDoc(ctx), (el) => {
          ctx.pointerdownNode = ref(el)
        })
      },
      trackPointerMove(ctx, _evt, { guards, send }) {
        const { isWithinPolygon } = guards
        ctx.parent!.state.context.suspendPointer = true

        const doc = dom.getDoc(ctx)
        return addPointerEvent(doc, "pointermove", (e) => {
          const isMovingToSubmenu = isWithinPolygon(ctx, {
            point: getEventPoint(e),
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
        let menuRect = getElementRect(menu)
        const BUFFER = 20
        menuRect = inset(menuRect, { dx: -BUFFER, dy: -BUFFER })
        const { top, right, left, bottom } = menuRect.corners
        ctx.intentPolygon = [evt.point, top, right, bottom, left]
      },
      clearIntentPolygon(ctx) {
        ctx.intentPolygon = null
      },
      resumePointer(ctx) {
        if (!ctx.parent) return
        ctx.parent.state.context.suspendPointer = false
      },
      setupDocument(ctx, evt) {
        ctx.uid = evt.id
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
      setContextMenuPoint(ctx, evt) {
        ctx.contextMenuPoint = evt.point
      },
      clearContextMenuPoint(ctx) {
        ctx.contextMenuPoint = null
      },
    },
  },
)
