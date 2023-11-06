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
  on: {
    "CONTEXT.SET": {
      actions: ["setContext"]
    }
  },
  on: {
    UPDATE_CONTEXT: {
      actions: "updateContext"
    }
  },
  states: {
    closed: {
      tags: ["hidden"],
      on: {
        TOGGLE: {
          target: "opening",
          actions: ["invokeOnOpening"]
        },
        OPEN: {
          target: "opening",
          actions: ["invokeOnOpening"]
        }
      }
    },
    opening: {
      after: {
        ANIMATION_DELAY: {
          target: "open",
          actions: ["invokeOnOpen"]
        }
      }
    },
    open: {
      on: {
        TOGGLE: {
          target: "closing",
          actions: ["invokeOnClosing"]
        },
        CLOSE: {
          target: "closing",
          actions: ["invokeOnClosing"]
        }
      }
    },
    closing: {
      after: {
        ANIMATION_DELAY: {
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