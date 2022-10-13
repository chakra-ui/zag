"use strict";

var _xstate = require("xstate");
const {
  actions,
  createMachine,
  assign
} = _xstate;
const {
  choose
} = actions;
const fetchMachine = createMachine({
  id: "popover",
  initial: "unknown",
  context: {
    "isDefaultOpen": false,
    "!isRelatedTargetWithinContent": false,
    "isTriggerFocused && portalled": false,
    "isLastTabbableElement && closeOnInteractOutside && portalled": false,
    "(isFirstTabbableElement || isContentFocused) && portalled": false
  },
  on: {
    UPDATE_CONTEXT: {
      actions: "updateContext"
    }
  },
  states: {
    unknown: {
      on: {
        SETUP: [{
          target: "open",
          cond: "isDefaultOpen",
          actions: "checkRenderedElements"
        }, {
          target: "closed",
          actions: "checkRenderedElements"
        }]
      }
    },
    closed: {
      entry: "invokeOnClose",
      on: {
        TOGGLE: "open",
        OPEN: "open"
      }
    },
    open: {
      activities: ["trapFocus", "preventScroll", "hideContentBelow", "computePlacement", "trackInteractionOutside", "trackTabKeyDown"],
      entry: ["setInitialFocus", "invokeOnOpen"],
      on: {
        CLOSE: "closed",
        REQUEST_CLOSE: {
          target: "closed",
          actions: "focusTriggerIfNeeded"
        },
        TOGGLE: "closed",
        TRIGGER_BLUR: {
          cond: "!isRelatedTargetWithinContent",
          target: "closed"
        },
        TAB: [{
          cond: "isTriggerFocused && portalled",
          actions: "focusFirstTabbableElement"
        }, {
          cond: "isLastTabbableElement && closeOnInteractOutside && portalled",
          target: "closed",
          actions: "focusNextTabbableElementAfterTrigger"
        }],
        SHIFT_TAB: {
          cond: "(isFirstTabbableElement || isContentFocused) && portalled",
          actions: "focusTriggerIfNeeded"
        }
      }
    }
  }
}, {
  actions: {
    updateContext: assign((context, event) => {
      return {
        [event.contextKey]: true
      };
    })
  },
  guards: {
    "isDefaultOpen": ctx => ctx["isDefaultOpen"],
    "!isRelatedTargetWithinContent": ctx => ctx["!isRelatedTargetWithinContent"],
    "isTriggerFocused && portalled": ctx => ctx["isTriggerFocused && portalled"],
    "isLastTabbableElement && closeOnInteractOutside && portalled": ctx => ctx["isLastTabbableElement && closeOnInteractOutside && portalled"],
    "(isFirstTabbableElement || isContentFocused) && portalled": ctx => ctx["(isFirstTabbableElement || isContentFocused) && portalled"]
  }
});