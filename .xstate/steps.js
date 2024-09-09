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
  id: "steps",
  initial: "idle",
  context: {},
  on: {
    UPDATE_CONTEXT: {
      actions: "updateContext"
    }
  },
  states: {
    idle: {
      on: {
        "STEP.SET": {
          actions: "setStep"
        },
        "STEP.NEXT": {
          actions: "goToNextStep"
        },
        "STEP.PREV": {
          actions: "goToPrevStep"
        },
        "STEP.RESET": {
          actions: "resetStep"
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
  guards: {}
});