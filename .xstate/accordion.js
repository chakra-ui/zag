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
    SET_VALUE: {
      actions: "setValue"
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
        FOCUS: {
          target: "focused",
          actions: "setFocusedValue"
        }
      }
    },
    focused: {
      on: {
        ARROW_DOWN: {
          actions: "focusNext"
        },
        ARROW_UP: {
          actions: "focusPrev"
        },
        CLICK: [{
          cond: "isExpanded && canToggle",
          actions: "collapse"
        }, {
          cond: "!isExpanded",
          actions: "expand"
        }],
        HOME: {
          actions: "focusFirst"
        },
        END: {
          actions: "focusLast"
        },
        BLUR: {
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