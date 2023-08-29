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
  id: "filePicker",
  initial: "idle",
  context: {
    "!isWithinRange": false
  },
  on: {
    "FILES.SET": {
      actions: ["setFilesFromEvent"]
    },
    "FILE.DELETE": {
      actions: ["removeFile"]
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
        "DROPZONE.CLICK": "open",
        "DROPZONE.FOCUS": "focused",
        "DROPZONE.DRAG_OVER": [{
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
        "DROPZONE.CLICK": "open",
        "DROPZONE.ENTER": "open",
        "DROPZONE.BLUR": "idle"
      }
    },
    dragging: {
      on: {
        "DROPZONE.DROP": {
          target: "idle",
          actions: ["clearInvalid", "setFilesFromEvent"]
        },
        "DROPZONE.DRAG_LEAVE": {
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