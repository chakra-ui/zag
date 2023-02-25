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
    },
    MUTATION: {
      actions: ["measureElements", "setScrollSnap"]
    }
  },
  on: {
    UPDATE_CONTEXT: {
      actions: "updateContext"
    }
  },
  states: {
    idle: {
      on: {
        POINTER_DOWN: "pointerdown"
      }
    },
    autoplay: {
      invoke: {
        src: "interval",
        id: "interval"
      },
      on: {
        PAUSE: "idle"
      }
    },
    pointerdown: {
      on: {
        POINTER_UP: "idle",
        POINTER_MOVE: {
          actions: ["setScrollSnap"]
        }
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