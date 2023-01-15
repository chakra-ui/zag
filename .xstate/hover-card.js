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
  id: "hover-card",
  initial: "unknown",
  context: {
    "isDefaultOpen": false,
    "!isPointer": false,
    "!isPointer": false
  },
  on: {
    UPDATE_CONTEXT: {
      actions: "updateContext"
    }
  },
  states: {
    unknown: {
      on: {
        SETUP: [{
          target: "open",
          cond: "isDefaultOpen"
        }, {
          target: "closed"
        }]
      }
    },
    closed: {
      tags: ["closed"],
      entry: ["invokeOnClose", "clearIsPointer"],
      on: {
        POINTER_ENTER: {
          actions: ["setIsPointer"],
          target: "opening"
        },
        TRIGGER_FOCUS: "opening",
        OPEN: "opening"
      }
    },
    opening: {
      tags: ["closed"],
      after: {
        OPEN_DELAY: "open"
      },
      on: {
        POINTER_LEAVE: "closed",
        TRIGGER_BLUR: {
          cond: "!isPointer",
          target: "closed"
        },
        CLOSE: "closed"
      }
    },
    open: {
      tags: ["open"],
      activities: ["trackDismissableElement", "computePlacement"],
      entry: ["invokeOnOpen"],
      on: {
        POINTER_ENTER: {
          actions: ["setIsPointer"]
        },
        POINTER_LEAVE: "closing",
        DISMISS: "closed",
        CLOSE: "closed",
        TRIGGER_BLUR: {
          cond: "!isPointer",
          target: "closed"
        }
      }
    },
    closing: {
      tags: ["open"],
      activities: ["computePlacement"],
      after: {
        CLOSE_DELAY: "closed"
      },
      on: {
        POINTER_ENTER: {
          actions: ["setIsPointer"],
          target: "open"
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
  guards: {
    "isDefaultOpen": ctx => ctx["isDefaultOpen"],
    "!isPointer": ctx => ctx["!isPointer"]
  }
});