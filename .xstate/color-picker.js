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
          actions: ["openEyeDropperper"]
        },
        "AREA.POINTER_DOWN": {
          target: "dragging",
          actions: ["setActiveThumb", "setActiveChannel", "setColorFromPoint"]
        },
        "SLIDER.POINTER_DOWN": {
          target: "dragging",
          actions: ["setActiveThumb", "setColorFromPoint"]
        }
      }
    },
    focused: {
      on: {
        "AREA.POINTER_DOWN": {
          target: "dragging",
          actions: ["setActiveThumb", "setActiveChannel", "setColorFromPoint"]
        },
        "SLIDER.POINTER_DOWN": {
          target: "dragging",
          actions: ["setActiveThumb", "setColorFromPoint"]
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
      exit: ["clearActiveThumb", "clearActiveChannel"],
      activities: ["trackPointerMove"],
      on: {
        "AREA.POINTER_MOVE": {
          actions: ["setColorFromPoint"]
        },
        "AREA.POINTER_UP": {
          target: "focused",
          actions: ["focusAreaThumb"]
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