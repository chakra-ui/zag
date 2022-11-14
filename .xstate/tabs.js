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
  initial: "unknown",
  context: {
    "selectOnFocus": false,
    "isHorizontal": false,
    "isHorizontal": false,
    "isVertical": false,
    "isVertical": false,
    "!selectOnFocus": false,
    "selectOnFocus": false
  },
  on: {
    SET_VALUE: {
      actions: "setValue"
    },
    CLEAR_VALUE: {
      actions: "clearValue"
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
          actions: ["checkRenderedElements", "setIndicatorRect", "setContentTabIndex"]
        }
      }
    },
    idle: {
      on: {
        TAB_FOCUS: {
          cond: "selectOnFocus",
          target: "focused",
          actions: ["setFocusedValue", "setValue"]
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
        ARROW_LEFT: {
          cond: "isHorizontal",
          actions: "focusPrevTab"
        },
        ARROW_RIGHT: {
          cond: "isHorizontal",
          actions: "focusNextTab"
        },
        ARROW_UP: {
          cond: "isVertical",
          actions: "focusPrevTab"
        },
        ARROW_DOWN: {
          cond: "isVertical",
          actions: "focusNextTab"
        },
        HOME: {
          actions: "focusFirstTab"
        },
        END: {
          actions: "focusLastTab"
        },
        ENTER: {
          cond: "!selectOnFocus",
          actions: "setValue"
        },
        TAB_FOCUS: [{
          cond: "selectOnFocus",
          actions: ["setFocusedValue", "setValue"]
        }, {
          actions: "setFocusedValue"
        }],
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
    "isHorizontal": ctx => ctx["isHorizontal"],
    "isVertical": ctx => ctx["isVertical"],
    "!selectOnFocus": ctx => ctx["!selectOnFocus"]
  }
});