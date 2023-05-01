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
      actions: ["scrollToNext"]
    },
    PREV: {
      actions: ["scrollToPrev"]
    },
    GOTO: {
      actions: ["scrollTo"]
    },
    MEASURE_DOM: {
      actions: ["measureElements", "setScrollSnaps"]
    },
    PLAY: "autoplay"
  },
  on: {
    UPDATE_CONTEXT: {
      actions: "updateContext"
    }
  },
  states: {
    idle: {
      on: {
        POINTER_DOWN: "dragging"
      }
    },
    autoplay: {
      activities: ["trackDocumentVisibility"],
      invoke: {
        src: "interval",
        id: "interval"
      },
      on: {
        PAUSE: "idle"
      }
    },
    dragging: {
      on: {
        POINTER_UP: "idle",
        POINTER_MOVE: {
          actions: ["setScrollSnaps"]
        }
      }
    }
  },
  activities: ["trackContainerResize", "trackSlideMutation"],
  entry: ["measureElements", "setScrollSnaps"]
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