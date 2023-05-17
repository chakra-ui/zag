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
  id: "dialog",
  initial: ctx.open ? "open" : "closed",
  context: {},
  on: {
    UPDATE_CONTEXT: {
      actions: "updateContext"
    }
  },
  states: {
    open: {
      entry: ["checkRenderedElements"],
      activities: ["trackDismissableElement", "trapFocus", "preventScroll", "hideContentBelow"],
      on: {
        CLOSE: {
          target: "closed",
          actions: ["invokeOnClose", "restoreFocus"]
        },
        TOGGLE: {
          target: "closed",
          actions: ["invokeOnClose", "restoreFocus"]
        }
      }
    },
    closed: {
      on: {
        OPEN: {
          target: "open",
          actions: ["invokeOnOpen"]
        },
        TOGGLE: {
          target: "open",
          actions: ["invokeOnOpen"]
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