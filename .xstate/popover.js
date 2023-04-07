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
  initial: ctx.open ? "open" : "closed",
  context: {},
  entry: ["checkRenderedElements"],
  on: {
    UPDATE_CONTEXT: {
      actions: "updateContext"
    }
  },
  states: {
    closed: {
      entry: "invokeOnClose",
      on: {
        TOGGLE: "open",
        OPEN: "open"
      }
    },
    open: {
      activities: ["trapFocus", "preventScroll", "hideContentBelow", "trackPositioning", "trackDismissableElement", "proxyTabFocus"],
      entry: ["setInitialFocus", "invokeOnOpen"],
      on: {
        CLOSE: "closed",
        REQUEST_CLOSE: {
          target: "closed",
          actions: "focusTriggerIfNeeded"
        },
        TOGGLE: "closed",
        SET_POSITIONING: {
          actions: "setPositioning"
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
  guards: {}
});