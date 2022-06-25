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
  initial: "unknown",
  context: {
    "shouldCheck && isInteractive": false,
    "isInteractive": false,
    "isDefaultChecked": false,
    "isInteractive": false,
    "isInteractive": false
  },
  activities: ["trackFormReset", "trackFieldsetDisabled"],
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
    unknown: {
      on: {
        SETUP: [{
          target: "checked",
          cond: "isDefaultChecked",
          actions: ["setupDocument"]
        }, {
          target: "unchecked",
          actions: ["setupDocument"]
        }]
      }
    },
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
    "isInteractive": ctx => ctx["isInteractive"],
    "isDefaultChecked": ctx => ctx["isDefaultChecked"]
  }
});