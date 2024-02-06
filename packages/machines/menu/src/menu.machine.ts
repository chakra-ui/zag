import { createMachine, guards, ref } from "@zag-js/core"
import { trackDismissableElement } from "@zag-js/dismissable"
import { addDomEvent } from "@zag-js/dom-event"
import { contains, getByTypeahead, isEditableElement, raf } from "@zag-js/dom-query"
import { observeAttributes } from "@zag-js/mutation-observer"
import { getPlacementSide, getPlacement } from "@zag-js/popper"
import { getElementPolygon, isPointInPolygon } from "@zag-js/rect-utils"
import { add, cast, compact, isArray, remove } from "@zag-js/utils"
import { dom } from "./menu.dom"
import type { MachineContext, MachineState, UserDefinedContext } from "./menu.types"

const { not, and, or } = guards

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "menu",
      initial: ctx.open ? "open" : "idle",
      context: {
        highlightedId: null,
        hoverId: null,
        parent: null,
        children: cast(ref({})),
        intentPolygon: null,
        loop: false,
        suspendPointer: false,
        anchorPoint: null,
        closeOnSelect: true,
        restoreFocus: true,
        ...ctx,
        typeahead: getByTypeahead.defaultOptions,
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
        anchorPoint: "reposition",
        open: "toggleVisibility",
      },

      on: {
        "PARENT.SET": {
          actions: "setParentMenu",
        },
        "CHILD.SET": {
          actions: "setChildMenu",
        },
        OPEN: [
          {
            guard: "isOpenControlled",
            actions: "invokeOnOpen",
          },
          {
            target: "open",
            actions: "invokeOnOpen",
          },
        ],
        OPEN_AUTOFOCUS: [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnOpen"],
          },
          {
            internal: true,
            target: "open",
            actions: ["highlightFirstItem", "invokeOnOpen"],
          },
        ],
        CLOSE: [
          {
            guard: "isOpenControlled",
            actions: "invokeOnClose",
          },
          {
            target: "closed",
            actions: "invokeOnClose",
          },
        ],
        RESTORE_FOCUS: {
          actions: "restoreFocus",
        },
        "VALUE.SET": {
          actions: ["setOptionValue", "invokeOnValueChange"],
        },
        "HIGHLIGHTED.SET": {
          actions: "setHighlightedItem",
        },
      },

      states: {
        idle: {
          tags: ["closed"],
          on: {
            "CONTROLLED.OPEN": "open",
            "CONTROLLED.CLOSE": "closed",
            CONTEXT_MENU_START: {
              target: "opening:contextmenu",
              actions: "setAnchorPoint",
            },
            CONTEXT_MENU: [
              {
                guard: "isOpenControlled",
                actions: ["setAnchorPoint", "invokeOnOpen"],
              },
              {
                target: "open",
                actions: ["setAnchorPoint", "invokeOnOpen"],
              },
            ],
            TRIGGER_CLICK: [
              {
                guard: "isOpenControlled",
                actions: "invokeOnOpen",
              },
              {
                target: "open",
                actions: "invokeOnOpen",
              },
            ],
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
          tags: ["closed"],
          after: {
            LONG_PRESS_DELAY: [
              {
                guard: "isOpenControlled",
                actions: "invokeOnOpen",
              },
              {
                target: "open",
                actions: "invokeOnOpen",
              },
            ],
          },
          on: {
            "CONTROLLED.OPEN": "open",
            "CONTROLLED.CLOSE": "closed",
            CONTEXT_MENU_CANCEL: [
              {
                guard: "isOpenControlled",
                actions: "invokeOnClose",
              },
              {
                target: "closed",
                actions: "invokeOnClose",
              },
            ],
          },
        },

        opening: {
          tags: ["closed"],
          after: {
            SUBMENU_OPEN_DELAY: [
              {
                guard: "isOpenControlled",
                actions: "invokeOnOpen",
              },
              {
                target: "open",
                actions: "invokeOnOpen",
              },
            ],
          },
          on: {
            "CONTROLLED.OPEN": "open",
            "CONTROLLED.CLOSE": "closed",
            BLUR: [
              {
                guard: "isOpenControlled",
                actions: "invokeOnClose",
              },
              {
                target: "closed",
                actions: "invokeOnClose",
              },
            ],
            TRIGGER_POINTERLEAVE: [
              {
                guard: "isOpenControlled",
                actions: "invokeOnClose",
              },
              {
                target: "closed",
                actions: "invokeOnClose",
              },
            ],
          },
        },

        closing: {
          tags: ["open"],
          activities: ["trackPointerMove", "trackInteractOutside"],
          after: {
            SUBMENU_CLOSE_DELAY: [
              {
                guard: "isOpenControlled",
                actions: ["invokeOnClose"],
              },
              {
                target: "closed",
                actions: ["focusParentMenu", "restoreParentFocus", "invokeOnClose"],
              },
            ],
          },
          on: {
            "CONTROLLED.OPEN": "open",
            "CONTROLLED.CLOSE": {
              target: "closed",
              actions: ["focusParentMenu", "restoreParentFocus"],
            },
            // don't invoke on open here since the menu is still open (we're only keeping it open)
            MENU_POINTERENTER: {
              target: "open",
              actions: "clearIntentPolygon",
            },
            POINTER_MOVED_AWAY_FROM_SUBMENU: [
              {
                guard: "isOpenControlled",
                actions: "invokeOnClose",
              },
              {
                target: "closed",
                actions: ["focusParentMenu", "restoreParentFocus"],
              },
            ],
          },
        },

        closed: {
          tags: ["closed"],
          entry: ["clearHighlightedItem", "focusTrigger", "clearAnchorPoint", "resumePointer"],
          on: {
            "CONTROLLED.OPEN": [
              {
                guard: or("isOpenAutoFocusEvent", "isArrowDownEvent"),
                target: "open",
                actions: "highlightFirstItem",
              },
              {
                guard: "isArrowUpEvent",
                target: "open",
                actions: "highlightLastItem",
              },
              {
                target: "open",
              },
            ],
            CONTEXT_MENU_START: {
              target: "opening:contextmenu",
              actions: "setAnchorPoint",
            },
            CONTEXT_MENU: [
              {
                guard: "isOpenControlled",
                actions: ["setAnchorPoint", "invokeOnOpen"],
              },
              {
                target: "open",
                actions: ["setAnchorPoint", "invokeOnOpen"],
              },
            ],
            TRIGGER_CLICK: [
              {
                guard: "isOpenControlled",
                actions: "invokeOnOpen",
              },
              {
                target: "open",
                actions: "invokeOnOpen",
              },
            ],
            TRIGGER_POINTERMOVE: {
              guard: "isTriggerItem",
              target: "opening",
            },
            TRIGGER_BLUR: "idle",
            ARROW_DOWN: [
              {
                guard: "isOpenControlled",
                actions: "invokeOnOpen",
              },
              {
                target: "open",
                actions: ["highlightFirstItem", "invokeOnOpen"],
              },
            ],
            ARROW_UP: [
              {
                guard: "isOpenControlled",
                actions: "invokeOnOpen",
              },
              {
                target: "open",
                actions: ["highlightLastItem", "invokeOnOpen"],
              },
            ],
          },
        },

        open: {
          tags: ["open"],
          activities: ["trackInteractOutside", "trackPositioning", "scrollToHighlightedItem"],
          entry: ["focusMenu", "resumePointer"],
          on: {
            "CONTROLLED.CLOSE": [
              {
                target: "closed",
                guard: "isArrowLeftEvent",
                actions: ["focusParentMenu"],
              },
              {
                target: "closed",
              },
            ],
            TRIGGER_CLICK: [
              {
                guard: and(not("isTriggerItem"), "isOpenControlled"),
                actions: "invokeOnClose",
              },
              {
                guard: not("isTriggerItem"),
                target: "closed",
                actions: "invokeOnClose",
              },
            ],
            TAB: [
              {
                guard: "isForwardTabNavigation",
                actions: ["highlightNextItem"],
              },
              {
                actions: ["highlightPrevItem"],
              },
            ],
            ARROW_UP: {
              actions: ["highlightPrevItem", "focusMenu"],
            },
            ARROW_DOWN: {
              actions: ["highlightNextItem", "focusMenu"],
            },
            ARROW_LEFT: [
              {
                guard: and("isSubmenu", "isOpenControlled"),
                actions: "invokeOnClose",
              },
              {
                guard: "isSubmenu",
                target: "closed",
                actions: ["focusParentMenu", "invokeOnClose"],
              },
            ],
            HOME: {
              actions: ["highlightFirstItem", "focusMenu"],
            },
            END: {
              actions: ["highlightLastItem", "focusMenu"],
            },
            ARROW_RIGHT: {
              guard: "isTriggerItemHighlighted",
              actions: "openSubmenu",
            },
            ENTER: [
              {
                guard: "isTriggerItemHighlighted",
                actions: "openSubmenu",
              },
              // == grouped ==
              {
                guard: and("closeOnSelect", "isOpenControlled"),
                actions: ["clickHighlightedItem", "invokeOnClose"],
              },
              {
                guard: "closeOnSelect",
                target: "closed",
                actions: "clickHighlightedItem",
              },
              //
              {
                actions: "clickHighlightedItem",
              },
            ],
            ITEM_POINTERMOVE: [
              {
                guard: not("suspendPointer"),
                actions: ["highlightItem", "focusMenu"],
              },
              {
                actions: "setHoveredItem",
              },
            ],
            ITEM_POINTERLEAVE: {
              guard: and(not("suspendPointer"), not("isTriggerItem")),
              actions: "clearHighlightedItem",
            },
            ITEM_CLICK: [
              // == grouped ==
              {
                guard: and(
                  not("isTriggerItemHighlighted"),
                  not("isHighlightedItemEditable"),
                  "closeOnSelect",
                  "isOpenControlled",
                ),
                actions: [
                  "invokeOnSelect",
                  "changeOptionValue",
                  "invokeOnValueChange",
                  "closeRootMenu",
                  "invokeOnClose",
                ],
              },
              {
                guard: and(not("isTriggerItemHighlighted"), not("isHighlightedItemEditable"), "closeOnSelect"),
                target: "closed",
                actions: [
                  "invokeOnSelect",
                  "changeOptionValue",
                  "invokeOnValueChange",
                  "closeRootMenu",
                  "invokeOnClose",
                ],
              },
              //
              {
                guard: and(not("isTriggerItemHighlighted"), not("isHighlightedItemEditable")),
                actions: ["invokeOnSelect", "changeOptionValue", "invokeOnValueChange"],
              },
              { actions: "highlightItem" },
            ],
            TRIGGER_POINTERLEAVE: {
              target: "closing",
              actions: "setIntentPolygon",
            },
            ITEM_POINTERDOWN: {
              actions: "highlightItem",
            },
            TYPEAHEAD: {
              actions: "highlightMatchedItem",
            },
            FOCUS_MENU: {
              actions: "focusMenu",
            },
            "POSITIONING.SET": {
              actions: "reposition",
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
        closeOnSelect: (ctx, evt) => !!(evt?.closeOnSelect ?? ctx.closeOnSelect),
        // whether the trigger is also a menu item
        isTriggerItem: (_ctx, evt) => dom.isTriggerItem(evt.target),
        // whether the trigger item is the active item
        isTriggerItemHighlighted: (ctx, evt) => {
          const target = (evt.target ?? dom.getHighlightedItemEl(ctx)) as HTMLElement | null
          return !!target?.hasAttribute("aria-controls")
        },
        isForwardTabNavigation: (_ctx, evt) => !evt.shiftKey,
        isSubmenu: (ctx) => ctx.isSubmenu,
        suspendPointer: (ctx) => ctx.suspendPointer,
        isHighlightedItemEditable: (ctx) => isEditableElement(dom.getHighlightedItemEl(ctx)),
        isWithinPolygon: (ctx, evt) => {
          if (!ctx.intentPolygon) return false
          return isPointInPolygon(ctx.intentPolygon, evt.point)
        },
        // guard assertions (for controlled mode)
        isOpenControlled: (ctx) => ctx.__controlled !== undefined,
        isArrowLeftEvent: (_ctx, evt) => evt.previousEvent?.type === "ARROW_LEFT",
        isArrowUpEvent: (_ctx, evt) => evt.previousEvent?.type === "ARROW_UP",
        isArrowDownEvent: (_ctx, evt) => evt.previousEvent?.type === "ARROW_DOWN",
        isOpenAutoFocusEvent: (_ctx, evt) => evt.previousEvent?.type === "OPEN_AUTOFOCUS",
      },

      activities: {
        trackPositioning(ctx) {
          if (ctx.anchorPoint) return
          ctx.currentPlacement = ctx.positioning.placement
          const getPositionerEl = () => dom.getPositionerEl(ctx)
          return getPlacement(dom.getTriggerEl(ctx), getPositionerEl, {
            ...ctx.positioning,
            defer: true,
            onComplete(data) {
              ctx.currentPlacement = data.placement
            },
          })
        },
        trackInteractOutside(ctx, _evt, { send }) {
          const getContentEl = () => dom.getContentEl(ctx)
          return trackDismissableElement(getContentEl, {
            defer: true,
            exclude: [dom.getTriggerEl(ctx)],
            onInteractOutside: ctx.onInteractOutside,
            onFocusOutside: ctx.onFocusOutside,
            onEscapeKeyDown(event) {
              if (ctx.isSubmenu) event.preventDefault()
              closeRootMenu(ctx)
            },
            onPointerDownOutside(event) {
              ctx.restoreFocus = !event.detail.focusable
              ctx.onPointerDownOutside?.(event)
            },
            onDismiss() {
              send({ type: "CLOSE", src: "interact-outside" })
            },
          })
        },
        trackPointerMove(ctx, _evt, { guards, send }) {
          const { isWithinPolygon } = guards
          // NOTE: we're mutating parent context here. sending events to parent doesn't work
          ctx.parent!.state.context.suspendPointer = true

          const doc = dom.getDoc(ctx)
          return addDomEvent(doc, "pointermove", (e) => {
            const point = { x: e.clientX, y: e.clientY }
            const isMovingToSubmenu = isWithinPolygon(ctx, { point })
            if (!isMovingToSubmenu) {
              send("POINTER_MOVED_AWAY_FROM_SUBMENU")
              // NOTE: we're mutating parent context here. sending events to parent doesn't work
              ctx.parent!.state.context.suspendPointer = false
            }
          })
        },
        scrollToHighlightedItem(ctx, _evt, { getState }) {
          const exec = () => {
            const state = getState()
            if (state.event.type.startsWith("ITEM_POINTER")) return
            const itemEl = dom.getHighlightedItemEl(ctx)
            itemEl?.scrollIntoView({ block: "nearest" })
          }
          raf(() => exec())
          return observeAttributes(dom.getContentEl(ctx), ["aria-activedescendant"], exec)
        },
      },

      actions: {
        setAnchorPoint(ctx, evt) {
          ctx.anchorPoint = evt.point
        },
        clearAnchorPoint(ctx) {
          ctx.anchorPoint = null
        },
        setSubmenuPlacement(ctx) {
          if (!ctx.isSubmenu) return
          ctx.positioning.placement = ctx.isRtl ? "left-start" : "right-start"
          ctx.positioning.gutter = 0
        },
        reposition(ctx, evt) {
          const getPositionerEl = () => dom.getPositionerEl(ctx)
          const getAnchorRect = ctx.anchorPoint ? () => ({ width: 0, height: 0, ...ctx.anchorPoint }) : undefined
          getPlacement(dom.getTriggerEl(ctx), getPositionerEl, {
            ...ctx.positioning,
            getAnchorRect,
            ...(evt.options ?? {}),
            listeners: false,
            onComplete(data) {
              ctx.currentPlacement = data.placement
            },
          })
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
        clickHighlightedItem(ctx, _evt, { send }) {
          const itemEl = dom.getHighlightedItemEl(ctx)
          if (!itemEl || itemEl.dataset.disabled) return
          const option = dom.getOptionFromItemEl(itemEl)
          send({
            type: "ITEM_CLICK",
            src: "enter",
            target: itemEl,
            id: option.id,
            option,
            closeOnSelect: ctx.closeOnSelect,
          })
        },
        setIntentPolygon(ctx, evt) {
          const menu = dom.getContentEl(ctx)
          const placement = ctx.currentPlacement

          if (!menu || !placement) return

          const rect = menu.getBoundingClientRect()
          const polygon = getElementPolygon(rect, placement)
          if (!polygon) return

          const rightSide = getPlacementSide(placement) === "right"
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
        setHighlightedItem(ctx, evt) {
          ctx.highlightedId = evt.id
        },
        clearHighlightedItem(ctx) {
          ctx.highlightedId = null
        },
        focusMenu(ctx) {
          raf(() => {
            const activeEl = dom.getActiveElement(ctx)
            const contentEl = dom.getContentEl(ctx)
            if (contains(contentEl, activeEl)) return
            contentEl?.focus({ preventScroll: true })
          })
        },
        highlightFirstItem(ctx) {
          const first = dom.getFirstEl(ctx)
          if (!first) return
          ctx.highlightedId = first.id
        },
        highlightLastItem(ctx) {
          const last = dom.getLastEl(ctx)
          if (!last) return
          ctx.highlightedId = last.id
        },
        highlightNextItem(ctx, evt) {
          const next = dom.getNextEl(ctx, evt.loop)
          ctx.highlightedId = next?.id ?? null
        },
        highlightPrevItem(ctx, evt) {
          const prev = dom.getPrevEl(ctx, evt.loop)
          ctx.highlightedId = prev?.id ?? null
        },
        invokeOnSelect(ctx) {
          if (!ctx.highlightedId) return
          ctx.onSelect?.({ value: ctx.highlightedId })
        },
        highlightItem(ctx, evt) {
          ctx.highlightedId = evt.id
        },
        focusTrigger(ctx) {
          if (ctx.isSubmenu || ctx.anchorPoint || !ctx.restoreFocus) return
          raf(() => dom.getTriggerEl(ctx)?.focus({ preventScroll: true }))
        },
        highlightMatchedItem(ctx, evt) {
          const node = dom.getElemByKey(ctx, evt.key)
          if (node) ctx.highlightedId = node.id
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
          const item = dom.getHighlightedItemEl(ctx)
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
          ctx.highlightedId = ctx.hoverId
          ctx.hoverId = null
        },
        restoreParentFocus(ctx) {
          ctx.parent?.send("RESTORE_FOCUS")
        },
        invokeOnOpen(ctx) {
          ctx.onOpenChange?.({ open: true })
        },
        invokeOnClose(ctx) {
          ctx.onOpenChange?.({ open: false })
        },
        toggleVisibility(ctx, evt, { send }) {
          send({ type: ctx.open ? "CONTROLLED.OPEN" : "CONTROLLED.CLOSE", previousEvent: evt })
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
