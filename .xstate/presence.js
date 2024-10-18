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
  initial: ctx.present ? "mounted" : "unmounted",
  context: {},
  exit: ["clearInitial"],
  on: {
    "NODE.SET": {
      actions: ["setNode", "setStyles"]
    }
  },
  on: {
    UPDATE_CONTEXT: {
      actions: "updateContext"
    }
  },
  states: {
    mounted: {
      on: {
        UNMOUNT: {
          target: "unmounted",
          actions: ["invokeOnExitComplete"]
        },
        "UNMOUNT.SUSPEND": "unmountSuspended"
      }
    },
    unmountSuspended: {
      activities: ["trackAnimationEvents"],
      after: {
        // Fallback to timeout to ensure we exit this state even if the `animationend` event
        // did not get trigger
        ANIMATION_DURATION: {
          target: "unmounted",
          actions: ["invokeOnExitComplete"]
        }
      },
      on: {
        MOUNT: {
          target: "mounted",
          actions: ["setPrevAnimationName"]
        },
        UNMOUNT: {
          target: "unmounted",
          actions: ["invokeOnExitComplete"]
        }
      }
    },
    unmounted: {
      entry: ["clearPrevAnimationName"],
      on: {
        MOUNT: {
          target: "mounted",
          actions: ["setPrevAnimationName"]
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