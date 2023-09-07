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
  id: "radio",
  initial: "idle",
  context: {
    "!isTrusted": false
  },
  entry: ["syncIndicatorRect"],
  exit: ["cleanupObserver"],
  activities: ["trackFormControlState"],
  on: {
    SET_VALUE: [{
      cond: "!isTrusted",
      actions: ["setValue", "dispatchChangeEvent"]
    }, {
      actions: ["setValue"]
    }],
    SET_HOVERED: {
      actions: "setHovered"
    },
    SET_ACTIVE: {
      actions: "setActive"
    },
    SET_FOCUSED: {
      actions: "setFocused"
    }
  },
  on: {
    UPDATE_CONTEXT: {
      actions: "updateContext"
    }
  },
  states: {
    idle: {}
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