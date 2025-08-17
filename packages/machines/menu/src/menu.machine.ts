import { createGuards, createMachine, type Scope, type Service } from "@zag-js/core"
import { trackDismissableElement } from "@zag-js/dismissable"
import {
  addDomEvent,
  clickIfLink,
  contains,
  getByTypeahead,
  getEventTarget,
  getInitialFocus,
  isEditableElement,
  observeAttributes,
  raf,
  scrollIntoView,
} from "@zag-js/dom-query"
import { getPlacement, getPlacementSide, type Placement } from "@zag-js/popper"
import { getElementPolygon, isPointInPolygon, type Point } from "@zag-js/rect-utils"
import { isEqual } from "@zag-js/utils"
import * as dom from "./menu.dom"
import type { MenuSchema, MenuService } from "./menu.types"

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

  context({ bindable, prop }) {
    return {
      suspendPointer: bindable<boolean>(() => ({
        defaultValue: false,
      })),
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
    }
  },

  refs() {
    return {
      parent: null,
      children: {},
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
      action(["reposition"])
    })
    track([() => prop("open")], () => {
      action(["toggleVisibility"])
    })
  },

  on: {
    "PARENT.SET": {
      actions: ["setParentMenu"],
    },
    "CHILD.SET": {
      actions: ["setChildMenu"],
    },
    OPEN: [
      {
        guard: "isOpenControlled",
        actions: ["invokeOnOpen"],
      },
      {
        target: "open",
        actions: ["invokeOnOpen"],
      },
    ],
    OPEN_AUTOFOCUS: [
      {
        guard: "isOpenControlled",
        actions: ["invokeOnOpen"],
      },
      {
        // internal: true,
        target: "open",
        actions: ["highlightFirstItem", "invokeOnOpen"],
      },
    ],
    CLOSE: [
      {
        guard: "isOpenControlled",
        actions: ["invokeOnClose"],
      },
      {
        target: "closed",
        actions: ["invokeOnClose"],
      },
    ],
    "HIGHLIGHTED.RESTORE": {
      actions: ["restoreHighlightedItem"],
    },
    "HIGHLIGHTED.SET": {
      actions: ["setHighlightedItem"],
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
          actions: ["setAnchorPoint"],
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
            actions: ["invokeOnOpen"],
          },
          {
            target: "open",
            actions: ["invokeOnOpen"],
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
        "CONTROLLED.CLOSE": { target: "closed" },
        CONTEXT_MENU_CANCEL: [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnClose"],
          },
          {
            target: "closed",
            actions: ["invokeOnClose"],
          },
        ],
        "LONG_PRESS.OPEN": [
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

    opening: {
      tags: ["closed"],
      effects: ["waitForOpenDelay"],
      on: {
        "CONTROLLED.OPEN": {
          target: "open",
        },
        "CONTROLLED.CLOSE": {
          target: "closed",
        },
        BLUR: [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnClose"],
          },
          {
            target: "closed",
            actions: ["invokeOnClose"],
          },
        ],
        TRIGGER_POINTERLEAVE: [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnClose"],
          },
          {
            target: "closed",
            actions: ["invokeOnClose"],
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
            actions: ["invokeOnClose"],
          },
          {
            target: "closed",
            actions: ["focusParentMenu", "restoreParentHighlightedItem"],
          },
        ],
        "DELAY.CLOSE": [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnClose"],
          },
          {
            target: "closed",
            actions: ["focusParentMenu", "restoreParentHighlightedItem", "invokeOnClose"],
          },
        ],
      },
    },

    closed: {
      tags: ["closed"],
      entry: ["clearHighlightedItem", "focusTrigger", "resumePointer", "clearAnchorPoint"],
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
          actions: ["setAnchorPoint"],
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
            actions: ["invokeOnOpen"],
          },
          {
            target: "open",
            actions: ["invokeOnOpen"],
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
            actions: ["invokeOnOpen"],
          },
          {
            target: "open",
            actions: ["highlightFirstItem", "invokeOnOpen"],
          },
        ],
        ARROW_UP: [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnOpen"],
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
      effects: ["trackInteractOutside", "trackPositioning", "scrollToHighlightedItem"],
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
            actions: ["invokeOnClose"],
          },
          {
            guard: not("isTriggerItem"),
            target: "closed",
            actions: ["invokeOnClose"],
          },
        ],
        CONTEXT_MENU: {
          actions: ["setAnchorPoint", "focusMenu"],
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
            actions: ["invokeOnClose"],
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
            guard: not("isPointerSuspended"),
            actions: ["setHighlightedItem", "focusMenu"],
          },
          {
            actions: ["setLastHighlightedItem"],
          },
        ],
        ITEM_POINTERLEAVE: {
          guard: and(not("isPointerSuspended"), not("isTriggerItem")),
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
          { actions: ["setHighlightedItem"] },
        ],
        TRIGGER_POINTERMOVE: {
          guard: "isTriggerItem",
          actions: ["setIntentPolygon"],
        },
        TRIGGER_POINTERLEAVE: {
          target: "closing",
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
        return !!target?.hasAttribute("aria-controls")
      },
      isSubmenu: ({ context }) => context.get("isSubmenu"),
      isPointerSuspended: ({ context }) => context.get("suspendPointer"),
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
        }, 100)
        return () => clearTimeout(timer)
      },
      waitForCloseDelay({ send }) {
        const timer = setTimeout(() => {
          send({ type: "DELAY.CLOSE" })
        }, 300)
        return () => clearTimeout(timer)
      },
      waitForLongPress({ send }) {
        const timer = setTimeout(() => {
          send({ type: "LONG_PRESS.OPEN" })
        }, 700)
        return () => clearTimeout(timer)
      },
      trackPositioning({ context, prop, scope, refs }) {
        if (!!dom.getContextTriggerEl(scope)) return
        const positioning = {
          ...prop("positioning"),
          ...refs.get("positioningOverride"),
        }
        context.set("currentPlacement", positioning.placement!)
        const getPositionerEl = () => dom.getPositionerEl(scope)
        return getPlacement(dom.getTriggerEl(scope), getPositionerEl, {
          ...positioning,
          defer: true,
          onComplete(data) {
            context.set("currentPlacement", data.placement)
          },
        })
      },
      trackInteractOutside({ refs, scope, prop, context, send }) {
        const getContentEl = () => dom.getContentEl(scope)
        let restoreFocus = true
        return trackDismissableElement(getContentEl, {
          defer: true,
          exclude: [dom.getTriggerEl(scope)],
          onInteractOutside: prop("onInteractOutside"),
          onFocusOutside(event) {
            prop("onFocusOutside")?.(event)

            const target = getEventTarget(event.detail.originalEvent)
            const isWithinContextTrigger = contains(dom.getContextTriggerEl(scope), target)
            if (isWithinContextTrigger) {
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
            const isWithinContextTrigger = contains(dom.getContextTriggerEl(scope), target)
            if (isWithinContextTrigger && event.detail.contextmenu) {
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
      trackPointerMove({ context, scope, send, refs, flush }) {
        const parent = refs.get("parent")

        // NOTE: we're mutating parent context here. sending events to parent doesn't work
        flush(() => {
          parent!.context.set("suspendPointer", true)
        })

        const doc = scope.getDoc()

        return addDomEvent(doc, "pointermove", (e) => {
          const isMovingToSubmenu = isWithinPolygon(context.get("intentPolygon"), {
            x: e.clientX,
            y: e.clientY,
          })

          if (!isMovingToSubmenu) {
            send({ type: "POINTER_MOVED_AWAY_FROM_SUBMENU" })
            parent!.context.set("suspendPointer", false)
          }
        })
      },
      scrollToHighlightedItem({ event, scope, computed }) {
        const exec = () => {
          if (event.type.startsWith("ITEM_POINTER")) return

          const itemEl = scope.getById(computed("highlightedId")!)
          const contentEl = dom.getContentEl(scope)

          scrollIntoView(itemEl, { rootEl: contentEl, block: "nearest" })
        }
        raf(() => exec())

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
        const anchorPoint = context.get("anchorPoint")
        const getAnchorRect = anchorPoint ? () => ({ width: 0, height: 0, ...anchorPoint }) : undefined

        const positioning = {
          ...prop("positioning"),
          ...refs.get("positioningOverride"),
        }

        getPlacement(dom.getTriggerEl(scope), getPositionerEl, {
          ...positioning,
          defer: true,
          getAnchorRect,
          ...(event.options ?? {}),
          listeners: false,
          onComplete(data) {
            context.set("currentPlacement", data.placement)
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
      clickHighlightedItem({ scope, computed }) {
        const itemEl = scope.getById(computed("highlightedId")!)
        if (!itemEl || itemEl.dataset.disabled) return
        queueMicrotask(() => itemEl.click())
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
      resumePointer({ refs, flush }) {
        const parent = refs.get("parent")
        if (!parent) return
        flush(() => {
          parent.context.set("suspendPointer", false)
        })
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
        queueMicrotask(() => dom.getTriggerEl(scope)?.focus({ preventScroll: true }))
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
      closeRootMenu({ refs }) {
        closeRootMenu({ parent: refs.get("parent") })
      },
      openSubmenu({ refs, scope, computed }) {
        const item = scope.getById(computed("highlightedId")!)
        const id = item?.getAttribute("data-uid")
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
      restoreHighlightedItem({ context }) {
        if (!context.get("lastHighlightedValue")) return
        context.set("highlightedValue", context.get("lastHighlightedValue"))
        context.set("lastHighlightedValue", null)
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
      toggleVisibility({ prop, event, send }) {
        send({
          type: prop("open") ? "CONTROLLED.OPEN" : "CONTROLLED.CLOSE",
          previousEvent: event,
        })
      },
    },
  },
})

function closeRootMenu(ctx: { parent: Service<MenuSchema> | null }) {
  let parent = ctx.parent
  while (parent && parent.context.get("isSubmenu")) {
    parent = parent.refs.get("parent")
  }
  parent?.send({ type: "CLOSE" })
}

function isWithinPolygon(polygon: Point[] | null, point: Point) {
  if (!polygon) return false
  return isPointInPolygon(polygon, point)
}

function resolveItemId(children: Record<string, MenuService>, value: string | null, scope: Scope) {
  const hasChildren = Object.keys(children).length > 0
  if (!value) return null
  if (!hasChildren) {
    return dom.getItemId(scope, value)
  }
  for (const id in children) {
    const childMenu = children[id]
    const childTriggerId = dom.getTriggerId(childMenu.scope)
    if (childTriggerId === value) {
      return childTriggerId
    }
  }
  return dom.getItemId(scope, value)
}
