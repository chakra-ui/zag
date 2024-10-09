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
  id: "navigation-menu",
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
        "trigger.enter": {
          target: "opening"
        }
      }
    },
    opening: {
      after: {
        OPEN_DELAY: {
          target: "open",
          actions: ["setValue"]
        }
      }
    },
    closing: {
      tags: ["open"],
      activities: ["trackViewportRect", "trackActiveTriggerRect"],
      on: {
        "content.enter": {
          target: "open"
        }
      }
    },
    open: {
      tags: ["open"],
      activities: ["trackViewportRect", "trackActiveTriggerRect"],
      on: {
        "content.leave": {
          target: "closing"
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