import { createMachine, guards, ref } from "@zag-js/core"
import { trackDismissableElement } from "@zag-js/dismissable"
import { addDomEvent } from "@zag-js/dom-event"
import {
  contains,
  getByTypeahead,
  getInitialFocus,
  isEditableElement,
  observeAttributes,
  raf,
  scrollIntoView,
} from "@zag-js/dom-query"
import { getPlacement, getPlacementSide } from "@zag-js/popper"
import { getElementPolygon, isPointInPolygon } from "@zag-js/rect-utils"
import { cast, compact, isEqual } from "@zag-js/utils"
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
        highlightedValue: null,
        loopFocus: false,
        anchorPoint: null,
        closeOnSelect: true,
        typeahead: true,
        composite: true,
        ...ctx,
        positioning: {
          placement: "bottom-start",
          gutter: 8,
          ...ctx.positioning,
        },
        intentPolygon: null,
        parent: null,
        lastHighlightedValue: null,
        children: cast(ref({})),
        suspendPointer: false,
        restoreFocus: true,
        typeaheadState: getByTypeahead.defaultOptions,
      },

      computed: {
        isSubmenu: (ctx) => ctx.parent !== null,
        isRtl: (ctx) => ctx.dir === "rtl",
        isTypingAhead: (ctx) => ctx.typeaheadState.keysSoFar !== "",
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
        "HIGHLIGHTED.RESTORE": {
          actions: "restoreHighlightedItem",
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
                actions: ["focusParentMenu", "restoreParentHiglightedItem", "invokeOnClose"],
              },
            ],
          },
          on: {
            "CONTROLLED.OPEN": "open",
            "CONTROLLED.CLOSE": {
              target: "closed",
              actions: ["focusParentMenu", "restoreParentHiglightedItem"],
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
                actions: ["focusParentMenu", "restoreParentHiglightedItem"],
              },
            ],
          },
        },

        closed: {
          tags: ["closed"],
          entry: ["clearHighlightedItem", "focusTrigger", "resumePointer"],
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
              {
                actions: "clickHighlightedItem",
              },
            ],
            ITEM_POINTERMOVE: [
              {
                guard: not("suspendPointer"),
                actions: ["setHighlightedItem", "focusMenu"],
              },
              {
                actions: "setLastHighlightedItem",
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
                actions: ["invokeOnSelect", "setOptionState", "closeRootMenu", "invokeOnClose"],
              },
              {
                guard: and(not("isTriggerItemHighlighted"), not("isHighlightedItemEditable"), "closeOnSelect"),
                target: "closed",
                actions: ["invokeOnSelect", "setOptionState", "closeRootMenu", "invokeOnClose"],
              },
              //
              {
                guard: and(not("isTriggerItemHighlighted"), not("isHighlightedItemEditable")),
                actions: ["invokeOnSelect", "setOptionState"],
              },
              { actions: "setHighlightedItem" },
            ],
            TRIGGER_POINTERLEAVE: {
              target: "closing",
              actions: "setIntentPolygon",
            },
            ITEM_POINTERDOWN: {
              actions: "setHighlightedItem",
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
        isSubmenu: (ctx) => ctx.isSubmenu,
        suspendPointer: (ctx) => ctx.suspendPointer,
        isHighlightedItemEditable: (ctx) => isEditableElement(dom.getHighlightedItemEl(ctx)),
        isWithinPolygon: (ctx, evt) => {
          if (!ctx.intentPolygon) return false
          return isPointInPolygon(ctx.intentPolygon, evt.point)
        },
        // guard assertions (for controlled mode)
        isOpenControlled: (ctx) => !!ctx["open.controlled"],
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
              ctx.onEscapeKeyDown?.(event)
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
            const contentEl = dom.getContentEl(ctx)

            scrollIntoView(itemEl, { rootEl: contentEl, block: "nearest" })
          }
          raf(() => exec())

          const contentEl = () => dom.getContentEl(ctx)
          return observeAttributes(contentEl, {
            defer: true,
            attributes: ["aria-activedescendant"],
            callback: exec,
          })
        },
      },

      actions: {
        setAnchorPoint(ctx, evt) {
          ctx.anchorPoint = evt.point
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
            defer: true,
            getAnchorRect,
            ...(evt.options ?? {}),
            listeners: false,
            onComplete(data) {
              ctx.currentPlacement = data.placement
            },
          })
        },
        setOptionState(_ctx, evt) {
          if (!evt.option) return
          const { checked, onCheckedChange, type } = evt.option

          if (type === "radio") {
            onCheckedChange?.(true)
          } else if (type === "checkbox") {
            onCheckedChange?.(!checked)
          }
        },
        clickHighlightedItem(ctx, _evt) {
          const itemEl = dom.getHighlightedItemEl(ctx)
          if (!itemEl || itemEl.dataset.disabled) return
          queueMicrotask(() => itemEl.click())
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
          set.highlighted(ctx, evt.id)
        },
        clearHighlightedItem(ctx) {
          set.highlighted(ctx, null)
        },
        focusMenu(ctx) {
          raf(() => {
            const contentEl = dom.getContentEl(ctx)
            const initialFocusEl = getInitialFocus({
              root: contentEl,
              enabled: !contains(contentEl, dom.getActiveElement(ctx)),
              filter(node) {
                return !node.role?.startsWith("menuitem")
              },
            })
            initialFocusEl?.focus({ preventScroll: true })
          })
        },
        highlightFirstItem(ctx) {
          const first = dom.getFirstEl(ctx)
          if (!first) return
          set.highlighted(ctx, first.id)
        },
        highlightLastItem(ctx) {
          const last = dom.getLastEl(ctx)
          if (!last) return
          set.highlighted(ctx, last.id)
        },
        highlightNextItem(ctx, evt) {
          const next = dom.getNextEl(ctx, evt.loop)
          set.highlighted(ctx, next?.id ?? null)
        },
        highlightPrevItem(ctx, evt) {
          const prev = dom.getPrevEl(ctx, evt.loop)
          set.highlighted(ctx, prev?.id ?? null)
        },
        invokeOnSelect(ctx) {
          if (!ctx.highlightedValue) return
          ctx.onSelect?.({ value: ctx.highlightedValue })
        },
        focusTrigger(ctx) {
          if (ctx.isSubmenu || ctx.anchorPoint || !ctx.restoreFocus) return
          queueMicrotask(() => dom.getTriggerEl(ctx)?.focus({ preventScroll: true }))
        },
        highlightMatchedItem(ctx, evt) {
          const node = dom.getElemByKey(ctx, evt.key)
          if (!node) return
          set.highlighted(ctx, node.id)
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
        setLastHighlightedItem(ctx, evt) {
          ctx.lastHighlightedValue = evt.id
        },
        restoreHighlightedItem(ctx) {
          if (!ctx.lastHighlightedValue) return
          set.highlighted(ctx, ctx.lastHighlightedValue)
          ctx.lastHighlightedValue = null
        },
        restoreParentHiglightedItem(ctx) {
          ctx.parent?.send("HIGHLIGHTED.RESTORE")
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

const set = {
  highlighted(ctx: MachineContext, value: string | null) {
    if (isEqual(ctx.highlightedValue, value)) return
    ctx.highlightedValue = value
    ctx.onHighlightChange?.({ highlightedValue: value })
  },
}
