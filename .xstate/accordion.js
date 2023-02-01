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
  id: "accordion",
  initial: "idle",
  context: {
    "isExpanded && canToggle": false,
    "!isExpanded": false
  },
  on: {
    "VALUE.SET": {
      actions: ["setValue", "invokeOnChange"]
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
        "TRIGGER.FOCUS": {
          target: "focused",
          actions: "setFocusedValue"
        }
      }
    },
    focused: {
      on: {
        "GOTO.NEXT": {
          actions: "focusNext"
        },
        "GOTO.PREV": {
          actions: "focusPrev"
        },
        "TRIGGER.CLICK": [{
          cond: "isExpanded && canToggle",
          actions: ["collapse", "invokeOnChange"]
        }, {
          cond: "!isExpanded",
          actions: ["expand", "invokeOnChange"]
        }],
        "GOTO.FIRST": {
          actions: "focusFirst"
        },
        "GOTO.LAST": {
          actions: "focusLast"
        },
        "TRIGGER.BLUR": {
          target: "idle",
          actions: "clearFocusedValue"
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
    "isExpanded && canToggle": ctx => ctx["isExpanded && canToggle"],
    "!isExpanded": ctx => ctx["!isExpanded"]
  }
});