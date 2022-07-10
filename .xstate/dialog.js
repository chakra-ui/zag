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
  initial: "unknown",
  context: {
    "isDefaultOpen": false
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
          cond: "isDefaultOpen"
        }, {
          target: "closed"
        }]
      }
    },
    open: {
      entry: ["checkRenderedElements"],
      activities: ["trackDismissableElement", "trapFocus", "preventScroll", "hideContentBelow"],
      on: {
        CLOSE: "closed",
        TOGGLE: "closed"
      }
    },
    closed: {
      entry: ["invokeOnClose"],
      on: {
        OPEN: "open",
        TOGGLE: "open"
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
    "isDefaultOpen": ctx => ctx["isDefaultOpen"]
  }
});