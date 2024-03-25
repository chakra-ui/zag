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
  initial: initialState,
  context: {
    "isPresent": false,
    "isAnimationNone || isDisplayNone": false,
    "wasPresent && isAnimating": false
  },
  on: {
    "NODE.SET": {
      actions: ["setNode", "setStyles"]
    },
    "PRESENCE.CHANGED": [{
      cond: "isPresent",
      target: "mounted",
      actions: ["setPrevAnimationName"]
    }, {
      cond: "isAnimationNone || isDisplayNone",
      target: "unmounted",
      actions: ["invokeOnExitComplete"]
    }, {
      cond: "wasPresent && isAnimating",
      target: "unmountSuspended"
    }, {
      target: "unmounted",
      actions: ["invokeOnExitComplete"]
    }]
  },
  on: {
    UPDATE_CONTEXT: {
      actions: "updateContext"
    }
  },
  states: {
    mounted: {
      on: {
        UNMOUNT: "unmounted"
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
        }
      }
    },
    unmounted: {
      entry: ["clearPrevAnimationName"],
      on: {
        MOUNT: "mounted"
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
    "isPresent": ctx => ctx["isPresent"],
    "isAnimationNone || isDisplayNone": ctx => ctx["isAnimationNone || isDisplayNone"],
    "wasPresent && isAnimating": ctx => ctx["wasPresent && isAnimating"]
  }
});