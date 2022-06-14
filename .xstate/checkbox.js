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
    "shouldCheck": false,
    "isDefaultChecked": false
  },
  on: {
    SET_STATE: [{
      cond: "shouldCheck",
      target: "checked",
      actions: ["dispatchChangeEvent"]
    }, {
      target: "unchecked",
      actions: ["dispatchChangeEvent"]
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
    },
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
          actions: ["invokeOnChange"]
        }
      }
    },
    unchecked: {
      on: {
        TOGGLE: {
          target: "checked",
          actions: ["invokeOnChange"]
        }
      }
    }
  },
  activities: ["trackFormReset", "trackFieldsetDisabled"]
}, {
  actions: {
    updateContext: assign((context, event) => {
      return {
        [event.contextKey]: true
      };
    })
  },
  guards: {
    "shouldCheck": ctx => ctx["shouldCheck"],
    "isDefaultChecked": ctx => ctx["isDefaultChecked"]
  }
});