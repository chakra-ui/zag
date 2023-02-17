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
    NEXT: {
      actions: ["setNextIndex"]
    },
    PREV: {
      actions: ["setPreviousIndex"]
    },
    GOTO: {
      actions: ["setIndex"]
    }
  },
  on: {
    UPDATE_CONTEXT: {
      actions: "updateContext"
    }
  },
  states: {
    idle: {},
    autoplay: {
      invoke: {
        src: "interval",
        id: "interval"
      },
      on: {
        PAUSE: "idle"
      }
    }
  },
  activities: ["trackContainerResize", "trackSlideMutation"],
  entry: ["measureElements", "setScrollSnap"]
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