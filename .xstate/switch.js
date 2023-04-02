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
  id: "switch",
  initial: ctx.defaultChecked ? "checked" : "unchecked",
  context: {
    "shouldCheck && isInteractive": false,
    "isInteractive": false,
    "isInteractive": false,
    "isInteractive": false
  },
  activities: ["trackFormControlState"],
  on: {
    SET_STATE: [{
      cond: "shouldCheck && isInteractive",
      target: "checked",
      actions: "dispatchChangeEvent"
    }, {
      cond: "isInteractive",
      target: "unchecked",
      actions: "dispatchChangeEvent"
    }],
    SET_ACTIVE: {
      actions: "setActive"
    },
    SET_HOVERED: {
      actions: "setHovered"
    },
    SET_FOCUSED: {
      actions: "setFocused"
    }
  },
  on: {
    UPDATE_CONTEXT: {
      actions: "updateContext"
    }
  },
  states: {
    checked: {
      entry: ["invokeOnChange"],
      on: {
        TOGGLE: {
          target: "unchecked",
          cond: "isInteractive"
        }
      }
    },
    unchecked: {
      entry: ["invokeOnChange"],
      on: {
        TOGGLE: {
          target: "checked",
          cond: "isInteractive"
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
    "shouldCheck && isInteractive": ctx => ctx["shouldCheck && isInteractive"],
    "isInteractive": ctx => ctx["isInteractive"]
  }
});