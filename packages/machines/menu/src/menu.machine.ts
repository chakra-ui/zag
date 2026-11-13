import { createGuards, createMachine, type Params, type Transition } from "@zag-js/core"
import { getDismissReason, trackDismissableElement, type LayerSnapshot } from "@zag-js/dismissable"
import {
  addDomEvent,
  AnimationFrame,
  clickIfLink,
  contains,
  getAdjacentTabbable,
  getByTypeahead,
  getEventTarget,
  getInitialFocus,
  getModifierKeys,
  getPopupActivationDirection,
  getWindow,
  isAnchorElement,
  isDownloadingEvent,
  isEditableElement,
  isOpeningInNewTab,
  isWebKit,
  observeAttributes,
  raf,
  resizeObserverBorderBox,
  scrollIntoView,
  waitForAnimationEnd,
} from "@zag-js/dom-query"
import { getInteractionModality, setInteractionModality, trackFocusVisible } from "@zag-js/focus-visible"
import { getPlacement, getPlacementSide, type Placement } from "@zag-js/popper"
import { getElementPolygon, isPointInPolygon, type Point } from "@zag-js/rect-utils"
import { isEqual } from "@zag-js/utils"
import { parts } from "./menu.anatomy"
import * as dom from "./menu.dom"
import { getViewportSizeStyle } from "./menu.style"
import type { MenuSchema, OpenChangeReason, ViewportSize } from "./menu.types"
import type { PopupActivationDirection } from "@zag-js/types"
import {
  closeRootMenu,
  getAdjacentValue,
  getEdgeValue,
  hasItemValue,
  isWithinPolygon,
  resolveItemId,
  setParentRoutingLock,
  unlockParentAfterChildClose,
  unlockParentOnSubmenuClose,
} from "./menu.utils"

const { not, and, or } = createGuards<MenuSchema>()

const keyboardEvents = new Set([
  "ARROW_UP",
  "ARROW_DOWN",
  "ARROW_LEFT",
  "ARROW_RIGHT",
  "HOME",
  "END",
  "TYPEAHEAD",
  "ENTER",
  "INPUT.NAVIGATE",
])
const pointerEvents = new Set(["ITEM_POINTERMOVE", "ITEM_POINTERLEAVE", "ITEM_POINTERDOWN", "ITEM_CLICK"])

function getOpenChangeReason(event: MenuSchema["event"]) {
  return event.src as OpenChangeReason | undefined
}

function getHighlightReason(event: { type: string; previousEvent?: any } | undefined) {
  const type = event?.type === "CONTROLLED.OPEN" ? event.previousEvent?.type : event?.type
  if (keyboardEvents.has(type)) return "keyboard"
  if (pointerEvents.has(type)) return "pointer"
  return "programmatic"
}

type FocusSource = "hover" | "touch" | "pointer" | "other"

// How the menu came to be focused: opened by hovering a submenu trigger, opened by a touch or pen
// press, or moved over by the pointer.
function getFocusSource(event: { type: string; pointerType?: string; previousEvent?: any }): FocusSource {
  const evt = event.type === "CONTROLLED.OPEN" && event.previousEvent ? event.previousEvent : event
  if (evt.type === "DELAY.OPEN") return "hover"
  if (evt.pointerType === "touch" || evt.pointerType === "pen") return "touch"
  if (evt.type === "ITEM_POINTERMOVE") return "pointer"
  return "other"
}

// `OPEN`/`CLOSE` come from `api.setOpen`. They are declared per state rather than at the root so each
// state says whether it has anything to open or close, the same way `CONTROLLED.OPEN`/`CONTROLLED.CLOSE` are.
const openTransitions: Transition<MenuSchema>[] = [
  {
    guard: "isOpenControlled",
    actions: ["setTriggerValue", "invokeOnOpen"],
  },
  {
    target: "open",
    actions: ["setTriggerValue", "invokeOnOpen"],
  },
]

const closeTransitions: Transition<MenuSchema>[] = [
  {
    guard: "isOpenControlled",
    actions: ["invokeOnClose", "releaseParentRoutingLock"],
  },
  {
    target: "closed",
    actions: ["invokeOnClose", "releaseParentRoutingLock", "focusTrigger"],
  },
]

// The parent's `open` is still false before it confirms an open, so cancelling needs no confirmation
const cancelOpenTransition: Transition<MenuSchema> = {
  target: "closed",
  actions: ["invokeOnClose", "releaseParentRoutingLock", "focusTrigger"],
}

export const machine = createMachine<MenuSchema>({
  props({ props }) {
    return {
      closeOnSelect: true,
      typeahead: true,
      popupType: "menu",
      loopFocus: false,
      navigate(details) {
        clickIfLink(details.node, details.modifiers)
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

  context({ bindable, prop, scope, getEvent }) {
    return {
      layer: bindable<LayerSnapshot | null>(() => ({
        defaultValue: null,
      })),
      highlightedValue: bindable<string | null>(() => ({
        defaultValue: prop("defaultHighlightedValue") || null,
        value: prop("highlightedValue"),
        onChange(value) {
          prop("onHighlightChange")?.({ highlightedValue: value, reason: getHighlightReason(getEvent()) })
        },
      })),
      lastHighlightedValue: bindable<string | null>(() => ({
        defaultValue: null,
      })),
      isWebKit: bindable<boolean>(() => ({
        defaultValue: false,
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
      instant: bindable<boolean>(() => ({
        defaultValue: false,
      })),
      activationDirection: bindable<PopupActivationDirection | null>(() => ({ defaultValue: null })),
      previousTriggerValue: bindable<string | null>(() => ({ defaultValue: null })),
      transitioning: bindable<boolean>(() => ({ defaultValue: false })),
      viewportRendered: bindable<boolean>(() => ({ defaultValue: false })),
      viewportSize: bindable<ViewportSize | null>(() => ({ defaultValue: null })),
    }
  },

  refs() {
    return {
      parent: null,
      children: {},
      pointerRoutingLocked: false,
      typeaheadState: { ...getByTypeahead.defaultOptions },
      positioningOverride: {},
      menubarCloseReason: null,
      pointerType: null,
      focusMenuFrame: AnimationFrame.create(),
      autoHighlightFrame: AnimationFrame.create(),
      syncHighlightFrame: AnimationFrame.create(),
      cancelTriggerSwitch: null,
      awaitingViewportSize: false,
    }
  },

  computed: {
    isRtl: ({ prop }) => prop("dir") === "rtl",
    isTypingAhead: ({ refs }) => refs.get("typeaheadState").keysSoFar !== "",
    highlightedId: ({ context, scope, refs }) =>
      resolveItemId(refs.get("children"), context.get("highlightedValue"), scope),
    isInMenubar: ({ prop }) => prop("menubar") != null,
    menubarDisabled: ({ prop }) => prop("menubar")?.disabled ?? false,
  },

  entry: ["setIsWebKit"],
  exit: ["cancelFocusMenu", "cancelHighlightFrames", "focusParentIfOrphaned", "endTriggerSwitch"],
  effects: ["trackMenubarOpenRequest"],

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
        OPEN: openTransitions,
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
        OPEN: openTransitions,
        CLOSE: cancelOpenTransition,
        "CONTROLLED.OPEN": { target: "open", actions: ["reposition"] },
        "CONTROLLED.CLOSE": { target: "closed", actions: ["focusTrigger"] },
        CONTEXT_MENU_CANCEL: cancelOpenTransition,
        "LONG_PRESS.OPEN": [
          {
            guard: "isOpenControlled",
            target: "opening:requested",
            actions: ["setTriggerValue", "invokeOnOpen"],
          },
          {
            target: "open",
            actions: ["setTriggerValue", "invokeOnOpen", "reposition"],
          },
        ],
      },
    },

    opening: {
      tags: ["closed"],
      effects: ["waitForOpenDelay"],
      on: {
        OPEN: openTransitions,
        CLOSE: cancelOpenTransition,
        "CONTROLLED.OPEN": {
          target: "open",
        },
        "CONTROLLED.CLOSE": {
          target: "closed",
          actions: ["focusTrigger"],
        },
        BLUR: cancelOpenTransition,
        TRIGGER_POINTERLEAVE: cancelOpenTransition,
        "DELAY.OPEN": [
          {
            guard: "isOpenControlled",
            target: "opening:requested",
            actions: ["invokeOnOpen"],
          },
          {
            target: "open",
            actions: ["invokeOnOpen"],
          },
        ],
      },
    },

    // Controlled open was requested; ignore pointer events until the parent confirms
    "opening:requested": {
      tags: ["closed"],
      on: {
        CLOSE: cancelOpenTransition,
        "CONTROLLED.OPEN": { target: "open", actions: ["reposition"] },
        "CONTROLLED.CLOSE": { target: "closed", actions: ["focusTrigger"] },
      },
    },

    closing: {
      tags: ["open"],
      effects: ["trackPointerMove", "trackInteractOutside", "waitForCloseDelay"],
      on: {
        OPEN: openTransitions,
        CLOSE: closeTransitions,
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
            actions: ["focusParentMenu", "restoreParentHighlightedItem", "invokeOnClose", "releaseParentRoutingLock"],
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
      entry: [
        "setInstant",
        "clearHighlightedItem",
        "unlockParentOnClose",
        "clearAnchorPoint",
        "dispatchMenubarClose",
        "endTriggerSwitch",
        "clearActivationDirection",
      ],
      on: {
        OPEN: openTransitions,
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
      effects: [
        "trackInteractOutside",
        "trackFocusVisible",
        "trackPositioning",
        "trackViewportSize",
        "scrollToHighlightedItem",
        "trackMenubarSiblings",
        "trackItemsChange",
      ],
      entry: [
        "setInstant",
        "focusMenu",
        "unlockParentOnOpen",
        "dispatchMenubarOpen",
        "highlightFirstIfAlways",
        "warnIfFilterInputNotDialog",
      ],
      exit: ["cancelFocusMenu", "cancelHighlightFrames"],
      on: {
        CLOSE: closeTransitions,
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
          guard: and(not("isPointerRoutingLocked"), not("isTriggerItem"), not("isAutoHighlightAlways")),
          actions: ["clearHighlightedItem"],
        },
        "INPUT.NAVIGATE": {
          actions: ["navigateFromInput"],
        },
        "INPUT.CHANGE": {
          actions: ["syncInputHighlight"],
        },
        "ITEMS.CHANGE": {
          actions: ["syncInputHighlight"],
        },
        TAB: {
          actions: ["closeTreeAndTab"],
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
        "TRIGGER_VALUE.SET": {
          guard: "isNewTriggerValue",
          actions: [
            "setActivationDirection",
            "setPreviousTriggerValue",
            "setTriggerValue",
            "clearHighlightForNewContent",
            "startTriggerSwitch",
            "setAnchorPoint",
            "reposition",
            "focusMenu",
          ],
        },
        "TRIGGER_SWITCH.END": {
          actions: ["endTriggerSwitch"],
        },
      },
    },
  },

  implementations: {
    guards: {
      isNewTriggerValue: ({ context, event }) => event.value != null && event.value !== context.get("triggerValue"),
      closeOnSelect: ({ prop, event }) => !!(event?.closeOnSelect ?? prop("closeOnSelect")),
      // whether the trigger is also a menu item. menubar triggers look the same in the DOM,
      // but must toggle closed on click
      isTriggerItem: ({ event, computed }) => !computed("isInMenubar") && dom.isTriggerItem(event.target),
      // whether the trigger item is the active item
      isTriggerItemHighlighted: ({ event, scope, computed }) => {
        const target = (event.target ?? scope.getById(computed("highlightedId")!)) as HTMLElement | null
        return !!target?.hasAttribute("data-controls")
      },
      isSubmenu: ({ context }) => context.get("isSubmenu"),
      isAutoHighlightAlways: ({ prop }) => prop("autoHighlight") === "always",
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
      // Open this menu when the menubar requests it (keyboard switch to a sibling menu).
      trackMenubarOpenRequest({ scope, prop, send }) {
        const menubarEl = dom.getMenubarEl(scope, prop("menubar")?.rootId)
        if (!menubarEl) return
        const triggerId = dom.getTriggerId(scope)
        return addDomEvent(menubarEl, "menubar:open-request", (event: any) => {
          if (event.detail?.triggerId === triggerId) send({ type: "OPEN", instant: true, src: "arrow-key" })
        })
      },
      // When coordinated by a menubar, close this menu if a sibling menu opens.
      // The consumer re-renders the filtered items, sometimes without a keystroke (async results, a clear button),
      // so the highlight is re-synced whenever the items change
      trackItemsChange({ scope, send, context }) {
        let observer: MutationObserver | undefined
        const frame = raf(() => {
          const contentEl = dom.getContentEl(scope, context.get("triggerValue"))
          if (!contentEl || !dom.getInputEl(scope)) return
          observer = new (scope.getWin().MutationObserver)(() => send({ type: "ITEMS.CHANGE" }))
          observer.observe(contentEl, { childList: true, subtree: true })
        })
        return () => {
          frame()
          observer?.disconnect()
        }
      },
      trackMenubarSiblings({ scope, prop, send, refs }) {
        const menubarEl = dom.getMenubarEl(scope, prop("menubar")?.rootId)
        if (!menubarEl) return
        return addDomEvent(menubarEl, "menu:open", (event: any) => {
          if (event.detail?.menuId === scope.id) return
          refs.set("menubarCloseReason", "sibling-open")
          // Don't restore focus to this trigger — the sibling menu takes focus. Restoring
          // here would refocus this trigger and reset the menubar's active value.
          send({
            type: "CLOSE",
            src: "sibling-open",
            restoreFocus: false,
            instant: true,
          })
        })
      },
      waitForOpenDelay({ send }) {
        const timer = setTimeout(() => {
          send({ type: "DELAY.OPEN", src: "trigger-hover" })
        }, 200)
        return () => clearTimeout(timer)
      },
      waitForCloseDelay({ send }) {
        const timer = setTimeout(() => {
          send({ type: "DELAY.CLOSE", src: "pointer-leave" })
        }, 100)
        return () => clearTimeout(timer)
      },
      waitForLongPress({ send }) {
        const timer = setTimeout(() => {
          send({ type: "LONG_PRESS.OPEN", src: "context-menu" })
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
          getArrowElement: () => dom.getArrowEl(scope),
          ...positioning,
          updatePosition(data) {
            if (refs.get("awaitingViewportSize")) return
            return positioning.updatePosition ? positioning.updatePosition(data) : data.updatePosition()
          },
          defer: true,
          onComplete(data) {
            context.set("currentPlacement", data.placement)
          },
        })
      },
      trackViewportSize(params) {
        const { context, scope, watchEffect } = params
        return watchEffect([() => context.get("triggerValue")], () => {
          const frame = AnimationFrame.create()
          const stopObserving = raf(() => {
            const contentEl = dom.getContentEl(scope, context.get("triggerValue"))
            const viewportRendered = !!dom.getViewportEl(scope)
            context.set("viewportRendered", viewportRendered)
            if (!viewportRendered || !contentEl) return

            return resizeObserverBorderBox.observe(contentEl, (entry) => {
              const [{ inlineSize, blockSize }] = entry.borderBoxSize
              frame.request(() => setViewportSize(params, { width: inlineSize, height: blockSize }))
            })
          })
          return () => {
            stopObserving()
            frame.cancel()
          }
        })
      },
      trackInteractOutside({ refs, scope, prop, context, send }) {
        const getLayerEl = () => dom.getLayerEl(scope, context.get("triggerValue"))
        let restoreFocus = true

        // Helper to check if target is within any context trigger
        const isWithinAnyContextTrigger = (target: EventTarget | null) => {
          return dom.getContextTriggerEls(scope).some((el) => contains(el, target as Element | null))
        }

        return trackDismissableElement(getLayerEl, {
          type: "menu",
          // menubar menus open while a sibling is still registered, so group them to avoid nesting
          group: prop("menubar")?.rootId,
          onLayerChange(layer) {
            context.set("layer", layer)
          },
          defer: true,
          getRootNode: scope.getRootNode,
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
            if (context.get("isSubmenu")) {
              event.preventDefault()
              // Escape from a submenu's filter input steps back to the parent, which keeps its own query
              if (isEditableElement(getEventTarget(event))) {
                send({ type: "ARROW_LEFT", src: "escape-key" })
                return
              }
            }
            closeRootMenu({ parent: refs.get("parent"), src: "escape-key" })
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
          onDismiss(event) {
            send({ type: "CLOSE", src: getDismissReason(event), restoreFocus })
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
            send({ type: "POINTER_MOVED_AWAY_FROM_SUBMENU", src: "pointer-leave" })
            setParentRoutingLock(parent, false)
          }
        })
      },
      scrollToHighlightedItem({ scope, computed, prop, context }) {
        const exec = () => {
          // don't scroll into view if we're using the pointer (or null when focus-trap autofocuses)
          const modality = getInteractionModality()
          if (modality === "pointer") return

          const collection = prop("collection")
          const scrollToIndexFn = prop("scrollToIndexFn")
          if (collection && scrollToIndexFn) {
            const value = context.get("highlightedValue")
            scrollToIndexFn({
              index: collection.indexOf(value),
              getElement: () => dom.getItemEl(scope, value, context.get("triggerValue")),
            })
            return
          }

          const itemEl = scope.getById(computed("highlightedId")!)
          const contentEl = dom.getContentEl(scope, context.get("triggerValue"))

          scrollIntoView(itemEl, { rootEl: contentEl, block: "nearest" })
        }
        const rafCleanup = raf(() => {
          setInteractionModality("virtual")
          exec()
        })

        const contentEl = () => dom.getContentEl(scope, context.get("triggerValue"))
        const observerCleanup = observeAttributes(contentEl, {
          defer: true,
          attributes: ["aria-activedescendant"],
          callback: exec,
        })

        return () => {
          rafCleanup()
          observerCleanup()
        }
      },
    },

    actions: {
      dispatchMenubarOpen({ scope, prop }) {
        const menubarEl = dom.getMenubarEl(scope, prop("menubar")?.rootId)
        if (!menubarEl) return
        const detail = {
          menuId: scope.id,
          triggerId: dom.getTriggerEl(scope)?.id,
        }
        dom.dispatchMenubarEvent(menubarEl, "menu:open", detail)
      },
      dispatchMenubarClose({ scope, prop, refs }) {
        const menubarEl = dom.getMenubarEl(scope, prop("menubar")?.rootId)
        if (!menubarEl) return
        const reason = refs.get("menubarCloseReason") ?? "close"
        refs.set("menubarCloseReason", null)
        dom.dispatchMenubarEvent(menubarEl, "menu:close", {
          menuId: scope.id,
          reason,
        })
      },
      setAnchorPoint({ context, event }) {
        context.set("anchorPoint", (prev) => (isEqual(prev, event.point) ? prev : event.point))
      },
      setSubmenuPlacement({ context, computed, refs }) {
        if (!context.get("isSubmenu")) return
        const placement = computed("isRtl") ? "left-start" : "right-start"
        refs.set("positioningOverride", { placement, gutter: 0 })
      },
      reposition({ context, scope, prop, event, refs }) {
        if (refs.get("awaitingViewportSize")) return
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
          getArrowElement: () => dom.getArrowEl(scope),
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
      clickHighlightedItem({ scope, computed, prop, context, event, send }) {
        const itemEl = scope.getById(computed("highlightedId")!)
        if (!itemEl || itemEl.dataset.disabled) return
        const highlightedValue = context.get("highlightedValue")

        if (isAnchorElement(itemEl)) {
          const modifiers = getModifierKeys(event.modifiers)
          prop("navigate")?.({ value: highlightedValue!, node: itemEl, href: itemEl.href, modifiers })

          // match the item's click: modifier keys leave the link to the browser
          const linkEvent = { currentTarget: itemEl, button: 0, ...modifiers }
          if (isOpeningInNewTab(linkEvent) || isDownloadingEvent(linkEvent)) return

          send({
            type: "ITEM_CLICK",
            target: itemEl,
            id: itemEl.id,
            value: highlightedValue,
            closeOnSelect: dom.getItemCloseOnSelect(itemEl),
            modifiers,
            src: "item-select",
          })
        } else {
          const win = getWindow(itemEl)
          const init = { bubbles: true, cancelable: true, composed: true, ...getModifierKeys(event.modifiers) }
          queueMicrotask(() => itemEl.dispatchEvent(new win.MouseEvent("click", init)))
        }
      },
      setIntentPolygon({ context, scope, event }) {
        const menu = dom.getContentEl(scope, context.get("triggerValue"))
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
      clearHighlightForNewContent({ context, scope, refs }) {
        if (!dom.getViewportEl(scope)) return
        context.set("highlightedValue", null)
        refs.set("typeaheadState", { ...getByTypeahead.defaultOptions })
      },
      setActivationDirection({ context, event, scope }) {
        const fromEl = dom.getActiveTriggerEl(scope, context.get("triggerValue"))
        const toEl = dom.getActiveTriggerEl(scope, event.value)
        context.set("activationDirection", getPopupActivationDirection(fromEl, toEl))
      },
      clearActivationDirection({ context }) {
        context.set("activationDirection", null)
      },
      setPreviousTriggerValue({ context }) {
        context.set("previousTriggerValue", context.get("triggerValue"))
      },
      startTriggerSwitch({ context, refs, scope, send }) {
        refs.get("cancelTriggerSwitch")?.()
        context.set("transitioning", true)
        const positionerEl = dom.getPositionerEl(scope)
        if (!positionerEl) return
        positionerEl.setAttribute("data-transitioning", "")
        refs.set("awaitingViewportSize", !!dom.getViewportEl(scope))
        const cancel = waitForAnimationEnd(positionerEl, () => send({ type: "TRIGGER_SWITCH.END" }))
        refs.set("cancelTriggerSwitch", cancel)
      },
      endTriggerSwitch({ context, refs }) {
        context.set("previousTriggerValue", null)
        refs.get("cancelTriggerSwitch")?.()
        refs.set("cancelTriggerSwitch", null)
        refs.set("awaitingViewportSize", false)
        context.set("transitioning", false)
      },
      // Read once the machine starts in the browser, so server and hydration markup leave it out
      setIsWebKit({ context }) {
        context.set("isWebKit", isWebKit())
      },
      highlightFirstIfAlways({ prop, scope, context, refs }) {
        if (prop("autoHighlight") !== "always") return
        refs.get("autoHighlightFrame").request(() => {
          if (!dom.getInputEl(scope) || context.get("highlightedValue") != null) return
          const first = getEdgeValue(scope, context.get("triggerValue"), prop("collection"), "first")
          if (first != null) context.set("highlightedValue", first)
        })
      },
      warnIfFilterInputNotDialog({ prop, scope }) {
        if (process.env.NODE_ENV === "production" || prop("popupType") === "dialog") return
        raf(() => {
          if (!dom.getInputEl(scope)) return
          console.warn("[@zag-js/menu] A menu with a filter input needs `popupType` set to `dialog`.")
        })
      },
      // A submenu removed while it held focus (its trigger was filtered out) hands focus back to its parent.
      // Some frameworks blur the focused element as they remove it, so check where focus ended up.
      focusParentIfOrphaned({ refs, scope }) {
        const parent = refs.get("parent")
        if (!parent) return
        queueMicrotask(() => {
          const activeEl = scope.getActiveElement()
          if (activeEl && activeEl !== scope.getDoc().body) return
          parent.send({ type: "FOCUS_MENU" })
        })
      },
      // Arrow keys from a filter input cycle through the input: past either end of the list the highlight
      // returns to the input, unless `autoHighlight` keeps an item highlighted
      navigateFromInput({ context, scope, event, prop }) {
        const collection = prop("collection")
        const current = context.get("highlightedValue")
        const wrap = !!prop("autoHighlight")
        let value: string | null = null
        if (event.key === "first" || event.key === "last")
          value = getEdgeValue(scope, context.get("triggerValue"), collection, event.key)
        else if (event.key === "next")
          value =
            getAdjacentValue(scope, context.get("triggerValue"), collection, current, 1) ??
            (wrap ? getEdgeValue(scope, context.get("triggerValue"), collection, "first") : null)
        else if (event.key === "prev")
          value =
            getAdjacentValue(scope, context.get("triggerValue"), collection, current, -1) ??
            (wrap ? getEdgeValue(scope, context.get("triggerValue"), collection, "last") : null)
        context.set("highlightedValue", value)
      },
      // Keeps the highlight on a rendered item once the consumer has re-rendered the filtered items
      syncInputHighlight({ context, scope, event, prop, refs }) {
        const queryChanged = event.type === "INPUT.CHANGE"
        refs.get("syncHighlightFrame").request(() => {
          const inputEl = dom.getInputEl(scope)
          if (!inputEl) return
          const collection = prop("collection")
          const autoHighlight = prop("autoHighlight")
          const hasQuery = inputEl.value.trim() !== ""
          const current = context.get("highlightedValue")
          const isRendered = hasItemValue(scope, context.get("triggerValue"), collection, current)
          if (autoHighlight === "always" || (autoHighlight && hasQuery)) {
            if (queryChanged || !isRendered)
              context.set("highlightedValue", getEdgeValue(scope, context.get("triggerValue"), collection, "first"))
            return
          }
          if (autoHighlight && queryChanged) {
            context.set("highlightedValue", null)
            return
          }
          if (current != null && !isRendered) context.set("highlightedValue", null)
        })
      },
      closeTreeAndTab({ refs, send, scope, context, event }) {
        const positioners = [dom.getPositionerEl(scope)]
        let root = refs.get("parent")
        while (root) {
          positioners.push(dom.getPositionerEl(root.scope))
          const parent = root.refs.get("parent")
          if (!parent) break
          root = parent
        }

        const rootScope = root?.scope ?? scope
        const triggerValue = (root?.context ?? context).get("triggerValue")
        const triggerEl = dom.getActiveTriggerEl(rootScope, triggerValue)
        const nextEl = getAdjacentTabbable(triggerEl, { exclude: positioners, backward: event.shiftKey })

        const closeEvent = { type: "CLOSE", src: "tab-key", restoreFocus: nextEl ? false : undefined }
        if (root) root.send(closeEvent)
        else send(closeEvent)
        nextEl?.focus({ preventScroll: true })
      },
      focusMenu({ scope, event, refs, context }) {
        const source = getFocusSource(event)
        const target = event.target
        refs.get("focusMenuFrame").request(() => {
          const contentEl = dom.getContentEl(scope, context.get("triggerValue"))
          const initialFocusEl = getInitialFocus({
            root: contentEl,
            enabled: !contains(contentEl, scope.getActiveElement()),
            filter(node) {
              return !node.role?.startsWith("menuitem")
            },
          })
          if (!initialFocusEl) return
          // A filter input is entered on purpose. Hovering a submenu open leaves focus where it is
          // until the pointer moves onto an item, and a touch open keeps the on-screen keyboard down.
          if (isEditableElement(initialFocusEl)) {
            if (source === "hover") return
            if (source === "touch") {
              contentEl?.focus({ preventScroll: true })
              return
            }
            if (source === "pointer" && dom.isFocusHeldBySubmenuOf(target, refs.get("children"))) return
          }
          initialFocusEl.focus({ preventScroll: true })
        })
      },
      cancelFocusMenu({ refs }) {
        refs.get("focusMenuFrame").cancel()
      },
      cancelHighlightFrames({ refs }) {
        refs.get("autoHighlightFrame").cancel()
        refs.get("syncHighlightFrame").cancel()
      },
      highlightFirstItem({ context, scope, prop }) {
        // use raf in event content is lazy mounted
        const fn = dom.getContentEl(scope, context.get("triggerValue")) ? queueMicrotask : raf
        fn(() => {
          const first = getEdgeValue(scope, context.get("triggerValue"), prop("collection"), "first")
          if (first == null) return
          context.set("highlightedValue", first)
        })
      },
      highlightLastItem({ context, scope, prop }) {
        // use raf in event content is lazy mounted
        const fn = dom.getContentEl(scope, context.get("triggerValue")) ? queueMicrotask : raf
        fn(() => {
          const last = getEdgeValue(scope, context.get("triggerValue"), prop("collection"), "last")
          if (last == null) return
          context.set("highlightedValue", last)
        })
      },
      highlightNextItem({ context, scope, event, prop }) {
        const collection = prop("collection")
        const current = context.get("highlightedValue")
        const loop = event.loop ?? prop("loopFocus")
        const next =
          getAdjacentValue(scope, context.get("triggerValue"), collection, current, 1) ??
          (loop ? getEdgeValue(scope, context.get("triggerValue"), collection, "first") : current)
        context.set("highlightedValue", next)
      },
      highlightPrevItem({ context, scope, event, prop }) {
        const collection = prop("collection")
        const current = context.get("highlightedValue")
        const loop = event.loop ?? prop("loopFocus")
        const prev =
          getAdjacentValue(scope, context.get("triggerValue"), collection, current, -1) ??
          (loop ? getEdgeValue(scope, context.get("triggerValue"), collection, "last") : current)
        context.set("highlightedValue", prev)
      },
      invokeOnSelect({ context, prop, scope, event }) {
        const value = event.value || dom.getItemValue(event.target) || context.get("highlightedValue")
        if (value == null) return

        const node = dom.getItemEl(scope, value, context.get("triggerValue"))
        dom.dispatchSelectionEvent(node, value)

        prop("onSelect")?.({ value, modifiers: getModifierKeys(event.modifiers) })
      },
      focusTrigger({ scope, context, event }) {
        const restoreFocus = event.restoreFocus ?? event.previousEvent?.restoreFocus
        if (context.get("isSubmenu") || context.get("anchorPoint") || restoreFocus === false) return
        queueMicrotask(() => {
          const triggerEl = dom.getActiveTriggerEl(scope, context.get("triggerValue"))
          triggerEl?.focus({ preventScroll: true })
        })
      },
      highlightMatchedItem({ scope, context, event, refs, prop }) {
        const collection = prop("collection")
        if (collection) {
          const value = collection.search(event.key, {
            state: refs.get("typeaheadState"),
            currentValue: context.get("highlightedValue"),
          })
          if (value != null) context.set("highlightedValue", value)
          return
        }
        const node = dom.getElemByKey(scope, {
          key: event.key,
          value: context.get("highlightedValue"),
          typeaheadState: refs.get("typeaheadState"),
          triggerValue: context.get("triggerValue"),
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
      closeSiblingMenus({ refs, event, scope, context }) {
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
          dom.getContentEl(scope, context.get("triggerValue"))?.focus({ preventScroll: true })
          child.send({ type: "CLOSE", src: "pointer-leave" })
        }
      },
      closeRootMenu({ refs }) {
        closeRootMenu({ parent: refs.get("parent"), src: "item-select" })
      },
      openSubmenu({ refs, scope, computed, event }) {
        const item = scope.getById(computed("highlightedId")!)
        const id = item?.getAttribute(parts.triggerItem.attr)
        const children = refs.get("children")
        const child = id ? children[id] : null
        child?.send({ type: "OPEN_AUTOFOCUS", src: event.src })
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
      invokeOnOpen({ prop, event }) {
        prop("onOpenChange")?.({ open: true, reason: getOpenChangeReason(event) })
      },
      invokeOnClose({ prop, event }) {
        prop("onOpenChange")?.({ open: false, reason: getOpenChangeReason(event) })
      },
      releaseParentRoutingLock({ refs, context }) {
        if (!context.get("isSubmenu")) return
        unlockParentOnSubmenuClose(refs.get("parent"))
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
      // runs on every open/closed entry, so any non-swap transition clears the flag
      setInstant({ context, event }) {
        context.set("instant", !!event.instant)
      },
    },
  },
})

function setViewportSize(params: Params<MenuSchema>, size: ViewportSize) {
  const { context, scope, refs, send } = params
  context.set("viewportSize", size)
  const positionerEl = dom.getPositionerEl(scope)
  for (const [key, value] of Object.entries(getViewportSizeStyle(size))) {
    positionerEl?.style.setProperty(key, value)
  }
  if (!refs.get("awaitingViewportSize")) return
  refs.set("awaitingViewportSize", false)
  send({ type: "POSITIONING.SET" })
}
