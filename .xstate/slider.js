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
  initial: "idle",
  context: {
    "hasIndex": false
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
      actions: "incrementThumbAtIndex"
    },
    DECREMENT: {
      actions: "decrementThumbAtIndex"
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
        ARROW_DEC: {
          actions: ["decrementThumbAtIndex", "invokeOnChangeEnd"]
        },
        ARROW_INC: {
          actions: ["incrementThumbAtIndex", "invokeOnChangeEnd"]
        },
        HOME: {
          actions: ["setFocusedThumbToMin", "invokeOnChangeEnd"]
        },
        END: {
          actions: ["setFocusedThumbToMax", "invokeOnChangeEnd"]
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
    "hasIndex": ctx => ctx["hasIndex"]
  }
});