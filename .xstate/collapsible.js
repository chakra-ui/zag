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
  id: "collapsible",
  initial: ctx.open ? "open" : "closed",
  context: {},
  entry: ["setMountAnimationPrevented"],
  on: {
    UPDATE_CONTEXT: {
      actions: "updateContext"
    }
  },
  states: {
    closed: {
      tags: ["closed"],
      on: {
        TOGGLE: {
          target: "open",
          actions: ["computeSize", "invokeOnOpen"]
        },
        OPEN: {
          target: "open",
          actions: ["computeSize", "invokeOnOpen"]
        }
      }
    },
    closing: {
      tags: ["open"],
      activities: ["trackAnimationEvents"],
      on: {
        "ANIMATION.END": {
          target: "closed",
          actions: ["invokeOnClose"]
        }
      }
    },
    open: {
      tags: ["open"],
      on: {
        TOGGLE: {
          target: "closing"
        },
        CLOSE: {
          target: "closed",
          actions: ["invokeOnClose"]
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