"use strict";

var _xstate = require("xstate");

const {
  actions, createMachine
} = _xstate;
  
const { choose } = actions;
const fetchMachine = createMachine({
  id: "rating",
  initial: "unknown",
  states: {
    unknown: {
      on: {
        SETUP: {
          target: "idle",
          actions: ["setupDocument", "checkValue"]
        }
      }
    },
    idle: {
      entry: "clearHoveredValue",
      on: {
        GROUP_POINTER_OVER: "hover",
        FOCUS: "focus"
      }
    },
    focus: {
      on: {
        POINTER_OVER: {
          actions: "setHoveredValue"
        },
        GROUP_POINTER_LEAVE: {
          actions: "clearHoveredValue"
        },
        BLUR: "idle",
        SPACE: {
          cond: "isValueEmpty",
          actions: ["setValue"]
        },
        CLICK: {
          actions: ["setValue", "focusActiveRadio"]
        },
        ARROW_LEFT: {
          actions: ["setPrevValue", "focusActiveRadio"]
        },
        ARROW_RIGHT: {
          actions: ["setNextValue", "focusActiveRadio"]
        },
        HOME: {
          actions: ["setValueToMin", "focusActiveRadio"]
        },
        END: {
          actions: ["setValueToMax", "focusActiveRadio"]
        }
      }
    },
    hover: {
      on: {
        POINTER_OVER: {
          actions: "setHoveredValue"
        },
        GROUP_POINTER_LEAVE: [{
          cond: "isRadioFocused",
          target: "focus",
          actions: "clearHoveredValue"
        }, {
          target: "idle",
          actions: "clearHoveredValue"
        }],
        CLICK: {
          actions: ["setValue", "focusActiveRadio"]
        }
      }
    }
  }
})