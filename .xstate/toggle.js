"use strict";

var _xstate = require("xstate");

const {
  actions, createMachine
} = _xstate;
  
const { choose } = actions;
const fetchMachine = createMachine({
  id: "toggle",
  initial: "unknown",
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
})