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
  initial: "idle",
  context: {
    "selectOnFocus": false,
    "selectOnFocus": false,
    "selectOnFocus": false,
    "selectOnFocus": false,
    "!selectOnFocus": false
  },
  entry: ["checkRenderedElements", "syncIndicatorRect", "setContentTabIndex"],
  exit: ["cleanupObserver"],
  on: {
    SET_VALUE: {
      actions: "setValue"
    },
    CLEAR_VALUE: {
      actions: "clearValue"
    },
    SET_INDICATOR_RECT: {
      actions: "setIndicatorRect"
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
        TAB_FOCUS: {
          target: "focused",
          actions: "setFocusedValue"
        },
        TAB_CLICK: {
          target: "focused",
          actions: ["setFocusedValue", "setValue"]
        }
      }
    },
    focused: {
      on: {
        TAB_CLICK: {
          target: "focused",
          actions: ["setFocusedValue", "setValue"]
        },
        ARROW_PREV: [{
          cond: "selectOnFocus",
          actions: ["focusPrevTab", "selectFocusedTab"]
        }, {
          actions: "focusPrevTab"
        }],
        ARROW_NEXT: [{
          cond: "selectOnFocus",
          actions: ["focusNextTab", "selectFocusedTab"]
        }, {
          actions: "focusNextTab"
        }],
        HOME: [{
          cond: "selectOnFocus",
          actions: ["focusFirstTab", "selectFocusedTab"]
        }, {
          actions: "focusFirstTab"
        }],
        END: [{
          cond: "selectOnFocus",
          actions: ["focusLastTab", "selectFocusedTab"]
        }, {
          actions: "focusLastTab"
        }],
        ENTER: {
          cond: "!selectOnFocus",
          actions: "selectFocusedTab"
        },
        TAB_FOCUS: {
          actions: ["setFocusedValue"]
        },
        TAB_BLUR: {
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
    "selectOnFocus": ctx => ctx["selectOnFocus"],
    "!selectOnFocus": ctx => ctx["!selectOnFocus"]
  }
});