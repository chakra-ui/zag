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
  id: "fileupload",
  initial: "idle",
  context: {
    "isOutOfMaxFilesRange": false
  },
  on: {
    "INPUT.CHANGE": {
      actions: ["setFilesFromEvent", "invokeOnChange"]
    },
    "TARGET.SET": {
      actions: ["addDragTarget"]
    },
    "VALUE.SET": {
      actions: ["setValue", "invokeOnChange"]
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
        OPEN: "open",
        "ROOT.CLICK": "open",
        "ROOT.DRAG_OVER": [{
          cond: "isOutOfMaxFilesRange",
          target: "dragging",
          actions: ["setOverflowValidation", "setInvalid"]
        }, {
          target: "dragging"
        }]
      }
    },
    focused: {
      on: {
        OPEN: "open",
        "ROOT.ENTER": "open",
        "ROOT.BLUR": "idle"
      }
    },
    dragging: {
      on: {
        "ROOT.DROP": {
          target: "idle",
          actions: ["clearInvalid", "clearValidation", "setFilesFromEvent", "invokeOnChange"]
        },
        "ROOT.DRAG_LEAVE": {
          target: "idle",
          actions: ["clearInvalid", "clearValidation"]
        }
      }
    },
    open: {
      activities: ["trackWindowFocus"],
      entry: ["openFilePicker"],
      on: {
        CLOSE: "focused"
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
    "isOutOfMaxFilesRange": ctx => ctx["isOutOfMaxFilesRange"]
  }
});