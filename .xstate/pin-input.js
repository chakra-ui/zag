"use strict";

var _xstate = require("xstate");

const {
  actions, createMachine
} = _xstate;
  
const { choose } = actions;
const fetchMachine = createMachine({
  id: "pin-input",
  initial: "unknown",
  on: {
    SET_VALUE: [{
      cond: "hasIndex",
      actions: "setValueAtIndex"
    }, {
      actions: "setValue"
    }],
    CLEAR_VALUE: [{
      cond: "isDisabled",
      actions: "clearValue"
    }, {
      actions: ["clearValue", "setFocusIndexToFirst"]
    }]
  },
  states: {
    unknown: {
      on: {
        SETUP: [{
          cond: "autoFocus",
          target: "focused",
          actions: ["setupDocument", "setupValue", "setFocusIndexToFirst"]
        }, {
          target: "idle",
          actions: ["setupDocument", "setupValue"]
        }]
      }
    },
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
          actions: "setFocusedValue"
        }, {
          cond: "hasValue && isValidValue",
          actions: ["replaceFocusedValue", "setNextFocusedIndex"]
        }, {
          cond: "isValidValue",
          actions: ["setFocusedValue", "setNextFocusedIndex"]
        }],
        PASTE: {
          cond: "isValidValue",
          actions: ["setPastedValue", "setLastValueFocusIndex"]
        },
        BLUR: {
          target: "idle",
          actions: "clearFocusedIndex"
        },
        DELETE: {
          cond: "hasValue",
          actions: "clearFocusedValue"
        },
        ARROW_LEFT: {
          actions: "setPrevFocusedIndex"
        },
        ARROW_RIGHT: {
          actions: "setNextFocusedIndex"
        },
        BACKSPACE: [{
          cond: "hasValue",
          actions: "clearFocusedValue"
        }, {
          actions: ["setPrevFocusedIndex", "clearFocusedValue"]
        }],
        KEY_DOWN: {
          cond: "!isValidValue",
          actions: ["preventDefault", "invokeOnInvalid"]
        }
      }
    }
  }
})