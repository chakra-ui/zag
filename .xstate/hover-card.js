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
  initial: ctx.defaultOpen ? "open" : "closed",
  context: {
    "!isPointer": false,
    "!isPointer": false
  },
  on: {
    UPDATE_CONTEXT: {
      actions: "updateContext"
    }
  },
  states: {
    closed: {
      tags: ["closed"],
      entry: ["invokeOnClose", "clearIsPointer"],
      on: {
        POINTER_ENTER: {
          target: "opening",
          actions: ["setIsPointer"]
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
      activities: ["trackDismissableElement", "trackPositioning"],
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
        },
        SET_POSITIONING: {
          actions: "setPositioning"
        }
      }
    },
    closing: {
      tags: ["open"],
      activities: ["trackPositioning"],
      after: {
        CLOSE_DELAY: "closed"
      },
      on: {
        POINTER_ENTER: {
          target: "open",
          actions: ["setIsPointer"]
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
    "!isPointer": ctx => ctx["!isPointer"]
  }
});