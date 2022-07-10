import { createMachine, guards, ref } from "@zag-js/core"
import { trackDismissableElement } from "@zag-js/dismissable"
import { addPointerEvent, contains, findByTypeahead, getEventPoint, isFocusable, raf } from "@zag-js/dom-utils"
import { getBasePlacement, getPlacement } from "@zag-js/popper"
import { getElementPolygon, isPointInPolygon } from "@zag-js/rect-utils"
import { add, isArray, remove } from "@zag-js/utils"
import { dom } from "./menu.dom"
import type { MachineContext, MachineState, UserDefinedContext } from "./menu.types"

const { not, and } = guards

export function machine(ctx: UserDefinedContext) {
  return createMachine<MachineContext, MachineState>(
    {
      id: "menu",
      initial: "unknown",
      context: {
        activeId: null,
        hoverId: null,
        parent: null,
        children: {},
        intentPolygon: null,
        loop: false,
        suspendPointer: false,
        anchorPoint: null,
        closeOnSelect: true,
        isPlacementComplete: false,
        focusTriggerOnClose: true,
        ...ctx,
        typeahead: findByTypeahead.defaultOptions,
        positioning: {
          placement: "bottom-start",
          gutter: 8,
          ...ctx.positioning,
        },
      },

      computed: {
        isSubmenu: (ctx) => ctx.parent !== null,
        isRtl: (ctx) => ctx.dir === "rtl",
        isTypingAhead: (ctx) => ctx.typeahead.keysSoFar !== "",
      },

      watch: {
        isSubmenu: "setSubmenuPlacement",
        anchorPoint: "applyAnchorPoint",
      },

      on: {
        SET_PARENT: {
          actions: "setParentMenu",
        },
        SET_CHILD: {
          actions: "setChildMenu",
        },
        OPEN: "open",
        OPEN_AUTOFOCUS: {
          internal: true,
          target: "open",
          actions: "focusFirstItem",
        },
        CLOSE: "closed",
        RESTORE_FOCUS: {
          actions: "restoreFocus",
        },
        SET_VALUE: {
          actions: ["setOptionValue", "invokeOnValueChange"],
        },
        SET_ACTIVE_ID: {
          actions: "setFocusedItem",
        },
      },

      states: {
        unknown: {
          on: {
            SETUP: "idle",
          },
        },

        idle: {
          on: {
            CONTEXT_MENU_START: {
              target: "opening:contextmenu",
              actions: "setAnchorPoint",
            },
            CONTEXT_MENU: {
              target: "open",
              actions: "setAnchorPoint",
            },
            TRIGGER_CLICK: "open",
            TRIGGER_FOCUS: {
              guard: not("isSubmenu"),
              target: "closed",
            },
            TRIGGER_POINTERMOVE: {
              guard: "isSubmenu",
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
          activities: ["trackPointerMove", "trackInteractOutside"],
          after: {
            SUBMENU_CLOSE_DELAY: {
              target: "closed",
              actions: ["focusParentMenu", "restoreParentFocus"],
            },
          },
          on: {
            MENU_POINTERENTER: {
              target: "open",
              actions: "clearIntentPolygon",
            },
            POINTER_MOVED_AWAY_FROM_SUBMENU: {
              target: "closed",
              actions: ["focusParentMenu", "restoreParentFocus"],
            },
          },
        },

        closed: {
          entry: ["clearFocusedItem", "focusTrigger", "clearAnchorPoint", "resumePointer"],
          on: {
            CONTEXT_MENU_START: {
              target: "opening:contextmenu",
              actions: "setAnchorPoint",
            },
            CONTEXT_MENU: {
              target: "open",
              actions: "setAnchorPoint",
            },
            TRIGGER_CLICK: "open",
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
          activities: ["trackInteractOutside", "computePlacement"],
          entry: ["focusMenu", "resumePointer"],
          on: {
            TRIGGER_CLICK: {
              guard: not("isTriggerItem"),
              target: "closed",
            },
            ARROW_UP: [
              {
                guard: "hasFocusedItem",
                actions: ["focusPrevItem", "focusMenu"],
              },
              { actions: "focusLastItem" },
            ],
            ARROW_DOWN: [
              {
                guard: "hasFocusedItem",
                actions: ["focusNextItem", "focusMenu"],
              },
              { actions: "focusFirstItem" },
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
            REQUEST_CLOSE: "closed",
            ARROW_RIGHT: {
              guard: "isTriggerItemFocused",
              actions: "openSubmenu",
            },
            ENTER: [
              {
                guard: "isTriggerItemFocused",
                actions: "openSubmenu",
              },
              {
                target: "closed",
                actions: "clickFocusedItem",
              },
            ],
            ITEM_POINTERMOVE: [
              {
                guard: and(not("suspendPointer"), not("isTargetFocused")),
                actions: ["focusItem", "focusMenu"],
              },
              {
                guard: not("isTargetFocused"),
                actions: "setHoveredItem",
              },
            ],
            ITEM_POINTERLEAVE: {
              guard: and(not("suspendPointer"), not("isTriggerItem")),
              actions: "clearFocusedItem",
            },
            ITEM_CLICK: [
              {
                guard: and(not("isTriggerItemFocused"), not("isFocusedItemFocusable"), "closeOnSelect"),
                target: "closed",
                actions: ["invokeOnSelect", "changeOptionValue", "invokeOnValueChange", "closeRootMenu"],
              },
              {
                guard: and(not("isTriggerItemFocused"), not("isFocusedItemFocusable")),
                actions: ["invokeOnSelect", "changeOptionValue", "invokeOnValueChange"],
              },
              { actions: ["focusItem"] },
            ],
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
        SUBMENU_CLOSE_DELAY: 100,
      },

      guards: {
        closeOnSelect: (ctx, evt) => !!(evt.option?.closeOnSelect ?? ctx.closeOnSelect),
        hasFocusedItem: (ctx) => ctx.activeId !== null,
        isMenuFocused: (ctx) => {
          const menu = dom.getContentEl(ctx)
          const activeElement = dom.getActiveElement(ctx)
          return contains(menu, activeElement)
        },
        isTargetFocused: (ctx, evt) => ctx.activeId === evt.target.id,
        // whether the trigger is also a menu item
        isTriggerItem: (ctx, evt) => dom.isTriggerItem(evt.target),
        // whether the trigger item is the active item
        isTriggerItemFocused: (ctx, evt) => {
          const target = (evt.target ?? dom.getFocusedItem(ctx)) as HTMLElement | null
          return !!target?.hasAttribute("aria-controls")
        },
        isSubmenu: (ctx) => ctx.isSubmenu,
        suspendPointer: (ctx) => ctx.suspendPointer,
        isFocusedItemFocusable: (ctx) => isFocusable(dom.getFocusedItem(ctx)),
        isWithinPolygon: (ctx, evt) => {
          if (!ctx.intentPolygon) return false
          return isPointInPolygon(ctx.intentPolygon, evt.point)
        },
      },

      activities: {
        computePlacement(ctx) {
          if (ctx.anchorPoint) return
          ctx.currentPlacement = ctx.positioning.placement
          return getPlacement(dom.getTriggerEl(ctx), dom.getPositionerEl(ctx), {
            ...ctx.positioning,
            onComplete(data) {
              ctx.currentPlacement = data.placement
              ctx.isPlacementComplete = true
            },
          })
        },
        trackInteractOutside(ctx, _evt, { send }) {
          return trackDismissableElement(dom.getContentEl(ctx), {
            exclude: [dom.getTriggerEl(ctx)],
            onEscapeKeyDown(event) {
              if (ctx.isSubmenu) event.preventDefault()
              closeRootMenu(ctx)
            },
            onPointerDownOutside(event) {
              ctx.focusTriggerOnClose = !event.detail.focusable
            },
            onDismiss() {
              send({ type: "REQUEST_CLOSE", src: "interact-outside" })
            },
          })
        },
        trackPointerMove(ctx, _evt, { guards, send }) {
          const { isWithinPolygon } = guards
          // NOTE: we're mutating parent context here. sending events to parent doesn't work
          ctx.parent!.state.context.suspendPointer = true

          const doc = dom.getDoc(ctx)
          return addPointerEvent(doc, "pointermove", (e) => {
            const isMovingToSubmenu = isWithinPolygon(ctx, { point: getEventPoint(e) })
            if (!isMovingToSubmenu) {
              send("POINTER_MOVED_AWAY_FROM_SUBMENU")
              // NOTE: we're mutating parent context here. sending events to parent doesn't work
              ctx.parent!.state.context.suspendPointer = false
            }
          })
        },
      },

      actions: {
        setAnchorPoint(ctx, evt) {
          ctx.anchorPoint = evt.point
        },
        clearAnchorPoint(ctx) {
          ctx.anchorPoint = null
        },
        applyAnchorPoint(ctx) {
          const point = ctx.anchorPoint
          if (!point) return

          const el = dom.getPositionerEl(ctx)
          if (!el) return

          raf(() => {
            Object.assign(el.style, {
              position: "absolute",
              top: "0",
              left: "0",
              transform: `translate3d(${point.x}px, ${point.y}px, 0)`,
            })
            ctx.isPlacementComplete = true
          })
        },
        setSubmenuPlacement(ctx) {
          if (!ctx.isSubmenu) return
          ctx.positioning.placement = ctx.isRtl ? "left-start" : "right-start"
          ctx.positioning.gutter = 0
        },
        invokeOnValueChange(ctx, evt) {
          if (!ctx.value) return
          const name = evt.name ?? evt.option?.name
          if (!name) return
          const values = ctx.value[name]
          const valueAsArray = isArray(values) ? Array.from(values) : values
          ctx.onValueChange?.({ name, value: valueAsArray })
        },
        setOptionValue(ctx, evt) {
          if (!ctx.value) return
          ctx.value[evt.name] = evt.value
        },
        changeOptionValue(ctx, evt) {
          if (!evt.option || !ctx.value) return
          const { value, type, name } = evt.option
          const values = ctx.value[name]
          if (type === "checkbox" && isArray(values)) {
            ctx.value[name] = values.includes(value) ? remove(values, value) : add(values, value)
          } else {
            ctx.value[name] = value
          }
        },
        clickFocusedItem(ctx) {
          dom.getFocusedItem(ctx)?.click()
        },
        setIntentPolygon(ctx, evt) {
          const menu = dom.getContentEl(ctx)
          const placement = ctx.currentPlacement

          if (!menu || !placement) return

          const rect = menu.getBoundingClientRect()
          const polygon = getElementPolygon(rect, placement)
          if (!polygon) return

          const rightSide = getBasePlacement(placement) === "right"
          const bleed = rightSide ? -5 : +5

          ctx.intentPolygon = [{ ...evt.point, x: evt.point.x + bleed }, ...polygon]
        },
        clearIntentPolygon(ctx) {
          ctx.intentPolygon = null
        },
        resumePointer(ctx) {
          if (!ctx.parent) return
          ctx.parent.state.context.suspendPointer = false
        },
        setFocusedItem(ctx, evt) {
          ctx.activeId = evt.id
        },
        clearFocusedItem(ctx) {
          ctx.activeId = null
        },
        focusMenu(ctx) {
          raf(() => dom.getContentEl(ctx)?.focus())
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
          if (!ctx.activeId) return
          ctx.onSelect?.(ctx.activeId)
        },
        focusItem(ctx, event) {
          ctx.activeId = event.id
        },
        focusTrigger(ctx) {
          if (ctx.isSubmenu || ctx.anchorPoint || !ctx.focusTriggerOnClose) return
          raf(() => dom.getTriggerEl(ctx)?.focus())
        },
        focusMatchedItem(ctx, evt) {
          const node = dom.getElemByKey(ctx, evt.key)
          if (node) ctx.activeId = node.id
        },
        setParentMenu(ctx, evt) {
          ctx.parent = ref(evt.value)
        },
        setChildMenu(ctx, evt) {
          ctx.children[evt.id] = ref(evt.value)
        },
        closeRootMenu(ctx) {
          closeRootMenu(ctx)
        },
        openSubmenu(ctx) {
          const item = dom.getFocusedItem(ctx)
          const id = item?.getAttribute("data-uid")
          const child = id ? ctx.children[id] : null
          child?.send("OPEN_AUTOFOCUS")
        },
        focusParentMenu(ctx) {
          ctx.parent?.send("FOCUS_MENU")
        },
        setHoveredItem(ctx, evt) {
          ctx.hoverId = evt.id
        },
        restoreFocus(ctx) {
          if (!ctx.hoverId) return
          ctx.activeId = ctx.hoverId
          ctx.hoverId = null
        },
        restoreParentFocus(ctx) {
          ctx.parent?.send("RESTORE_FOCUS")
        },
      },
    },
  )
}

function closeRootMenu(ctx: MachineContext) {
  let parent = ctx.parent
  while (parent && parent.state.context.isSubmenu) {
    parent = parent.state.context.parent
  }
  parent?.send("CLOSE")
}
