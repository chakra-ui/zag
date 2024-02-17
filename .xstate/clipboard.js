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
    },
    COPY: {
      target: "copied",
      actions: ["copyToClipboard", "invokeOnCopied"]
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
        "INPUT.COPY": {
          target: "copied",
          actions: ["invokeOnCopied"]
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
          actions: ["copyToClipboard", "invokeOnCopied"]
        },
        "INPUT.COPY": {
          actions: ["invokeOnCopied"]
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