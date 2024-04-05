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
  id: "signature-pad",
  initial: "idle",
  context: {},
  on: {
    CLEAR: {
      actions: ["clearPoints", "invokeOnDrawEnd", "focusCanvasEl"]
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
        POINTER_DOWN: {
          target: "drawing",
          actions: ["addPoint"]
        }
      }
    },
    drawing: {
      activities: ["trackPointerMove"],
      on: {
        POINTER_MOVE: {
          actions: ["addPoint", "invokeOnDraw"]
        },
        POINTER_UP: {
          target: "idle",
          actions: ["endStroke", "invokeOnDrawEnd"]
        }
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
  guards: {}
});