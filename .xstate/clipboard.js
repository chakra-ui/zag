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
  id: "clipboard",
  initial: "idle",
  context: {},
  on: {
    "VALUE.SET": {
      actions: ["setValue"]
    }
  },
  on: {
    UPDATE_CONTEXT: {
      actions: "updateContext"
    }
  },
  states: {
    idle: {
      on: {
        COPY: {
          target: "copied",
          actions: ["copyToClipboard"]
        }
      }
    },
    copied: {
      after: {
        COPY_TIMEOUT: "idle"
      },
      on: {
        COPY: {
          target: "copied",
          actions: ["copyToClipboard"]
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