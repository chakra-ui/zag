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
  id: "radio",
  initial: "idle",
  context: {},
  activities: ["trackFormControlState"],
  on: {
    SET_VALUE: {
      actions: ["setValue"]
    },
    SET_HOVERED: {
      actions: "setHovered"
    },
    SET_ACTIVE: {
      actions: "setActive"
    },
    SET_FOCUSED: {
      actions: "setFocused"
    }
  },
  entry: ["checkValue", "checkRenderedElements", "setIndicatorRect"],
  on: {
    UPDATE_CONTEXT: {
      actions: "updateContext"
    }
  },
  states: {
    idle: {}
  }
}, {
  actions: {
    updateContext: assign((context, event) => {
      return {
        [event.contextKey]: true
      };
    })
  },
  guards: {}
});