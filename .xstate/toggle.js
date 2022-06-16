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
  initial: "unknown",
  context: {
    "isPressed": false
  },
  on: {
    SET_STATE: [{
      cond: "isPressed",
      target: "pressed",
      actions: ["invokeOnChange"]
    }, {
      target: "unpressed",
      actions: ["invokeOnChange"]
    }]
  },
  on: {
    UPDATE_CONTEXT: {
      actions: "updateContext"
    }
  },
  states: {
    unknown: {
      on: {
        SETUP: {
          target: "unpressed",
          actions: "setupDocument"
        }
      }
    },
    pressed: {
      on: {
        TOGGLE: "unpressed"
      }
    },
    unpressed: {
      on: {
        TOGGLE: "pressed"
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
    "isPressed": ctx => ctx["isPressed"]
  }
});