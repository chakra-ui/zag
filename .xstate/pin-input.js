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
  id: "pin-input",
  initial: ctx.autoFocus ? "focused" : "idle",
  context: {
    "hasIndex": false,
    "isDisabled": false,
    "isFinalValue && isValidValue": false,
    "isValidValue": false,
    "isValidValue": false,
    "hasValue": false,
    "hasValue": false,
    "isValueComplete": false,
    "!isValidValue": false
  },
  entry: ctx.autoFocus ? ["setupValue", "setFocusIndexToFirst"] : ["setupValue"],
  on: {
    SET_VALUE: [{
      cond: "hasIndex",
      actions: ["setValueAtIndex"]
    }, {
      actions: ["setValue"]
    }],
    CLEAR_VALUE: [{
      cond: "isDisabled",
      actions: ["clearValue"]
    }, {
      actions: ["clearValue", "setFocusIndexToFirst"]
    }]
  },
  on: {
    UPDATE_CONTEXT: {
      actions: "updateContext"
    }
  },
  states: {
    idle: {
      on: {
        FOCUS: {
          target: "focused",
          actions: "setFocusedIndex"
        }
      }
    },
    focused: {
      on: {
        INPUT: [{
          cond: "isFinalValue && isValidValue",
          actions: ["setFocusedValue", "syncInputValue"]
        }, {
          cond: "isValidValue",
          actions: ["setFocusedValue", "setNextFocusedIndex", "syncInputValue"]
        }],
        PASTE: [{
          cond: "isValidValue",
          actions: ["setPastedValue", "setLastValueFocusIndex"]
        }, {
          actions: ["revertInputValue"]
        }],
        BLUR: {
          target: "idle",
          actions: "clearFocusedIndex"
        },
        DELETE: {
          cond: "hasValue",
          actions: ["clearFocusedValue"]
        },
        ARROW_LEFT: {
          actions: "setPrevFocusedIndex"
        },
        ARROW_RIGHT: {
          actions: "setNextFocusedIndex"
        },
        BACKSPACE: [{
          cond: "hasValue",
          actions: ["clearFocusedValue"]
        }, {
          actions: ["setPrevFocusedIndex", "clearFocusedValue"]
        }],
        ENTER: {
          cond: "isValueComplete",
          actions: "requestFormSubmit"
        },
        KEY_DOWN: {
          cond: "!isValidValue",
          actions: ["preventDefault", "invokeOnInvalid"]
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
    "isDisabled": ctx => ctx["isDisabled"],
    "isFinalValue && isValidValue": ctx => ctx["isFinalValue && isValidValue"],
    "isValidValue": ctx => ctx["isValidValue"],
    "hasValue": ctx => ctx["hasValue"],
    "isValueComplete": ctx => ctx["isValueComplete"],
    "!isValidValue": ctx => ctx["!isValidValue"]
  }
});