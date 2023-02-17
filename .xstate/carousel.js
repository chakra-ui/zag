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
          actions: ["setNextIndex", "setScrollSnap"]
        },
        PREV: {
          actions: ["setPreviousIndex", "setScrollSnap"]
        },
        SCROLL_TO: {
          actions: ["setIndex", "setScrollSnap"]
        }
      }
    }
  },
  activities: ["trackElements"],
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