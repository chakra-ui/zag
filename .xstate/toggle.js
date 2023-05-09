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
  id: "toggle",
  initial: "ready",
  context: {},
  on: {
    "PRESSED.SET": {
      actions: ["setPressed"]
    },
    "PRESSED.TOGGLE": {
      actions: ["togglePressed"]
    }
  },
  on: {
    UPDATE_CONTEXT: {
      actions: "updateContext"
    }
  },
  states: {
    ready: {}
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