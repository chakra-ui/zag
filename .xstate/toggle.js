"use strict";

var _xstate = require("xstate");

const {
  actions, createMachine
} = _xstate;
  
const { choose } = actions;
const fetchMachine = createMachine({
  id: "toggle-machine",
  initial: "unknown",
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
        CLICK: "unpressed"
      }
    },
    unpressed: {
      on: {
        CLICK: "pressed"
      }
    }
  }
})