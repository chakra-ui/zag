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
  id: "angle-slider",
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
        "CONTROL.POINTER_DOWN": {
          target: "dragging",
          actions: ["setPointerValue", "focusThumb"]
        },
        "THUMB.FOCUS": {
          target: "focused"
        }
      }
    },
    focused: {
      on: {
        "CONTROL.POINTER_DOWN": {
          target: "dragging",
          actions: ["setPointerValue", "focusThumb"]
        },
        "THUMB.ARROW_DEC": {
          actions: ["decrementValue", "invokeOnChangeEnd"]
        },
        "THUMB.ARROW_INC": {
          actions: ["incrementValue", "invokeOnChangeEnd"]
        },
        "THUMB.HOME": {
          actions: ["setValueToMin", "invokeOnChangeEnd"]
        },
        "THUMB.END": {
          actions: ["setValueToMax", "invokeOnChangeEnd"]
        },
        "THUMB.BLUR": {
          target: "idle"
        }
      }
    },
    dragging: {
      entry: "focusThumb",
      activities: "trackPointerMove",
      on: {
        "DOC.POINTER_UP": {
          target: "focused",
          actions: "invokeOnChangeEnd"
        },
        "DOC.POINTER_MOVE": {
          actions: "setPointerValue"
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