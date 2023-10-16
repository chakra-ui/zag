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
  id: "range-slider",
  initial: "idle",
  context: {
    "hasIndex": false,
    "isHorizontal": false,
    "isHorizontal": false,
    "isVertical": false,
    "isVertical": false
  },
  entry: ["coarseValue"],
  activities: ["trackFormControlState", "trackThumbsSize"],
  on: {
    SET_VALUE: [{
      cond: "hasIndex",
      actions: "setValueAtIndex"
    }, {
      actions: "setValue"
    }],
    INCREMENT: {
      actions: "incrementAtIndex"
    },
    DECREMENT: {
      actions: "decrementAtIndex"
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
          target: "dragging",
          actions: ["setClosestThumbIndex", "setPointerValue", "focusActiveThumb"]
        },
        FOCUS: {
          target: "focus",
          actions: "setFocusedIndex"
        },
        THUMB_POINTER_DOWN: {
          target: "dragging",
          actions: ["setFocusedIndex", "focusActiveThumb"]
        }
      }
    },
    focus: {
      entry: "focusActiveThumb",
      on: {
        POINTER_DOWN: {
          target: "dragging",
          actions: ["setClosestThumbIndex", "setPointerValue", "focusActiveThumb"]
        },
        THUMB_POINTER_DOWN: {
          target: "dragging",
          actions: ["setFocusedIndex", "focusActiveThumb"]
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
          actions: "clearFocusedIndex"
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
}, {
  actions: {
    updateContext: assign((context, event) => {
      return {
        [event.contextKey]: true
      };
    })
  },
  guards: {
    "hasIndex": ctx => ctx["hasIndex"],
    "isHorizontal": ctx => ctx["isHorizontal"],
    "isVertical": ctx => ctx["isVertical"]
  }
});