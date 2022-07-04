import { createMachine, guards, ref } from "@zag-js/core"
import { trackDismissableElement } from "@zag-js/dimissable"
import { addPointerEvent, contains, findByTypeahead, getEventPoint, isFocusable, raf } from "@zag-js/dom-utils"
import { getBasePlacement, getPlacement } from "@zag-js/popper"
import { getElementPolygon, isPointInPolygon } from "@zag-js/rect-utils"
import { add, isArray, remove } from "@zag-js/utils"
import { dom } from "./menu.dom"
import type { MachineContext, MachineState, UserDefinedContext } from "./menu.types"

const { not, and } = guards

export function machine(ctx: UserDefinedContext = {}) {
  return createMachine<MachineContext, MachineState>(
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
        anchorPoint: null,
        closeOnSelect: true,
        isPlacementComplete: false,
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
        OPEN: {
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
          actions: "setActiveId",
        },
      },

      states: {
        unknown: {
          on: {
            SETUP: { target: "idle", actions: "setupDocument" },
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
            TRIGGER_CLICK: {
              guard: not("isSubmenu"),
              target: "open",
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
              actions: "focusParentMenu",
            },
          },
        },

        closed: {
          entry: ["clearActiveId", "focusTrigger", "clearAnchorPoint", "clearPointerDownNode", "resumePointer"],
          on: {
            CONTEXT_MENU_START: {
              target: "opening:contextmenu",
              actions: "setAnchorPoint",
            },
            CONTEXT_MENU: {
              target: "open",
              actions: "setAnchorPoint",
            },
            TRIGGER_CLICK: [
              { guard: "isKeyboardEvent", target: "open", actions: "focusFirstItem" },
              { target: "open" },
            ],
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
                guard: "hasActiveId",
                actions: ["focusPrevItem", "focusMenu"],
              },
              { actions: "focusLastItem" },
            ],
            ARROW_DOWN: [
              {
                guard: "hasActiveId",
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
              guard: "isTriggerActiveItem",
              actions: "openSubmenu",
            },
            ENTER: [
              { guard: "isTriggerActiveItem", actions: "openSubmenu" },
              {
                target: "closed",
                actions: ["invokeOnSelect", "clickActiveOptionIfNeeded", "closeRootMenu"],
              },
            ],
            ITEM_POINTERMOVE: [
              {
                guard: and(
                  not("isMenuFocused"),
                  not("isTriggerActiveItem"),
                  not("suspendPointer"),
                  not("isActiveItem"),
                ),
                actions: ["focusItem", "focusMenu"],
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
            ITEM_CLICK: [
              {
                guard: and(not("isTriggerActiveItem"), not("isActiveItemFocusable"), "closeOnSelect"),
                target: "closed",
                actions: ["invokeOnSelect", "changeOptionValue", "invokeOnValueChange", "closeRootMenu"],
              },
              {
                guard: and(not("isTriggerActiveItem"), not("isActiveItemFocusable")),
                actions: ["invokeOnSelect", "changeOptionValue", "invokeOnValueChange"],
              },
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
        SUBMENU_CLOSE_DELAY: 200,
      },

      guards: {
        closeOnSelect: (ctx, evt) => !!(evt.option?.closeOnSelect ?? ctx.closeOnSelect),
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
          return isPointInPolygon(ctx.intentPolygon, evt.point)
        },
        isKeyboardEvent: (_ctx, evt) => /^(ARROW_DOWN|ARROW_UP|HOME|END)/.test(evt.type) || Boolean(evt.key),
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
            onDismiss() {
              send({ type: "REQUEST_CLOSE" })
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
              left: `${point.x}px`,
              top: `${point.y}px`,
              position: "absolute",
            })
            ctx.isPlacementComplete = true
          })
        },
        setSubmenuPlacement(ctx) {
          if (ctx.isSubmenu) {
            ctx.positioning.placement = ctx.isRtl ? "left-start" : "right-start"
            ctx.positioning.gutter = 0
          }
        },
        invokeOnValueChange(ctx, evt) {
          if (!ctx.values) return
          const name = evt.name ?? evt.option?.name
          if (!name) return
          const values = ctx.values[name]
          const valueAsArray = isArray(values) ? Array.from(values) : values
          ctx.onValuesChange?.({ name, value: valueAsArray })
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
        clickActiveOptionIfNeeded(ctx) {
          const option = dom.getActiveItemEl(ctx)
          if (option?.dataset.part !== "option-item") return
          option.click()
        },
        setIntentPolygon(ctx, evt) {
          const menu = dom.getContentEl(ctx)
          const placement = ctx.currentPlacement

          if (!menu || !placement) return

          const rect = menu.getBoundingClientRect()
          const polygon = getElementPolygon(rect, placement)
          if (!polygon) return

          const rightSide = getBasePlacement(placement) === "right"
          const bleed = rightSide ? -10 : +10

          ctx.intentPolygon = [{ ...evt.point, x: evt.point.x + bleed }, ...polygon]
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
          if (evt.doc) ctx.doc = ref(evt.doc)
          if (evt.root) ctx.rootNode = ref(evt.root)
        },
        setActiveId(ctx, evt) {
          ctx.activeId = evt.id
        },
        clearActiveId(ctx) {
          ctx.activeId = null
        },
        clearPointerDownNode(ctx) {
          ctx.pointerdownNode = null
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
          if (ctx.activeId) {
            ctx.onSelect?.(ctx.activeId)
          }
        },
        focusItem(ctx, event) {
          ctx.activeId = event.id
        },
        focusTrigger(ctx) {
          // only want to re-focus trigger if it's not a submenu or the
          // menu was not manually positioned (e.g. context menu)
          if (ctx.parent || ctx.anchorPoint) return
          const trigger = dom.getTriggerEl(ctx)
          raf(() => trigger?.focus())
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
          const activeItem = dom.getActiveItemEl(ctx)
          const id = activeItem?.getAttribute("data-uid")
          const child = id ? ctx.children[id] : null
          child?.send("OPEN")
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
