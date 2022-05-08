"use strict"

var _xstate = require("xstate")

const { choose } = _xstate.actions
const fetchMachine = (0, _xstate.createMachine)({
  id: "toggle-machine",
  initial: "unknown",
  states: {
    unknown: {
      on: {
        SETUP: {
          target: "unpressed",
          actions: "setupDocument",
        },
      },
    },
    pressed: {
      on: {
        CLICK: "unpressed",
      },
    },
    unpressed: {
      on: {
        CLICK: "pressed",
      },
    },
  },
})
