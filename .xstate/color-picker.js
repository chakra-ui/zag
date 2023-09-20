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
  activities: ["trackFormControl"],
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
          actions: ["setActiveChannel", "setAreaColorFromPoint", "focusAreaThumb"]
        },
        "AREA.FOCUS": {
          target: "focused",
          actions: ["setActiveChannel"]
        },
        "CHANNEL_SLIDER.POINTER_DOWN": {
          target: "dragging",
          actions: ["setActiveChannel", "setChannelColorFromPoint", "focusChannelThumb"]
        },
        "CHANNEL_SLIDER.FOCUS": {
          target: "focused",
          actions: ["setActiveChannel"]
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
          actions: ["setActiveChannel", "setAreaColorFromPoint", "focusAreaThumb"]
        },
        "CHANNEL_SLIDER.POINTER_DOWN": {
          target: "dragging",
          actions: ["setActiveChannel", "setChannelColorFromPoint", "focusChannelThumb"]
        },
        "AREA.ARROW_LEFT": {
          actions: ["decrementXChannel"]
        },
        "AREA.ARROW_RIGHT": {
          actions: ["incrementXChannel"]
        },
        "AREA.ARROW_UP": {
          actions: ["incrementYChannel"]
        },
        "AREA.ARROW_DOWN": {
          actions: ["decrementYChannel"]
        },
        "AREA.PAGE_UP": {
          actions: ["incrementXChannel"]
        },
        "AREA.PAGE_DOWN": {
          actions: ["decrementXChannel"]
        },
        "CHANNEL_SLIDER.ARROW_LEFT": {
          actions: ["decrementChannel"]
        },
        "CHANNEL_SLIDER.ARROW_RIGHT": {
          actions: ["incrementChannel"]
        },
        "CHANNEL_SLIDER.ARROW_UP": {
          actions: ["incrementChannel"]
        },
        "CHANNEL_SLIDER.ARROW_DOWN": {
          actions: ["decrementChannel"]
        },
        "CHANNEL_SLIDER.PAGE_UP": {
          actions: ["incrementChannel"]
        },
        "CHANNEL_SLIDER.PAGE_DOWN": {
          actions: ["decrementChannel"]
        },
        "CHANNEL_SLIDER.HOME": {
          actions: ["setChannelToMin"]
        },
        "CHANNEL_SLIDER.END": {
          actions: ["setChannelToMax"]
        },
        "CHANNEL_INPUT.FOCUS": {
          actions: ["setActiveChannel"]
        },
        "CHANNEL_INPUT.CHANGE": {
          actions: ["setChannelColorFromInput"]
        },
        "CHANNEL_SLIDER.BLUR": {
          target: "idle"
        },
        "AREA.BLUR": {
          target: "idle"
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
        "CHANNEL_SLIDER.POINTER_MOVE": {
          actions: ["setChannelColorFromPoint"]
        },
        "CHANNEL_SLIDER.POINTER_UP": {
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