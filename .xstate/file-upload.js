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
    "!isWithinRange": false
  },
  on: {
    "FILES.SET": {
      actions: ["setFilesFromEvent", "invokeOnChange"]
    },
    "FILE.DELETE": {
      actions: ["removeFile", "invokeOnChange"]
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
        "ROOT.FOCUS": "focused",
        "ROOT.DRAG_OVER": [{
          cond: "!isWithinRange",
          target: "dragging",
          actions: ["setInvalid"]
        }, {
          target: "dragging"
        }]
      }
    },
    focused: {
      on: {
        OPEN: "open",
        "ROOT.CLICK": "open",
        "ROOT.ENTER": "open",
        "ROOT.BLUR": "idle"
      }
    },
    dragging: {
      on: {
        "ROOT.DROP": {
          target: "idle",
          actions: ["clearInvalid", "setFilesFromEvent", "invokeOnChange"]
        },
        "ROOT.DRAG_LEAVE": {
          target: "idle",
          actions: ["clearInvalid"]
        }
      }
    },
    open: {
      activities: ["trackWindowFocus"],
      entry: ["openFilePicker"],
      on: {
        CLOSE: "idle"
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
    "!isWithinRange": ctx => ctx["!isWithinRange"]
  }
});