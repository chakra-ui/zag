import { createMachine, guards, ref } from "@ui-machines/core"
import { addPointerEvent, contains, isFocusable, nextTick, trackPointerDown } from "@ui-machines/dom-utils"
import { getPlacement } from "@ui-machines/popper"
import { getElementRect, getEventPoint, inset, withinPolygon } from "@ui-machines/rect-utils"
import { add, isArray, remove } from "@ui-machines/utils"
import { dom } from "./menu.dom"
import { MachineContext, MachineState } from "./menu.types"

const { not, and } = guards

export const machine = createMachine<MachineContext, MachineState>(
  {
    id: "menu",
    initial: "unknown",
    context: {
      uid: "",
      pointerdownNode: null,
      activeId: null,
      hoverId: null,
      parent: null,
      children: {},
      intentPolygon: null,
      loop: false,
      suspendPointer: false,
      contextMenuPoint: null,
      positioning: { placement: "bottom-start", gutter: 8 },
    },

    computed: {
      isSubmenu: (ctx) => ctx.parent !== null,
      isRtl: (ctx) => ctx.dir === "rtl",
      isPlacementComplete: (ctx) => !!ctx.currentPlacement,
    },

    created(ctx) {
      if (ctx.contextMenu) {
        ctx.disablePlacement = true
      }
    },

    watch: {
      isSubmenu(ctx) {
        if (ctx.isSubmenu) {
          ctx.positioning.placement = ctx.isRtl ? "left-start" : "right-start"
          ctx.positioning.gutter = 0
        }
      },
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
      CLOSE: "closed",
      SET_POINTER_EXIT: {
        guard: "isTriggerItem",
        actions: "setPointerExit",
      },
      RESTORE_FOCUS: {
        actions: "restoreFocus",
      },
      SET_VALUE: {
        actions: ["setOptionValue", "invokeOnValueChange"],
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
          CONTEXT_MENU_START: {
            target: "opening:contextmenu",
            actions: "setContextMenuPoint",
          },
          CONTEXT_MENU: {
            target: "open",
            actions: "setContextMenuPoint",
          },
          TRIGGER_CLICK: {
            guard: not("isSubmenu"),
            target: "open",
            actions: "focusFirstItem",
          },
          TRIGGER_FOCUS: {
            guard: not("isSubmenu"),
            target: "closed",
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
          CONTEXT_MENU_CANCEL: "closed",
        },
      },

      opening: {
        after: {
          SUBMENU_OPEN_DELAY: "open",
        },
        on: {
          BLUR: "closed",
          TRIGGER_POINTERLEAVE: "closed",
        },
      },

      closing: {
        tags: ["visible"],
        activities: ["trackPointerMove", "computePlacement"],
        after: {
          SUBMENU_CLOSE_DELAY: {
            target: "closed",
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

      closed: {
        entry: [
          "clearActiveId",
          "focusTrigger",
          "clearPointerDownNode",
          "resumePointer",
          "closeChildren",
          "clearContextMenuPoint",
        ],
        on: {
          CONTEXT_MENU_START: {
            target: "opening:contextmenu",
            actions: "setContextMenuPoint",
          },
          CONTEXT_MENU: {
            target: "open",
            actions: "setContextMenuPoint",
          },
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
        tags: ["visible"],
        activities: ["trackPointerDown", "computePlacement"],
        entry: ["focusMenu", "resumePointer"],
        on: {
          TRIGGER_CLICK: {
            guard: not("isTriggerItem"),
            target: "closed",
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
            guard: "isSubmenu",
            target: "closed",
            actions: "focusParentMenu",
          },
          HOME: {
            actions: ["focusFirstItem", "focusMenu"],
          },
          END: {
            actions: ["focusLastItem", "focusMenu"],
          },
          BLUR: {
            target: "closed",
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
              target: "closed",
              actions: ["invokeOnSelect", "closeParents"],
            },
          ],
          ESCAPE: [
            {
              guard: "isSubmenu",
              target: "closed",
              actions: "closeParents",
            },
            { target: "closed" },
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
            target: "closed",
            actions: ["invokeOnSelect", "closeParents", "changeOptionValue", "invokeOnValueChange"],
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
      SUBMENU_CLOSE_DELAY: 200,
    },
    guards: {
      hasActiveId: (ctx) => ctx.activeId !== null,
      isRtl: (ctx) => ctx.isRtl,
      isMenuFocused: (ctx) => {
        const menu = dom.getContentEl(ctx)
        const activeElement = dom.getActiveElement(ctx)
        return contains(menu, activeElement)
      },
      isActiveItem: (ctx, evt) => ctx.activeId === evt.target.id,
      isParentActiveItem: (ctx, evt) => ctx.parent?.state.context.activeId === evt.target.id,
      // whether the trigger is also a menu item
      isTriggerItem: (ctx, evt) => {
        const target = (evt.target ?? dom.getTriggerEl(ctx)) as HTMLElement | null
        return dom.isTriggerItem(target)
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
      computePlacement(ctx) {
        if (ctx.disablePlacement) return
        ctx.currentPlacement = ctx.positioning.placement
        const arrow = dom.getArrowEl(ctx)
        const cleanup = getPlacement(dom.getTriggerEl(ctx), dom.getPositionerEl(ctx), {
          ...ctx.positioning,
          arrow: arrow ? { ...ctx.positioning.arrow, element: arrow } : undefined,
          onPlacementComplete(placement) {
            ctx.currentPlacement = placement
          },
          onCleanup() {
            ctx.currentPlacement = undefined
          },
        })

        return () => cleanup?.()
      },
      trackPointerDown(ctx) {
        return trackPointerDown(dom.getDoc(ctx), (el) => {
          ctx.pointerdownNode = ref(el)
        })
      },
      trackPointerMove(ctx, _evt, { guards, send }) {
        const { isWithinPolygon } = guards
        // hack: we're mutating parent context here. sending events to parent doesn't work
        ctx.parent!.state.context.suspendPointer = true

        const doc = dom.getDoc(ctx)
        return addPointerEvent(doc, "pointermove", (e) => {
          const isMovingToSubmenu = isWithinPolygon(ctx, {
            point: getEventPoint(e),
          })
          if (!isMovingToSubmenu) {
            send("CLOSE")
            // hack: we're mutating parent context here. sending events to parent doesn't work
            ctx.parent!.state.context.suspendPointer = false
          }
        })
      },
    },
    actions: {
      invokeOnValueChange(ctx, evt) {
        if (!ctx.values) return
        const name = evt.name ?? evt.option.name
        const values = ctx.values[name]
        return ctx.onValuesChange?.({ name, value: isArray(values) ? Array.from(values) : values })
      },
      setOptionValue(ctx, evt) {
        if (!ctx.values) return
        ctx.values[evt.name] = evt.value
      },
      changeOptionValue(ctx, evt) {
        if (!evt.option || !ctx.values) return
        const { value, type, name } = evt.option
        const values = ctx.values[name]
        if (type === "checkbox" && isArray(values)) {
          ctx.values[name] = values.includes(value) ? remove(values, value) : add(values, value)
        } else {
          ctx.values[name] = value
        }
      },
      setIntentPolygon(ctx, evt) {
        const menu = dom.getContentEl(ctx)
        if (!menu) return
        let menuRect = getElementRect(menu)
        const BUFFER = 20
        menuRect = inset(menuRect, { dx: -BUFFER, dy: -BUFFER })
        const { top, right, left, bottom } = menuRect.corners

        let polygon = [evt.point, top, right, bottom, left]
        if (ctx.isRtl && ctx.isSubmenu) {
          polygon = [evt.point, top, left, bottom, right]
        }
        ctx.intentPolygon = polygon
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
        const menu = dom.getContentEl(ctx)
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
      focusTrigger(ctx) {
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
