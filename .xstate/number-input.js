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
  id: "number-input",
  initial: "unknown",
  context: {
    "clampOnBlur": false,
    "isInvalidExponential": false,
    "clampOnBlur && !isInRange && !isEmptyValue": false,
    "isIncrementHint": false,
    "isDecrementHint": false,
    "isInRange && spinOnPress": false,
    "isIncrementHint": false,
    "isDecrementHint": false
  },
  on: {
    SET_VALUE: [{
      cond: "clampOnBlur",
      actions: ["setValue", "clampValue", "setHintToSet"]
    }, {
      actions: ["setValue", "setHintToSet"]
    }],
    CLEAR_VALUE: {
      actions: ["clearValue"]
    },
    INCREMENT: {
      actions: ["increment"]
    },
    DECREMENT: {
      actions: ["decrement"]
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
          actions: "syncInputValue"
        }
      }
    },
    idle: {
      exit: "invokeOnFocus",
      on: {
        PRESS_DOWN: {
          target: "before:spin",
          actions: ["focusInput", "setHint"]
        },
        PRESS_DOWN_SCRUBBER: {
          target: "scrubbing",
          actions: ["focusInput", "setHint", "setCursorPoint"]
        },
        FOCUS: "focused"
      }
    },
    focused: {
      tags: "focus",
      entry: "focusInput",
      activities: "attachWheelListener",
      on: {
        PRESS_DOWN: {
          target: "before:spin",
          actions: ["focusInput", "setHint"]
        },
        PRESS_DOWN_SCRUBBER: {
          target: "scrubbing",
          actions: ["focusInput", "setHint", "setCursorPoint"]
        },
        ARROW_UP: {
          actions: "increment"
        },
        ARROW_DOWN: {
          actions: "decrement"
        },
        HOME: {
          actions: "setToMin"
        },
        END: {
          actions: "setToMax"
        },
        CHANGE: {
          actions: ["setValue", "setHint"]
        },
        BLUR: [{
          cond: "isInvalidExponential",
          target: "idle",
          actions: ["clearValue", "clearHint", "invokeOnBlur"]
        }, {
          cond: "clampOnBlur && !isInRange && !isEmptyValue",
          target: "idle",
          actions: ["clampValue", "clearHint", "invokeOnBlur"]
        }, {
          target: "idle",
          actions: ["roundValue", "invokeOnBlur"]
        }]
      }
    },
    "before:spin": {
      tags: "focus",
      activities: "trackButtonDisabled",
      entry: choose([{
        cond: "isIncrementHint",
        actions: "increment"
      }, {
        cond: "isDecrementHint",
        actions: "decrement"
      }]),
      after: {
        CHANGE_DELAY: {
          target: "spinning",
          cond: "isInRange && spinOnPress"
        }
      },
      on: {
        PRESS_UP: {
          target: "focused",
          actions: "clearHint"
        }
      }
    },
    spinning: {
      tags: "focus",
      activities: "trackButtonDisabled",
      invoke: {
        src: "interval",
        id: "interval"
      },
      on: {
        PRESS_UP: {
          target: "focused",
          actions: "clearHint"
        }
      }
    },
    scrubbing: {
      tags: "focus",
      exit: "clearCursorPoint",
      activities: ["activatePointerLock", "trackMousemove", "setupVirtualCursor", "preventTextSelection"],
      on: {
        POINTER_UP_SCRUBBER: "focused",
        POINTER_MOVE_SCRUBBER: [{
          cond: "isIncrementHint",
          actions: ["increment", "setCursorPoint"]
        }, {
          cond: "isDecrementHint",
          actions: ["decrement", "setCursorPoint"]
        }]
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
  delays: {
    CHANGE_DELAY: 300,
    CHANGE_INTERVAL: 50
  },
  guards: {
    "clampOnBlur": ctx => ctx["clampOnBlur"],
    "isInvalidExponential": ctx => ctx["isInvalidExponential"],
    "clampOnBlur && !isInRange && !isEmptyValue": ctx => ctx["clampOnBlur && !isInRange && !isEmptyValue"],
    "isIncrementHint": ctx => ctx["isIncrementHint"],
    "isDecrementHint": ctx => ctx["isDecrementHint"],
    "isInRange && spinOnPress": ctx => ctx["isInRange && spinOnPress"]
  }
});