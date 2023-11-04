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
  id: "collapsible",
  initial: ctx.open ? "open" : "closed",
  context: {},
  on: {
    "CONTEXT.SET": {
      actions: ["setContext"]
    }
  },
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
      on: {
        TOGGLE: {
          target: "closed",
          actions: ["invokeOnClose"]
        },
        CLOSE: {
          target: "closed",
          actions: ["invokeOnClose"]
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