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
  id: "carousel",
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
        NEXT: {
          actions: ["measureElements", "setNextIndex", "setScrollSnap"]
        },
        PREV: {
          actions: ["measureElements", "setPreviousIndex", "setScrollSnap"]
        }
      }
    }
  },
  entry: ["measureElements"]
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