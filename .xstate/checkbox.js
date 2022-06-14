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
    "shouldCheck && canToggle": false,
    "canToggle": false,
    "isDefaultChecked": false,
    "canToggle": false,
    "canToggle": false
  },
  on: {
    SET_STATE: [{
      cond: "shouldCheck && canToggle",
      target: "checked",
      actions: ["dispatchChangeEvent"]
    }, {
      cond: "canToggle",
      target: "unchecked",
      actions: ["dispatchChangeEvent"]
    }],
    SET_ACTIVE: {
      actions: "setActive"
    },
    SET_DISABLED: {
      actions: "setDisabled"
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
    SET_READONLY: {
      actions: "setReadOnly"
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
          cond: "canToggle",
          actions: ["invokeOnChange"]
        }
      }
    },
    unchecked: {
      on: {
        TOGGLE: {
          target: "checked",
          cond: "canToggle",
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
    "shouldCheck && canToggle": ctx => ctx["shouldCheck && canToggle"],
    "canToggle": ctx => ctx["canToggle"],
    "isDefaultChecked": ctx => ctx["isDefaultChecked"]
  }
});