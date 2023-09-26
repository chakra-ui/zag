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
  initial: "idle",
  context: {
    "clampValueOnBlur && !isInRange": false,
    "isIncrementHint": false,
    "isDecrementHint": false,
    "isInRange && spinOnPress": false,
    "isIncrementHint": false,
    "isDecrementHint": false
  },
  entry: ["syncInputValue"],
  activities: ["trackFormControl"],
  on: {
    "VALUE.SET": {
      actions: ["setValue", "clampValue", "setHintToSet"]
    },
    "VALUE.CLEAR": {
      actions: ["clearValue"]
    },
    "VALUE.INCREMENT": {
      actions: ["increment"]
    },
    "VALUE.DECREMENT": {
      actions: ["decrement"]
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
        "TRIGGER.PRESS_DOWN": {
          target: "before:spin",
          actions: ["focusInput", "invokeOnFocus", "setHint"]
        },
        "SCRUBBER.PRESS_DOWN": {
          target: "scrubbing",
          actions: ["focusInput", "invokeOnFocus", "setHint", "setCursorPoint"]
        },
        "INPUT.FOCUS": {
          target: "focused",
          actions: ["focusInput", "invokeOnFocus"]
        }
      }
    },
    focused: {
      tags: "focus",
      entry: "focusInput",
      activities: "attachWheelListener",
      on: {
        "TRIGGER.PRESS_DOWN": {
          target: "before:spin",
          actions: ["focusInput", "setHint"]
        },
        "SCRUBBER.PRESS_DOWN": {
          target: "scrubbing",
          actions: ["focusInput", "setHint", "setCursorPoint"]
        },
        "INPUT.ARROW_UP": {
          actions: "increment"
        },
        "INPUT.ARROW_DOWN": {
          actions: "decrement"
        },
        "INPUT.HOME": {
          actions: "decrementToMin"
        },
        "INPUT.END": {
          actions: "incrementToMax"
        },
        "INPUT.CHANGE": {
          actions: ["setValue", "setHint"]
        },
        "INPUT.COMMIT": [{
          cond: "clampValueOnBlur && !isInRange",
          target: "idle",
          actions: ["clampValue", "syncInputElement", "clearHint", "invokeOnBlur"]
        }, {
          target: "idle",
          actions: ["syncInputElement", "invokeOnBlur"]
        }],
        "INPUT.COMPOSITION_START": {
          actions: "setComposing"
        },
        "INPUT.COMPOSITION_END": {
          actions: "clearComposing"
        }
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
        "TRIGGER.PRESS_UP": {
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
        "TRIGGER.PRESS_UP": {
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
        "SCRUBBER.POINTER_UP": "focused",
        "SCRUBBER.POINTER_MOVE": [{
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
    "clampValueOnBlur && !isInRange": ctx => ctx["clampValueOnBlur && !isInRange"],
    "isIncrementHint": ctx => ctx["isIncrementHint"],
    "isDecrementHint": ctx => ctx["isDecrementHint"],
    "isInRange && spinOnPress": ctx => ctx["isInRange && spinOnPress"]
  }
});