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
  initial: "tour.inactive",
  context: {
    "isValidStep && hasResolvedTarget": false,
    "isValidStep && hasTarget": false,
    "isValidStep && isWaitingStep": false,
    "isValidStep": false,
    "isLastStep": false
  },
  activities: ["trackBoundarySize"],
  exit: ["clearStep", "cleanupFns"],
  on: {
    "STEPS.SET": {
      actions: ["setSteps"]
    },
    "STEP.SET": {
      actions: ["setStep"]
    },
    "STEP.NEXT": {
      actions: ["setNextStep"]
    },
    "STEP.PREV": {
      actions: ["setPrevStep"]
    },
    "STEP.CHANGED": [{
      cond: "isValidStep && hasResolvedTarget",
      target: "target.scrolling"
    }, {
      cond: "isValidStep && hasTarget",
      target: "target.resolving"
    }, {
      cond: "isValidStep && isWaitingStep",
      target: "step.waiting"
    }, {
      cond: "isValidStep",
      target: "tour.active"
    }],
    DISMISS: [{
      cond: "isLastStep",
      target: "tour.inactive",
      actions: ["invokeOnDismiss", "invokeOnComplete", "clearStep"]
    }, {
      target: "tour.inactive",
      actions: ["invokeOnDismiss", "clearStep"]
    }]
  },
  on: {
    UPDATE_CONTEXT: {
      actions: "updateContext"
    }
  },
  states: {
    "tour.inactive": {
      tags: ["closed"],
      on: {
        START: {
          actions: ["setInitialStep", "invokeOnStart"]
        }
      }
    },
    "target.resolving": {
      tags: ["closed"],
      activities: ["waitForTarget"],
      after: {
        MISSING_TARGET_TIMEOUT: {
          target: "tour.inactive",
          actions: ["invokeOnNotFound", "clearStep"]
        }
      },
      on: {
        "TARGET.RESOLVED": {
          target: "target.scrolling",
          actions: ["setResolvedTarget"]
        }
      }
    },
    "target.scrolling": {
      tags: ["open"],
      entry: ["scrollToTarget"],
      activities: ["trapFocus", "trackPlacement", "trackDismissableBranch", "trackInteractOutside", "trackEscapeKeydown"],
      after: {
        100: "tour.active"
      }
    },
    "step.waiting": {
      tags: ["closed"]
    },
    "tour.active": {
      tags: ["open"],
      activities: ["trapFocus", "trackPlacement", "trackDismissableBranch", "trackInteractOutside", "trackEscapeKeydown"]
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
    "isValidStep && hasResolvedTarget": ctx => ctx["isValidStep && hasResolvedTarget"],
    "isValidStep && hasTarget": ctx => ctx["isValidStep && hasTarget"],
    "isValidStep && isWaitingStep": ctx => ctx["isValidStep && isWaitingStep"],
    "isValidStep": ctx => ctx["isValidStep"],
    "isLastStep": ctx => ctx["isLastStep"]
  }
});