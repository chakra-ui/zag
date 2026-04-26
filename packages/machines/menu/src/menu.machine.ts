import { createGuards, createMachine } from "@zag-js/core"
import { trackDismissableElement } from "@zag-js/dismissable"
import {
  addDomEvent,
  clickIfLink,
  contains,
  getByTypeahead,
  getEventTarget,
  getInitialFocus,
  isAnchorElement,
  isEditableElement,
  observeAttributes,
  raf,
  scrollIntoView,
} from "@zag-js/dom-query"
import { getInteractionModality, setInteractionModality, trackFocusVisible } from "@zag-js/focus-visible"
import { getPlacement, getPlacementSide, type Placement } from "@zag-js/popper"
import { getElementPolygon, isPointInPolygon, type Point } from "@zag-js/rect-utils"
import { isEqual } from "@zag-js/utils"
import { parts } from "./menu.anatomy"
import * as dom from "./menu.dom"
import type { MenuSchema } from "./menu.types"
import {
  closeRootMenu,
  isWithinPolygon,
  resolveItemId,
  setParentRoutingLock,
  unlockParentAfterChildClose,
  unlockParentOnSubmenuClose,
} from "./menu.utils"

const { not, and, or } = createGuards<MenuSchema>()

export const machine = createMachine<MenuSchema>({
  props({ props }) {
    return {
      closeOnSelect: true,
      typeahead: true,
      composite: true,
      loopFocus: false,
      navigate(details) {
        clickIfLink(details.node)
      },
      ...props,
      positioning: {
        placement: "bottom-start",
        gutter: 8,
        ...props.positioning,
      },
    }
  },
  initialState({ prop }) {
    const open = prop("open") || prop("defaultOpen")
    return open ? "open" : "idle"
  },

  context({ bindable, prop, scope }) {
    return {
      highlightedValue: bindable<string | null>(() => ({
        defaultValue: prop("defaultHighlightedValue") || null,
        value: prop("highlightedValue"),
        onChange(value) {
          prop("onHighlightChange")?.({ highlightedValue: value })
        },
      })),
      lastHighlightedValue: bindable<string | null>(() => ({
        defaultValue: null,
      })),
      currentPlacement: bindable<Placement | undefined>(() => ({
        defaultValue: undefined,
      })),
      intentPolygon: bindable<Point[] | null>(() => ({
        defaultValue: null,
      })),
      anchorPoint: bindable<Point | null>(() => ({
        defaultValue: null,
        hash(value) {
          return `x: ${value?.x}, y: ${value?.y}`
        },
      })),
      isSubmenu: bindable<boolean>(() => ({
        defaultValue: false,
      })),
      triggerValue: bindable<string | null>(() => ({
        defaultValue: prop("defaultTriggerValue") ?? null,
        value: prop("triggerValue"),
        onChange(value) {
          const onTriggerValueChange = prop("onTriggerValueChange")
          if (!onTriggerValueChange) return
          const triggerElement = dom.getActiveTriggerEl(scope, value)
          onTriggerValueChange({ value, triggerElement })
        },
      })),
      pointerRoutingMode: bindable<"interactive" | "locked">(() => ({
        defaultValue: "interactive",
      })),
      positioned: bindable(() => ({ defaultValue: false })),
    }
  },

  refs() {
    return {
      parent: null,
      children: {},
      pointerRoutingLocked: false,
      typeaheadState: { ...getByTypeahead.defaultOptions },
      positioningOverride: {},
    }
  },

  computed: {
    isRtl: ({ prop }) => prop("dir") === "rtl",
    isTypingAhead: ({ refs }) => refs.get("typeaheadState").keysSoFar !== "",
    highlightedId: ({ context, scope, refs }) =>
      resolveItemId(refs.get("children"), context.get("highlightedValue"), scope),
  },

  watch({ track, action, context, prop }) {
    track([() => context.get("isSubmenu")], () => {
      action(["setSubmenuPlacement"])
    })
    track([() => context.hash("anchorPoint")], () => {
      if (!context.get("anchorPoint")) return
      action(["reposition"])
    })
    track([() => prop("open")], () => {
      action(["toggleVisibility"])
    })
  },

  on: {
    "TRIGGER_VALUE.SET": {
      actions: ["setTriggerValue", "setAnchorPoint", "reposition", "focusMenu"],
    },
    "PARENT.SET": {
      actions: ["setParentMenu"],
    },
    "CHILD.SET": {
      actions: ["setChildMenu"],
    },
    OPEN: [
      {
        guard: "isOpenControlled",
        actions: ["setTriggerValue", "invokeOnOpen"],
      },
      {
        target: "open",
        actions: ["setTriggerValue", "invokeOnOpen"],
      },
    ],
    OPEN_AUTOFOCUS: [
      {
        guard: "isOpenControlled",
        actions: ["setTriggerValue", "invokeOnOpen"],
      },
      {
        // internal: true,
        target: "open",
        actions: ["setTriggerValue", "highlightFirstItem", "invokeOnOpen"],
      },
    ],
    CLOSE: [
      {
        guard: "isOpenControlled",
        actions: ["invokeOnClose", "releaseParentRoutingLock"],
      },
      {
        target: "closed",
        actions: ["invokeOnClose", "releaseParentRoutingLock", "focusTrigger"],
      },
    ],
    "HIGHLIGHTED.RESTORE": {
      actions: ["restoreHighlightedItem"],
    },
    "HIGHLIGHTED.SET": {
      actions: ["setHighlightedItem"],
    },
    "HIGHLIGHTED.SUGGEST": {
      actions: ["suggestHighlightedItem"],
    },
  },

  states: {
    idle: {
      tags: ["closed"],
      on: {
        "CONTROLLED.OPEN": {
          target: "open",
        },
        "CONTROLLED.CLOSE": {
          target: "closed",
        },
        CONTEXT_MENU_START: {
          target: "opening:contextmenu",
          actions: ["setAnchorPoint", "setTriggerValue"],
        },
        CONTEXT_MENU: [
          {
            guard: "isOpenControlled",
            actions: ["setAnchorPoint", "setTriggerValue", "invokeOnOpen"],
          },
          {
            target: "open",
            actions: ["setAnchorPoint", "setTriggerValue", "invokeOnOpen"],
          },
        ],
        TRIGGER_CLICK: [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnOpen", "setTriggerValue"],
          },
          {
            target: "open",
            actions: ["invokeOnOpen", "setTriggerValue"],
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
      effects: ["waitForLongPress"],
      on: {
        "CONTROLLED.OPEN": { target: "open" },
        "CONTROLLED.CLOSE": { target: "closed", actions: ["focusTrigger"] },
        CONTEXT_MENU_CANCEL: [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnClose", "releaseParentRoutingLock"],
          },
          {
            target: "closed",
            actions: ["invokeOnClose", "releaseParentRoutingLock", "focusTrigger"],
          },
        ],
        "LONG_PRESS.OPEN": [
          {
            guard: "isOpenControlled",
            actions: ["setTriggerValue", "invokeOnOpen"],
          },
          {
            target: "open",
            actions: ["setTriggerValue", "invokeOnOpen"],
          },
        ],
      },
    },

    opening: {
      tags: ["closed"],
      effects: ["waitForOpenDelay"],
      on: {
        "CONTROLLED.OPEN": {
          target: "open",
        },
        "CONTROLLED.CLOSE": {
          target: "closed",
          actions: ["focusTrigger"],
        },
        BLUR: [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnClose", "releaseParentRoutingLock"],
          },
          {
            target: "closed",
            actions: ["invokeOnClose", "releaseParentRoutingLock", "focusTrigger"],
          },
        ],
        TRIGGER_POINTERLEAVE: [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnClose", "releaseParentRoutingLock"],
          },
          {
            target: "closed",
            actions: ["invokeOnClose", "releaseParentRoutingLock", "focusTrigger"],
          },
        ],
        "DELAY.OPEN": [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnOpen"],
          },
          {
            target: "open",
            actions: ["invokeOnOpen"],
          },
        ],
      },
    },

    closing: {
      tags: ["open"],
      effects: ["trackPointerMove", "trackInteractOutside", "waitForCloseDelay"],
      on: {
        "CONTROLLED.OPEN": {
          target: "open",
        },
        "CONTROLLED.CLOSE": {
          target: "closed",
          actions: ["focusParentMenu", "restoreParentHighlightedItem"],
        },
        // don't invoke on open here since the menu is still open (we're only keeping it open)
        MENU_POINTERENTER: {
          target: "open",
          actions: ["clearIntentPolygon"],
        },
        POINTER_MOVED_AWAY_FROM_SUBMENU: [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnClose", "releaseParentRoutingLock"],
          },
          {
            target: "closed",
            actions: ["focusParentMenu", "restoreParentHighlightedItem"],
          },
        ],
        "DELAY.CLOSE": [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnClose", "releaseParentRoutingLock"],
          },
          {
            target: "closed",
            actions: ["focusParentMenu", "restoreParentHighlightedItem", "invokeOnClose", "releaseParentRoutingLock"],
          },
        ],
      },
    },

    closed: {
      tags: ["closed"],
      entry: ["clearHighlightedItem", "unlockParentOnClose", "clearAnchorPoint"],
      on: {
        "CONTROLLED.OPEN": [
          {
            guard: or("isOpenAutoFocusEvent", "isArrowDownEvent"),
            target: "open",
            actions: ["highlightFirstItem"],
          },
          {
            guard: "isArrowUpEvent",
            target: "open",
            actions: ["highlightLastItem"],
          },
          {
            target: "open",
          },
        ],
        CONTEXT_MENU_START: {
          target: "opening:contextmenu",
          actions: ["setAnchorPoint", "setTriggerValue"],
        },
        CONTEXT_MENU: [
          {
            guard: "isOpenControlled",
            actions: ["setAnchorPoint", "setTriggerValue", "invokeOnOpen"],
          },
          {
            target: "open",
            actions: ["setAnchorPoint", "setTriggerValue", "invokeOnOpen"],
          },
        ],
        TRIGGER_CLICK: [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnOpen", "setTriggerValue"],
          },
          {
            target: "open",
            actions: ["invokeOnOpen", "setTriggerValue"],
          },
        ],
        TRIGGER_POINTERMOVE: {
          guard: "isTriggerItem",
          target: "opening",
        },
        TRIGGER_BLUR: { target: "idle" },
        ARROW_DOWN: [
          {
            guard: "isOpenControlled",
            actions: ["setTriggerValue", "invokeOnOpen"],
          },
          {
            target: "open",
            actions: ["setTriggerValue", "highlightFirstItem", "invokeOnOpen"],
          },
        ],
        ARROW_UP: [
          {
            guard: "isOpenControlled",
            actions: ["setTriggerValue", "invokeOnOpen"],
          },
          {
            target: "open",
            actions: ["setTriggerValue", "highlightLastItem", "invokeOnOpen"],
          },
        ],
      },
    },

    open: {
      tags: ["open"],
      effects: ["trackInteractOutside", "trackFocusVisible", "trackPositioning", "scrollToHighlightedItem"],
      entry: ["focusMenu", "unlockParentOnOpen"],
      exit: ["clearPositioned"],
      on: {
        "CONTROLLED.CLOSE": [
          {
            target: "closed",
            guard: "isArrowLeftEvent",
            actions: ["focusParentMenu"],
          },
          {
            target: "closed",
            actions: ["focusTrigger"],
          },
        ],
        TRIGGER_CLICK: [
          {
            guard: and(not("isTriggerItem"), "isOpenControlled"),
            actions: ["invokeOnClose", "releaseParentRoutingLock"],
          },
          {
            guard: not("isTriggerItem"),
            target: "closed",
            actions: ["invokeOnClose", "releaseParentRoutingLock", "focusTrigger"],
          },
        ],
        CONTEXT_MENU: {
          actions: ["setAnchorPoint", "setTriggerValue", "focusMenu"],
        },
        ARROW_UP: {
          actions: ["highlightPrevItem", "focusMenu"],
        },
        ARROW_DOWN: {
          actions: ["highlightNextItem", "focusMenu"],
        },
        ARROW_LEFT: [
          {
            guard: and("isSubmenu", "isOpenControlled"),
            actions: ["invokeOnClose", "releaseParentRoutingLock"],
          },
          {
            guard: "isSubmenu",
            target: "closed",
            actions: ["focusParentMenu", "invokeOnClose", "releaseParentRoutingLock"],
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
          actions: ["openSubmenu"],
        },
        ENTER: [
          {
            guard: "isTriggerItemHighlighted",
            actions: ["openSubmenu"],
          },
          {
            actions: ["clickHighlightedItem"],
          },
        ],
        ITEM_POINTERMOVE: [
          {
            guard: not("isPointerRoutingLocked"),
            actions: ["setHighlightedItem", "focusMenu", "closeSiblingMenus"],
          },
          {
            actions: ["setLastHighlightedItem", "closeSiblingMenus"],
          },
        ],
        ITEM_POINTERLEAVE: {
          guard: and(not("isPointerRoutingLocked"), not("isTriggerItem")),
          actions: ["clearHighlightedItem"],
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
            actions: ["invokeOnSelect", "setOptionState", "closeRootMenu", "invokeOnClose", "releaseParentRoutingLock"],
          },
          {
            guard: and(not("isTriggerItemHighlighted"), not("isHighlightedItemEditable"), "closeOnSelect"),
            target: "closed",
            actions: [
              "invokeOnSelect",
              "setOptionState",
              "closeRootMenu",
              "invokeOnClose",
              "releaseParentRoutingLock",
              "focusTrigger",
            ],
          },
          //
          {
            guard: and(not("isTriggerItemHighlighted"), not("isHighlightedItemEditable")),
            actions: ["invokeOnSelect", "setOptionState"],
          },
          { actions: ["setHighlightedItem"] },
        ],
        TRIGGER_POINTERMOVE: {
          guard: "isTriggerItem",
          actions: ["setIntentPolygon"],
        },
        TRIGGER_POINTERLEAVE: {
          target: "closing",
          actions: ["setIntentPolygon"],
        },
        ITEM_POINTERDOWN: {
          actions: ["setHighlightedItem"],
        },
        TYPEAHEAD: {
          actions: ["highlightMatchedItem"],
        },
        FOCUS_MENU: {
          actions: ["focusMenu"],
        },
        "POSITIONING.SET": {
          actions: ["reposition"],
        },
      },
    },
  },

  implementations: {
    guards: {
      closeOnSelect: ({ prop, event }) => !!(event?.closeOnSelect ?? prop("closeOnSelect")),
      // whether the trigger is also a menu item
      isTriggerItem: ({ event }) => dom.isTriggerItem(event.target),
      // whether the trigger item is the active item
      isTriggerItemHighlighted: ({ event, scope, computed }) => {
        const target = (event.target ?? scope.getById(computed("highlightedId")!)) as HTMLElement | null
        return !!target?.hasAttribute("data-controls")
      },
      isSubmenu: ({ context }) => context.get("isSubmenu"),
      isPointerRoutingLocked: ({ refs }) => refs.get("pointerRoutingLocked"),
      isHighlightedItemEditable: ({ scope, computed }) => isEditableElement(scope.getById(computed("highlightedId")!)),
      // guard assertions (for controlled mode)
      isOpenControlled: ({ prop }) => prop("open") !== undefined,
      isArrowLeftEvent: ({ event }) => event.previousEvent?.type === "ARROW_LEFT",
      isArrowUpEvent: ({ event }) => event.previousEvent?.type === "ARROW_UP",
      isArrowDownEvent: ({ event }) => event.previousEvent?.type === "ARROW_DOWN",
      isOpenAutoFocusEvent: ({ event }) => event.previousEvent?.type === "OPEN_AUTOFOCUS",
    },

    effects: {
      waitForOpenDelay({ send }) {
        const timer = setTimeout(() => {
          send({ type: "DELAY.OPEN" })
        }, 200)
        return () => clearTimeout(timer)
      },
      waitForCloseDelay({ send }) {
        const timer = setTimeout(() => {
          send({ type: "DELAY.CLOSE" })
        }, 100)
        return () => clearTimeout(timer)
      },
      waitForLongPress({ send }) {
        const timer = setTimeout(() => {
          send({ type: "LONG_PRESS.OPEN" })
        }, 700)
        return () => clearTimeout(timer)
      },
      trackFocusVisible({ scope }) {
        return trackFocusVisible({ root: scope.getRootNode?.() })
      },
      trackPositioning({ context, prop, scope, refs }) {
        // Context menus use anchorPoint-based positioning via watch, not trigger-based
        const hasContextTrigger = dom.getContextTriggerEl(scope) || dom.getContextTriggerEls(scope).length > 0
        if (hasContextTrigger) return
        const positioning = {
          ...prop("positioning"),
          ...refs.get("positioningOverride"),
        }
        context.set("currentPlacement", positioning.placement!)
        const getPositionerEl = () => dom.getPositionerEl(scope)
        const getTriggerEl = () => dom.getActiveTriggerEl(scope, context.get("triggerValue"))
        return getPlacement(getTriggerEl, getPositionerEl, {
          ...positioning,
          defer: true,
          onComplete(data) {
            context.set("currentPlacement", data.placement)
            context.set("positioned", true)
          },
        })
      },
      trackInteractOutside({ refs, scope, prop, context, send }) {
        const getContentEl = () => dom.getContentEl(scope)
        let restoreFocus = true

        // Helper to check if target is within any context trigger
        const isWithinAnyContextTrigger = (target: EventTarget | null) => {
          return dom.getContextTriggerEls(scope).some((el) => contains(el, target as Element | null))
        }

        return trackDismissableElement(getContentEl, {
          type: "menu",
          defer: true,
          exclude: [dom.getTriggerEl(scope), ...dom.getTriggerEls(scope)].filter(Boolean) as HTMLElement[],
          onInteractOutside: prop("onInteractOutside"),
          onRequestDismiss: prop("onRequestDismiss"),
          onFocusOutside(event) {
            prop("onFocusOutside")?.(event)

            const target = getEventTarget(event.detail.originalEvent)
            if (isWithinAnyContextTrigger(target)) {
              event.preventDefault()
              return
            }
            if (dom.isTargetWithinMenuTree(target, refs.get("children"))) {
              event.preventDefault()
              return
            }
          },
          onEscapeKeyDown(event) {
            prop("onEscapeKeyDown")?.(event)
            if (context.get("isSubmenu")) event.preventDefault()
            closeRootMenu({ parent: refs.get("parent") })
          },
          onPointerDownOutside(event) {
            prop("onPointerDownOutside")?.(event)

            const target = getEventTarget(event.detail.originalEvent)
            // Only prevent dismissal for right-clicks on context triggers
            // Left-clicks should dismiss the menu normally
            if (isWithinAnyContextTrigger(target) && event.detail.contextmenu) {
              event.preventDefault()
              return
            }
            restoreFocus = !event.detail.focusable
          },
          onDismiss() {
            send({ type: "CLOSE", src: "interact-outside", restoreFocus })
          },
        })
      },
      trackPointerMove({ context, scope, send, refs }) {
        const parent = refs.get("parent")
        if (!parent) return

        setParentRoutingLock(parent, true)

        const doc = scope.getDoc()

        return addDomEvent(doc, "pointermove", (e) => {
          const isMovingToSubmenu = isWithinPolygon(context.get("intentPolygon"), {
            x: e.clientX,
            y: e.clientY,
          })

          if (!isMovingToSubmenu) {
            send({ type: "POINTER_MOVED_AWAY_FROM_SUBMENU" })
            setParentRoutingLock(parent, false)
          }
        })
      },
      scrollToHighlightedItem({ scope, computed }) {
        const exec = () => {
          // don't scroll into view if we're using the pointer (or null when focus-trap autofocuses)
          const modality = getInteractionModality()
          if (modality === "pointer") return

          const itemEl = scope.getById(computed("highlightedId")!)
          const contentEl = dom.getContentEl(scope)

          scrollIntoView(itemEl, { rootEl: contentEl, block: "nearest" })
        }
        raf(() => {
          setInteractionModality("virtual")
          exec()
        })

        const contentEl = () => dom.getContentEl(scope)
        return observeAttributes(contentEl, {
          defer: true,
          attributes: ["aria-activedescendant"],
          callback: exec,
        })
      },
    },

    actions: {
      setAnchorPoint({ context, event }) {
        context.set("anchorPoint", (prev) => (isEqual(prev, event.point) ? prev : event.point))
      },
      setSubmenuPlacement({ context, computed, refs }) {
        if (!context.get("isSubmenu")) return
        const placement = computed("isRtl") ? "left-start" : "right-start"
        refs.set("positioningOverride", { placement, gutter: 0 })
      },
      reposition({ context, scope, prop, event, refs }) {
        const getPositionerEl = () => dom.getPositionerEl(scope)
        // Use event.point if available for immediate repositioning (context menu)
        const anchorPoint = event.point ?? context.get("anchorPoint")

        const getAnchorRect = anchorPoint ? () => ({ width: 0, height: 0, ...anchorPoint }) : undefined

        const positioning = {
          ...prop("positioning"),
          ...refs.get("positioningOverride"),
        }

        // Use event.value if available for immediate repositioning (avoids lag)
        const triggerValue = event.value ?? context.get("triggerValue")
        const getTriggerEl = () => dom.getActiveTriggerEl(scope, triggerValue)
        getPlacement(getTriggerEl, getPositionerEl, {
          ...positioning,
          defer: true,
          getAnchorRect,
          ...(event.options ?? {}),
          listeners: false,
          onComplete(data) {
            context.set("currentPlacement", data.placement)
            context.set("positioned", true)
          },
        })
      },
      setOptionState({ event }) {
        if (!event.option) return
        const { checked, onCheckedChange, type } = event.option
        if (type === "radio") {
          onCheckedChange?.(true)
        } else if (type === "checkbox") {
          onCheckedChange?.(!checked)
        }
      },
      clickHighlightedItem({ scope, computed, prop, context }) {
        const itemEl = scope.getById(computed("highlightedId")!)
        if (!itemEl || itemEl.dataset.disabled) return
        const highlightedValue = context.get("highlightedValue")

        if (isAnchorElement(itemEl)) {
          prop("navigate")?.({ value: highlightedValue!, node: itemEl, href: itemEl.href })
        } else {
          queueMicrotask(() => itemEl.click())
        }
      },
      setIntentPolygon({ context, scope, event }) {
        const menu = dom.getContentEl(scope)
        const placement = context.get("currentPlacement")

        if (!menu || !placement) return

        const rect = menu.getBoundingClientRect()
        const polygon = getElementPolygon(rect, placement)
        if (!polygon) return

        const rightSide = getPlacementSide(placement) === "right"
        const bleed = rightSide ? -5 : +5

        context.set("intentPolygon", [{ ...event.point, x: event.point.x + bleed }, ...polygon])
      },
      clearIntentPolygon({ context }) {
        context.set("intentPolygon", null)
      },
      clearAnchorPoint({ context }) {
        context.set("anchorPoint", null)
      },
      unlockParentOnOpen({ refs, context, scope }) {
        const parent = refs.get("parent")
        if (context.get("isSubmenu")) {
          const value = dom.getTriggerId(scope)
          parent?.send({ type: "HIGHLIGHTED.SUGGEST", value })
        }
        setParentRoutingLock(parent, false)
      },
      unlockParentOnClose({ refs, context }) {
        unlockParentAfterChildClose(refs.get("parent"), context.get("isSubmenu"))
      },
      setHighlightedItem({ context, event }) {
        const value = event.value || dom.getItemValue(event.target)
        context.set("highlightedValue", value)
      },
      clearHighlightedItem({ context }) {
        context.set("highlightedValue", null)
      },
      focusMenu({ scope }) {
        raf(() => {
          const contentEl = dom.getContentEl(scope)
          const initialFocusEl = getInitialFocus({
            root: contentEl,
            enabled: !contains(contentEl, scope.getActiveElement()),
            filter(node) {
              return !node.role?.startsWith("menuitem")
            },
          })
          initialFocusEl?.focus({ preventScroll: true })
        })
      },
      highlightFirstItem({ context, scope }) {
        // use raf in event content is lazy mounted
        const fn = dom.getContentEl(scope) ? queueMicrotask : raf
        fn(() => {
          const first = dom.getFirstEl(scope)
          if (!first) return
          context.set("highlightedValue", dom.getItemValue(first))
        })
      },
      highlightLastItem({ context, scope }) {
        // use raf in event content is lazy mounted
        const fn = dom.getContentEl(scope) ? queueMicrotask : raf
        fn(() => {
          const last = dom.getLastEl(scope)
          if (!last) return
          context.set("highlightedValue", dom.getItemValue(last))
        })
      },
      highlightNextItem({ context, scope, event, prop }) {
        const next = dom.getNextEl(scope, {
          loop: event.loop,
          value: context.get("highlightedValue"),
          loopFocus: prop("loopFocus"),
        })
        context.set("highlightedValue", dom.getItemValue(next))
      },
      highlightPrevItem({ context, scope, event, prop }) {
        const prev = dom.getPrevEl(scope, {
          loop: event.loop,
          value: context.get("highlightedValue"),
          loopFocus: prop("loopFocus"),
        })
        context.set("highlightedValue", dom.getItemValue(prev))
      },
      invokeOnSelect({ context, prop, scope }) {
        const value = context.get("highlightedValue")
        if (value == null) return

        const node = dom.getItemEl(scope, value)
        dom.dispatchSelectionEvent(node, value)

        prop("onSelect")?.({ value })
      },
      focusTrigger({ scope, context, event }) {
        if (context.get("isSubmenu") || context.get("anchorPoint") || event.restoreFocus === false) return
        queueMicrotask(() => {
          const triggerEl = dom.getActiveTriggerEl(scope, context.get("triggerValue"))
          triggerEl?.focus({ preventScroll: true })
        })
      },
      highlightMatchedItem({ scope, context, event, refs }) {
        const node = dom.getElemByKey(scope, {
          key: event.key,
          value: context.get("highlightedValue"),
          typeaheadState: refs.get("typeaheadState"),
        })
        if (!node) return
        context.set("highlightedValue", dom.getItemValue(node))
      },
      setParentMenu({ refs, event, context }) {
        refs.set("parent", event.value)
        context.set("isSubmenu", true)
      },
      setChildMenu({ refs, event }) {
        const children = refs.get("children")
        children[event.id] = event.value
        refs.set("children", children)
      },
      closeSiblingMenus({ refs, event, scope }) {
        const target = event.target
        if (!dom.isTriggerItem(target)) return
        const hoveredChildId = target?.getAttribute(parts.triggerItem.attr)
        const children = refs.get("children")
        for (const id in children) {
          if (id === hoveredChildId) continue
          const child = children[id]
          // Don't close if pointer is within the child's intent polygon (user moving toward submenu)
          const intentPolygon = child.context.get("intentPolygon")
          if (intentPolygon && event.point && isPointInPolygon(intentPolygon, event.point)) {
            continue
          }
          // Focus parent menu before closing to prevent focus from escaping
          // (fixes issue where submenus with focusable elements cause parent to close)
          dom.getContentEl(scope)?.focus({ preventScroll: true })
          child.send({ type: "CLOSE" })
        }
      },
      closeRootMenu({ refs }) {
        closeRootMenu({ parent: refs.get("parent") })
      },
      openSubmenu({ refs, scope, computed }) {
        const item = scope.getById(computed("highlightedId")!)
        const id = item?.getAttribute(parts.triggerItem.attr)
        const children = refs.get("children")
        const child = id ? children[id] : null
        child?.send({ type: "OPEN_AUTOFOCUS" })
      },
      focusParentMenu({ refs }) {
        refs.get("parent")?.send({ type: "FOCUS_MENU" })
      },
      setLastHighlightedItem({ context, event }) {
        context.set("lastHighlightedValue", dom.getItemValue(event.target))
      },
      suggestHighlightedItem({ context, event }) {
        const value = event.value
        if (!value) return
        if (context.get("highlightedValue") != null) {
          context.set("lastHighlightedValue", value)
          return
        }
        context.set("highlightedValue", value)
      },
      restoreHighlightedItem({ context }) {
        const last = context.get("lastHighlightedValue")
        context.set("lastHighlightedValue", null)
        if (!last) return
        context.set("highlightedValue", last)
      },
      restoreParentHighlightedItem({ refs }) {
        refs.get("parent")?.send({ type: "HIGHLIGHTED.RESTORE" })
      },
      invokeOnOpen({ prop }) {
        prop("onOpenChange")?.({ open: true })
      },
      invokeOnClose({ prop }) {
        prop("onOpenChange")?.({ open: false })
      },
      releaseParentRoutingLock({ refs, context }) {
        if (!context.get("isSubmenu")) return
        unlockParentOnSubmenuClose(refs.get("parent"))
      },
      clearPositioned({ context }) {
        context.set("positioned", false)
      },
      toggleVisibility({ prop, event, send }) {
        send({
          type: prop("open") ? "CONTROLLED.OPEN" : "CONTROLLED.CLOSE",
          previousEvent: event,
        })
      },
      setTriggerValue({ context, event }) {
        if (event.value === undefined) return
        context.set("triggerValue", event.value)
      },
    },
  },
})
