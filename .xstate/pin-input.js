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
  initial: "idle",
  context: {
    "autoFocus": false,
    "hasIndex": false,
    "isFinalValue": false,
    "hasValue": false,
    "hasValue": false,
    "isValueComplete": false
  },
  entry: choose([{
    cond: "autoFocus",
    actions: ["setupValue", "setFocusIndexToFirst"]
  }, {
    actions: ["setupValue"]
  }]),
  on: {
    "VALUE.SET": [{
      cond: "hasIndex",
      actions: ["setValueAtIndex"]
    }, {
      actions: ["setValue"]
    }],
    "VALUE.CLEAR": {
      actions: ["clearValue", "setFocusIndexToFirst"]
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
        "INPUT.FOCUS": {
          target: "focused",
          actions: "setFocusedIndex"
        }
      }
    },
    focused: {
      on: {
        "INPUT.CHANGE": [{
          cond: "isFinalValue",
          actions: ["setFocusedValue", "syncInputValue"]
        }, {
          actions: ["setFocusedValue", "setNextFocusedIndex", "syncInputValue"]
        }],
        "INPUT.PASTE": {
          actions: ["setPastedValue", "setLastValueFocusIndex"]
        },
        "INPUT.BLUR": {
          target: "idle",
          actions: "clearFocusedIndex"
        },
        "INPUT.DELETE": {
          cond: "hasValue",
          actions: "clearFocusedValue"
        },
        "INPUT.ARROW_LEFT": {
          actions: "setPrevFocusedIndex"
        },
        "INPUT.ARROW_RIGHT": {
          actions: "setNextFocusedIndex"
        },
        "INPUT.BACKSPACE": [{
          cond: "hasValue",
          actions: ["clearFocusedValue"]
        }, {
          actions: ["setPrevFocusedIndex", "clearFocusedValue"]
        }],
        "INPUT.ENTER": {
          cond: "isValueComplete",
          actions: "requestFormSubmit"
        },
        "VALUE.INVALID": {
          actions: "invokeOnInvalid"
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
    "autoFocus": ctx => ctx["autoFocus"],
    "hasIndex": ctx => ctx["hasIndex"],
    "isFinalValue": ctx => ctx["isFinalValue"],
    "hasValue": ctx => ctx["hasValue"],
    "isValueComplete": ctx => ctx["isValueComplete"]
  }
});