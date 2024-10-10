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
  context: {
    "isItemOpen": false,
    "isOpen": false
  },
  initial: "closed",
  entry: ["checkViewportNode"],
  exit: ["cleanupObservers"],
  on: {
    TRIGGER_CLICK: [{
      cond: "isItemOpen",
      actions: ["clearValue", "setClickCloseRef"]
    }, {
      target: "open",
      actions: ["setValue", "setClickCloseRef"]
    }],
    TRIGGER_FOCUS: {
      actions: ["focusTopLevelEl"]
    }
  },
  on: {
    UPDATE_CONTEXT: {
      actions: "updateContext"
    }
  },
  states: {
    closed: {
      entry: ["cleanupObservers"],
      on: {
        TRIGGER_ENTER: {
          actions: ["clearRefs"]
        },
        TRIGGER_MOVE: {
          target: "opening",
          actions: ["clearPointerMoveRef"]
        }
      }
    },
    opening: {
      after: {
        OPEN_DELAY: {
          target: "open",
          actions: ["setValue"]
        }
      },
      on: {
        TRIGGER_LEAVE: {
          target: "closed",
          actions: ["clearValue"]
        },
        CONTENT_FOCUS: {
          actions: ["focusContent"]
        },
        LINK_FOCUS: {
          actions: ["focusLinkEl"]
        }
      }
    },
    open: {
      tags: ["open"],
      on: {
        CONTENT_LEAVE: {
          target: "closing"
        },
        TRIGGER_LEAVE: {
          target: "closing"
        },
        CONTENT_FOCUS: {
          actions: ["focusContent"]
        },
        LINK_FOCUS: {
          actions: ["focusLinkEl"]
        },
        CONTENT_DISMISS: {
          target: "closed",
          actions: ["focusTriggerIfNeeded", "clearValue"]
        }
      }
    },
    closing: {
      tags: ["open"],
      after: {
        CLOSE_DELAY: {
          target: "closed",
          actions: ["clearValue"]
        }
      },
      on: {
        CONTENT_ENTER: {
          target: "open"
        },
        TRIGGER_ENTER: {
          actions: ["clearRefs"]
        },
        TRIGGER_MOVE: [{
          cond: "isOpen",
          target: "open",
          actions: ["setValue", "clearPointerMoveRef"]
        }, {
          target: "opening",
          actions: ["clearPointerMoveRef"]
        }]
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
    "isItemOpen": ctx => ctx["isItemOpen"],
    "isOpen": ctx => ctx["isOpen"]
  }
});