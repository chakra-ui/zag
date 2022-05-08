"use strict"

var _xstate = require("xstate")

const { actions, createMachine } = _xstate

const { choose } = actions
const fetchMachine = createMachine({
  initial: "unknown",
  on: {
    SET_VALUE: {
      actions: "setValue",
    },
    DELETE: {
      actions: "deleteValue",
    },
  },
  states: {
    unknown: {
      on: {
        SETUP: {
          target: "idle",
          actions: ["setupDocument", "checkRenderedElements", "setIndicatorRect", "setContentTabIndex"],
        },
      },
    },
    idle: {
      on: {
        TAB_FOCUS: {
          cond: "selectOnFocus",
          target: "focused",
          actions: ["setFocusedValue", "setValue"],
        },
        TAB_CLICK: {
          target: "focused",
          actions: ["setFocusedValue", "setValue"],
        },
      },
    },
    focused: {
      on: {
        TAB_CLICK: {
          target: "focused",
          actions: ["setFocusedValue", "setValue"],
        },
        ARROW_LEFT: {
          cond: "isHorizontal",
          actions: "focusPrevTab",
        },
        ARROW_RIGHT: {
          cond: "isHorizontal",
          actions: "focusNextTab",
        },
        ARROW_UP: {
          cond: "isVertical",
          actions: "focusPrevTab",
        },
        ARROW_DOWN: {
          cond: "isVertical",
          actions: "focusNextTab",
        },
        HOME: {
          actions: "focusFirstTab",
        },
        END: {
          actions: "focusLastTab",
        },
        ENTER: {
          cond: "!selectOnFocus",
          actions: "setValue",
        },
        TAB_FOCUS: [
          {
            cond: "selectOnFocus",
            actions: ["setFocusedValue", "setValue"],
          },
          {
            actions: "setFocusedValue",
          },
        ],
        TAB_BLUR: {
          target: "idle",
          actions: "clearFocusedValue",
        },
      },
    },
  },
})
