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
    "VALUE.SET": {
      actions: ["setValue"]
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
        "EYEDROPPER.CLICK": {
          actions: ["openEyeDropper"]
        },
        "AREA.POINTER_DOWN": {
          target: "dragging",
          actions: ["setActiveChannel", "setAreaColorFromPoint"]
        },
        "SLIDER.POINTER_DOWN": {
          target: "dragging",
          actions: ["setActiveChannel", "setChannelColorFromPoint"]
        },
        "CHANNEL_INPUT.FOCUS": {
          target: "focused",
          actions: ["setActiveChannel"]
        },
        "CHANNEL_INPUT.CHANGE": {
          actions: ["setChannelColorFromInput"]
        }
      }
    },
    focused: {
      on: {
        "AREA.POINTER_DOWN": {
          target: "dragging",
          actions: ["setActiveChannel", "setAreaColorFromPoint"]
        },
        "SLIDER.POINTER_DOWN": {
          target: "dragging",
          actions: ["setActiveChannel", "setChannelColorFromPoint"]
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
        },
        "CHANNEL_INPUT.FOCUS": {
          actions: ["setActiveChannel"]
        },
        "CHANNEL_INPUT.CHANGE": {
          actions: ["setChannelColorFromInput"]
        }
      }
    },
    dragging: {
      exit: ["clearActiveChannel"],
      activities: ["trackPointerMove", "disableTextSelection"],
      on: {
        "AREA.POINTER_MOVE": {
          actions: ["setAreaColorFromPoint"]
        },
        "AREA.POINTER_UP": {
          target: "focused",
          actions: ["invokeOnChangeEnd"]
        },
        "SLIDER.POINTER_MOVE": {
          actions: ["setChannelColorFromPoint"]
        },
        "SLIDER.POINTER_UP": {
          target: "focused",
          actions: ["invokeOnChangeEnd"]
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