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
  id: "color-picker",
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
        "EYEDROP.CLICK": {
          actions: ["openEyeDropper"]
        },
        "AREA.POINTER_DOWN": {
          actions: ["setActiveThumb", "setColorFromPoint"]
        }
      }
    },
    focused: {
      on: {
        "AREA.POINTER_DOWN": {
          target: "dragging",
          actions: ["setActiveThumb"]
        },
        "SLIDER.POINTER_DOWN": {
          target: "dragging",
          actions: ["setActiveThumb"]
        },
        "AREA.ARROW_LEFT": {
          actions: ["decrementXChannel"]
        },
        "AREA.ARROW_RIGHT": {
          actions: ["incrementXChannel"]
        },
        "AREA.ARROW_UP": {
          actions: ["decrementYChannel"]
        },
        "AREA.ARROW_DOWN": {
          actions: ["incrementYChannel"]
        },
        "AREA.PAGE_UP": {
          actions: ["incrementXChannel"]
        },
        "AREA.PAGE_DOWN": {
          actions: ["decrementXChannel"]
        }
      }
    },
    dragging: {
      activities: ["trackPointerMove"],
      on: {
        "AREA.POINTER_MOVE": {},
        "AREA.POINTER_UP": {}
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