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
      on: {
        MOUNT: {
          target: "mounted",
          actions: ["setPrevAnimationName"]
        },
        "ANIMATION.END": {
          target: "unmounted",
          actions: ["invokeOnExitComplete"]
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