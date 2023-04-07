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
  id: "checkbox",
  initial: ctx.checked ? "checked" : "unchecked",
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
      actions: ["invokeOnChange", "dispatchChangeEvent"]
    }, {
      cond: "isInteractive",
      target: "unchecked",
      actions: ["invokeOnChange", "dispatchChangeEvent"]
    }],
    SET_ACTIVE: {
      actions: "setActive"
    },
    SET_HOVERED: {
      actions: "setHovered"
    },
    SET_FOCUSED: {
      actions: "setFocused"
    },
    SET_INDETERMINATE: {
      actions: "setIndeterminate"
    }
  },
  on: {
    UPDATE_CONTEXT: {
      actions: "updateContext"
    }
  },
  states: {
    checked: {
      on: {
        TOGGLE: {
          target: "unchecked",
          cond: "isInteractive",
          actions: ["invokeOnChange"]
        }
      }
    },
    unchecked: {
      on: {
        TOGGLE: {
          target: "checked",
          cond: "isInteractive",
          actions: ["invokeOnChange"]
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