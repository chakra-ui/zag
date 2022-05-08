"use strict";

var _xstate = require("xstate");

const {
  actions, createMachine
} = _xstate;
  
const { choose } = actions;
const fetchMachine = createMachine({
  id: "popover",
  initial: "unknown",
  states: {
    unknown: {
      on: {
        SETUP: {
          target: "closed",
          actions: ["setupDocument", "checkRenderedElements"]
        }
      }
    },
    closed: {
      entry: ["clearPointerDown", "invokeOnClose"],
      on: {
        TRIGGER_CLICK: "open",
        OPEN: "open"
      }
    },
    open: {
      activities: ["trackPointerDown", "trapFocus", "preventScroll", "hideContentBelow", "disableOutsidePointerEvents", "computePlacement"],
      entry: choose([{
        cond: "autoFocus",
        actions: ["setInitialFocus", "invokeOnOpen"]
      }, {
        actions: ["focusContent", "invokeOnOpen"]
      }]),
      on: {
        CLOSE: {
          target: "closed",
          actions: "focusTrigger"
        },
        TRIGGER_CLICK: {
          target: "closed",
          actions: "focusTrigger"
        },
        ESCAPE: {
          cond: "closeOnEsc",
          target: "closed",
          actions: "focusTrigger"
        },
        TAB: {
          cond: "isLastTabbableElement && closeOnBlur && portalled",
          target: "closed",
          actions: "focusNextTabbableElementAfterTrigger"
        },
        SHIFT_TAB: {
          cond: "isFirstTabbableElement || isContentFocused && closeOnBlur && portalled",
          target: "closed",
          actions: "focusTrigger"
        },
        INTERACT_OUTSIDE: [{
          cond: "closeOnBlur && isRelatedTargetFocusable",
          target: "closed"
        }, {
          cond: "closeOnBlur",
          target: "closed",
          actions: "focusTrigger"
        }]
      }
    }
  }
})