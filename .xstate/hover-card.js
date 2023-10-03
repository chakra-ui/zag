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
  initial: ctx.open ? "open" : "closed",
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
      entry: ["clearIsPointer"],
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
        OPEN_DELAY: {
          target: "open",
          actions: ["invokeOnOpen"]
        }
      },
      on: {
        POINTER_LEAVE: {
          target: "closed",
          actions: ["invokeOnClose"]
        },
        TRIGGER_BLUR: {
          cond: "!isPointer",
          target: "closed",
          actions: ["invokeOnClose"]
        },
        CLOSE: {
          target: "closed",
          actions: ["invokeOnClose"]
        }
      }
    },
    open: {
      tags: ["open"],
      activities: ["trackDismissableElement", "trackPositioning"],
      on: {
        POINTER_ENTER: {
          actions: ["setIsPointer"]
        },
        POINTER_LEAVE: "closing",
        DISMISS: {
          target: "closed",
          actions: ["invokeOnClose"]
        },
        CLOSE: {
          target: "closed",
          actions: ["invokeOnClose"]
        },
        TRIGGER_BLUR: {
          cond: "!isPointer",
          target: "closed",
          actions: ["invokeOnClose"]
        },
        SET_POSITIONING: {
          actions: "reposition"
        }
      }
    },
    closing: {
      tags: ["open"],
      activities: ["trackPositioning"],
      after: {
        CLOSE_DELAY: {
          target: "closed",
          actions: ["invokeOnClose"]
        }
      },
      on: {
        POINTER_ENTER: {
          target: "open",
          // no need to invokeOnOpen here because it's still open (but about to close)
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