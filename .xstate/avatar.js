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
  id: "avatar",
  initial: "loading",
  activities: ["trackImageRemoval"],
  context: {},
  on: {
    "SRC.CHANGE": {
      target: "loading"
    },
    "IMG.UNMOUNT": {
      target: "error"
    }
  },
  on: {
    UPDATE_CONTEXT: {
      actions: "updateContext"
    }
  },
  states: {
    loading: {
      activities: ["trackSrcChange"],
      entry: ["checkImgStatus"],
      on: {
        "IMG.LOADED": {
          target: "loaded",
          actions: ["invokeOnLoad"]
        },
        "IMG.ERROR": {
          target: "error",
          actions: ["invokeOnError"]
        }
      }
    },
    error: {
      activities: ["trackSrcChange"],
      on: {
        "IMG.LOADED": {
          target: "loaded",
          actions: ["invokeOnLoad"]
        }
      }
    },
    loaded: {
      activities: ["trackSrcChange"]
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