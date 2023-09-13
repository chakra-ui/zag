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
  id: "disclosure",
  initial: "idle",
  context: {},
  on: {
    UPDATE_CONTEXT: {
      actions: "updateContext"
    }
  },
  states: {
    idle: {
      on: {
        "BUTTON.FOCUS": {
          target: "focused",
          actions: "setFocused"
        }
      }
    },
    focused: {
      on: {
        "BUTTON.BLUR": {
          target: "idle",
          actions: "clearFocus"
        }
      }
    }
  },
  on: {
    "OPEN.TOGGLE": {
      actions: ["toggleOpen"]
    },
    "OPEN.SET": {
      actions: ["setOpen"]
    },
    "CONTEXT.SET": {
      actions: ["setContext"]
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