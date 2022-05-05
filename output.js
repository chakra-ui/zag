{
  id: "number-input",
  initial: "unknown",
  entry: ["syncInputValue"],
  on: {
    SET_VALUE: {
      actions: ["setValue", "setHintToSet"]
    },
    INCREMENT: {
      actions: ["increment"]
    },
    DECREMENT: {
      actions: ["decrement"]
    }
  },
  states: {
    unknown: {
      on: {
        SETUP: {
          target: "idle",
          actions: "setupDocument"
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
          actions: ["setValue", "setSelectionRange", "setHint"]
        },
        BLUR: [{
          cond: "isInvalidExponential",
          target: "idle",
          actions: ["clearValue", "clearHint"]
        }, {
          cond: and("clampOnBlur", not("isInRange")),
          target: "idle",
          actions: ["clampValue", "clearHint"]
        }, {
          actions: ["roundValue"]
        }]
      }
    },
    "before:spin": {
      tags: ["focus"],
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
          actions: ["clearHint", "restoreSelection"]
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
          actions: ["clearHint", "restoreSelection"]
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
          actions: ["clearCursorPoint"]
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
}