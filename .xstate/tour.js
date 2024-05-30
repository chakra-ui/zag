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
  initial: "closed",
  context: {
    "isValidStep": false,
    "completeOnSkip": false,
    "lastStep": false
  },
  activities: ["trackBoundarySize"],
  exit: ["clearStep", "cleanupFns"],
  on: {
    "STEPS.SET": {
      actions: ["setSteps"]
    },
    "STEP.SET": {
      actions: ["setStep"]
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
        },
        RESUME: {
          target: "scrolling",
          actions: ["invokeOnStart"]
        }
      }
    },
    scrolling: {
      tags: ["open"],
      entry: ["scrollStepTargetIntoView"],
      activities: ["trapFocus", "trackPlacement", "trackDismissableElement"],
      after: {
        0: "open"
      }
    },
    open: {
      tags: ["open"],
      activities: ["trapFocus", "trackPlacement", "trackDismissableElement"],
      on: {
        "STEP.CHANGED": {
          cond: "isValidStep",
          target: "scrolling"
        },
        NEXT: {
          actions: ["setNextStep"]
        },
        PREV: {
          actions: ["setPrevStep"]
        },
        PAUSE: {
          target: "closed",
          actions: ["invokeOnStop"]
        },
        SKIP: [{
          cond: "completeOnSkip",
          target: "closed",
          actions: ["invokeOnComplete", "invokeOnSkip", "clearStep"]
        }, {
          actions: ["invokeOnSkip", "setNextStep"]
        }],
        STOP: [{
          cond: "lastStep",
          target: "closed",
          actions: ["invokeOnStop", "invokeOnComplete", "clearStep"]
        }, {
          target: "closed",
          actions: ["invokeOnStop", "clearStep"]
        }]
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
    "isValidStep": ctx => ctx["isValidStep"],
    "completeOnSkip": ctx => ctx["completeOnSkip"],
    "lastStep": ctx => ctx["lastStep"]
  }
});