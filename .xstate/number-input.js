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
    "isInvalidExponential": false,
    "clampOnBlur && !isInRange && !isEmptyValue": false,
    "isIncrementHint": false,
    "isDecrementHint": false,
    "isInRange": false,
    "isIncrementHint": false,
    "isDecrementHint": false
  },
  on: {
    SET_VALUE: {
      actions: ["setValue", "setHintToSet"]
    },
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
      tags: ["focus"],
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
          actions: ["clearValue", "clearHint"]
        }, {
          cond: "clampOnBlur && !isInRange && !isEmptyValue",
          target: "idle",
          actions: ["clampValue", "clearHint"]
        }, {
          target: "idle",
          actions: "roundValue"
        }]
      }
    },
    "before:spin": {
      tags: ["focus"],
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
          cond: "isInRange"
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
      tags: ["focus"],
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
      tags: ["focus"],
      entry: ["addCustomCursor", "disableTextSelection"],
      exit: ["removeCustomCursor", "restoreTextSelection"],
      activities: ["activatePointerLock", "trackMousemove"],
      on: {
        POINTER_UP_SCRUBBER: {
          target: "focused",
          actions: "clearCursorPoint"
        },
        POINTER_MOVE_SCRUBBER: [{
          cond: "isIncrementHint",
          actions: ["increment", "setCursorPoint", "updateCursor"]
        }, {
          cond: "isDecrementHint",
          actions: ["decrement", "setCursorPoint", "updateCursor"]
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
    "isInvalidExponential": ctx => ctx["isInvalidExponential"],
    "clampOnBlur && !isInRange && !isEmptyValue": ctx => ctx["clampOnBlur && !isInRange && !isEmptyValue"],
    "isIncrementHint": ctx => ctx["isIncrementHint"],
    "isDecrementHint": ctx => ctx["isDecrementHint"],
    "isInRange": ctx => ctx["isInRange"]
  }
});