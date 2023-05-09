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
  id: "switch",
  initial: "ready",
  context: {},
  activities: ["trackFormControlState"],
  on: {
    "CHECKED.TOGGLE": {
      actions: ["toggleChecked"]
    },
    "CHECKED.SET": {
      actions: ["dispatchChangeEvent"]
    },
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