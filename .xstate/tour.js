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
  id: "tour",
  initial: ctx.open ? "open" : "closed",
  context: {
    "isValidStep": false
  },
  activities: ["trackWindowSize"],
  exit: ["clearStep"],
  on: {
    "STEP.CHANGED": {
      cond: "isValidStep",
      target: "open:prepare"
    }
  },
  on: {
    UPDATE_CONTEXT: {
      actions: "updateContext"
    }
  },
  states: {
    closed: {
      tags: ["closed"],
      on: {
        START: {
          target: "open",
          actions: ["setInitialStep", "invokeOnStart"]
        }
      }
    },
    "open:prepare": {
      tags: ["open"],
      entry: ["prepareStepTarget"],
      activities: ["trackStepTarget", "trapFocus", "trackPlacement", "trackDismissableElement"],
      after: {
        0: "open"
      }
    },
    open: {
      tags: ["open"],
      activities: ["trackStepTarget", "trapFocus", "trackPlacement", "trackDismissableElement"],
      on: {
        NEXT: {
          actions: ["setNextStep"]
        },
        PREV: {
          actions: ["setPrevStep"]
        },
        CLOSE: {
          target: "closed",
          actions: ["clearStep", "invokeOnClose"]
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
    "isValidStep": ctx => ctx["isValidStep"]
  }
});