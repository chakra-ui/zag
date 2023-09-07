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
  id: "checkbox",
  initial: "ready",
  context: {
    "!isTrusted": false,
    "!isTrusted": false
  },
  activities: ["trackFormControlState"],
  on: {
    "CHECKED.TOGGLE": [{
      cond: "!isTrusted",
      actions: ["toggleChecked", "dispatchChangeEvent"]
    }, {
      actions: ["toggleChecked"]
    }],
    "CHECKED.SET": [{
      cond: "!isTrusted",
      actions: ["setChecked", "dispatchChangeEvent"]
    }, {
      actions: ["setChecked"]
    }],
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
  guards: {
    "!isTrusted": ctx => ctx["!isTrusted"]
  }
});