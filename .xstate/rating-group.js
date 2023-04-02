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
  id: "rating",
  initial: "idle",
  context: {
    "isValueEmpty": false,
    "isRadioFocused": false
  },
  activities: ["trackFormControlState"],
  entry: ["checkValue"],
  on: {
    SET_VALUE: {
      actions: ["setValue"]
    },
    CLEAR_VALUE: {
      actions: ["clearValue"]
    }
  },
  on: {
    UPDATE_CONTEXT: {
      actions: "updateContext"
    }
  },
  states: {
    idle: {
      entry: "clearHoveredValue",
      on: {
        GROUP_POINTER_OVER: "hover",
        FOCUS: "focus",
        CLICK: {
          actions: ["setValue", "focusActiveRadio"]
        }
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
}, {
  actions: {
    updateContext: assign((context, event) => {
      return {
        [event.contextKey]: true
      };
    })
  },
  guards: {
    "isValueEmpty": ctx => ctx["isValueEmpty"],
    "isRadioFocused": ctx => ctx["isRadioFocused"]
  }
});