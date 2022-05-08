"use strict";

var _xstate = require("xstate");

const {
  actions, createMachine
} = _xstate;
  
const { choose } = actions;
const fetchMachine = createMachine({
  id: "range-slider",
  initial: "unknown",
  activities: ["trackFormReset", "trackScriptedUpdate"],
  on: {
    SET_VALUE: {
      actions: "setValue"
    },
    INCREMENT: {
      actions: "incrementAtIndex"
    },
    DECREMENT: {
      actions: "decrementAtIndex"
    }
  },
  states: {
    unknown: {
      on: {
        SETUP: {
          target: "idle",
          actions: ["setupDocument", "setThumbSize", "checkValue"]
        }
      }
    },
    idle: {
      on: {
        POINTER_DOWN: {
          target: "dragging",
          actions: ["setActiveIndex", "invokeOnChangeStart", "setPointerValue", "focusActiveThumb"]
        },
        FOCUS: {
          target: "focus",
          actions: "setActiveIndex"
        }
      }
    },
    focus: {
      entry: "focusActiveThumb",
      on: {
        POINTER_DOWN: {
          target: "dragging",
          actions: ["setActiveIndex", "invokeOnChangeStart", "setPointerValue", "focusActiveThumb"]
        },
        ARROW_LEFT: {
          cond: "isHorizontal",
          actions: "decrementAtIndex"
        },
        ARROW_RIGHT: {
          cond: "isHorizontal",
          actions: "incrementAtIndex"
        },
        ARROW_UP: {
          cond: "isVertical",
          actions: "incrementAtIndex"
        },
        ARROW_DOWN: {
          cond: "isVertical",
          actions: "decrementAtIndex"
        },
        PAGE_UP: {
          actions: "incrementAtIndex"
        },
        PAGE_DOWN: {
          actions: "decrementAtIndex"
        },
        HOME: {
          actions: "setActiveThumbToMin"
        },
        END: {
          actions: "setActiveThumbToMax"
        },
        BLUR: {
          target: "idle",
          actions: "clearActiveIndex"
        }
      }
    },
    dragging: {
      entry: "focusActiveThumb",
      activities: "trackPointerMove",
      on: {
        POINTER_UP: {
          target: "focus",
          actions: "invokeOnChangeEnd"
        },
        POINTER_MOVE: {
          actions: "setPointerValue"
        }
      }
    }
  }
})