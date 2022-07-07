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
  id: "slider",
  initial: "unknown",
  context: {
    "isHorizontal": false,
    "isHorizontal": false,
    "isVertical": false,
    "isVertical": false
  },
  activities: ["trackFormReset", "trackFieldsetDisabled"],
  on: {
    SET_VALUE: {
      actions: "setValue"
    },
    INCREMENT: {
      actions: "increment"
    },
    DECREMENT: {
      actions: "decrement"
    }
  },
  on: {
    UPDATE_CONTEXT: {
      actions: "updateContext"
    }
  },
  states: {
    unknown: {
      on: {
        SETUP: {
          target: "idle",
          actions: ["setThumbSize", "checkValue"]
        }
      }
    },
    idle: {
      on: {
        POINTER_DOWN: {
          target: "dragging",
          actions: ["setPointerValue", "invokeOnChangeStart", "focusThumb"]
        },
        FOCUS: "focus"
      }
    },
    focus: {
      entry: "focusThumb",
      on: {
        POINTER_DOWN: {
          target: "dragging",
          actions: ["setPointerValue", "invokeOnChangeStart", "focusThumb"]
        },
        ARROW_LEFT: {
          cond: "isHorizontal",
          actions: "decrement"
        },
        ARROW_RIGHT: {
          cond: "isHorizontal",
          actions: "increment"
        },
        ARROW_UP: {
          cond: "isVertical",
          actions: "increment"
        },
        ARROW_DOWN: {
          cond: "isVertical",
          actions: "decrement"
        },
        PAGE_UP: {
          actions: "increment"
        },
        PAGE_DOWN: {
          actions: "decrement"
        },
        HOME: {
          actions: "setToMin"
        },
        END: {
          actions: "setToMax"
        },
        BLUR: "idle"
      }
    },
    dragging: {
      entry: "focusThumb",
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
}, {
  actions: {
    updateContext: assign((context, event) => {
      return {
        [event.contextKey]: true
      };
    })
  },
  guards: {
    "isHorizontal": ctx => ctx["isHorizontal"],
    "isVertical": ctx => ctx["isVertical"]
  }
});