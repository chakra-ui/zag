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
      on: {
        TOGGLE: {
          target: "open",
          actions: ["invokeOnOpen"]
        },
        OPEN: {
          target: "open",
          actions: ["invokeOnOpen"]
        }
      }
    },
    open: {
      activities: ["trapFocus", "preventScroll", "hideContentBelow", "trackPositioning", "trackDismissableElement", "proxyTabFocus"],
      entry: ["setInitialFocus"],
      on: {
        CLOSE: {
          target: "closed",
          actions: ["invokeOnClose"]
        },
        REQUEST_CLOSE: {
          target: "closed",
          actions: ["restoreFocusIfNeeded", "invokeOnClose"]
        },
        TOGGLE: {
          target: "closed",
          actions: ["invokeOnClose"]
        },
        SET_POSITIONING: {
          actions: "reposition"
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