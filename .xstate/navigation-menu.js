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
    "isItemOpen && isRootMenu": false,
    "isSubmenu": false,
    "isSubmenu": false,
    "isOpen": false
  },
  initial: "closed",
  entry: ["checkViewportNode"],
  exit: ["cleanupObservers"],
  on: {
    SET_PARENT: {
      target: "open",
      actions: ["setParentMenu", "setActiveTriggerNode", "syncTriggerRectObserver"]
    },
    SET_CHILD: {
      actions: ["setChildMenu"]
    },
    TRIGGER_CLICK: [{
      cond: "isItemOpen && isRootMenu",
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
      entry: ["cleanupObservers", "propagateClose"],
      on: {
        TRIGGER_ENTER: {
          actions: ["clearCloseRefs"]
        },
        TRIGGER_MOVE: [{
          cond: "isSubmenu",
          target: "open",
          actions: ["setValue"]
        }, {
          target: "opening",
          actions: ["setPointerMoveRef"]
        }]
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
          actions: ["clearValue", "clearPointerMoveRef"]
        },
        CONTENT_FOCUS: {
          actions: ["focusContent", "restoreTabOrder"]
        },
        LINK_FOCUS: {
          actions: ["focusLink"]
        }
      }
    },
    open: {
      tags: ["open"],
      activities: ["trackEscapeKey", "trackInteractionOutside", "preserveTabOrder"],
      on: {
        CONTENT_LEAVE: {
          target: "closing"
        },
        TRIGGER_LEAVE: {
          target: "closing",
          actions: ["clearPointerMoveRef"]
        },
        CONTENT_FOCUS: {
          actions: ["focusContent", "restoreTabOrder"]
        },
        LINK_FOCUS: {
          actions: ["focusLink"]
        },
        CONTENT_DISMISS: {
          target: "closed",
          actions: ["focusTriggerIfNeeded", "clearValue", "clearPointerMoveRef"]
        },
        CONTENT_ENTER: {
          actions: ["restoreTabOrder"]
        },
        TRIGGER_MOVE: {
          cond: "isSubmenu",
          actions: ["setValue"]
        },
        ROOT_CLOSE: {
          // clear the previous value so indicator doesn't animate
          actions: ["clearPreviousValue", "cleanupObservers"]
        }
      }
    },
    closing: {
      tags: ["open"],
      activities: ["trackInteractionOutside"],
      after: {
        CLOSE_DELAY: {
          target: "closed",
          actions: ["clearValue"]
        }
      },
      on: {
        CONTENT_DISMISS: {
          target: "closed",
          actions: ["focusTriggerIfNeeded", "clearValue", "clearPointerMoveRef"]
        },
        CONTENT_ENTER: {
          target: "open",
          actions: ["restoreTabOrder"]
        },
        TRIGGER_ENTER: {
          actions: ["clearCloseRefs"]
        },
        TRIGGER_MOVE: [{
          cond: "isOpen",
          target: "open",
          actions: ["setValue", "setPointerMoveRef"]
        }, {
          target: "opening",
          actions: ["setPointerMoveRef"]
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
    "isItemOpen && isRootMenu": ctx => ctx["isItemOpen && isRootMenu"],
    "isSubmenu": ctx => ctx["isSubmenu"],
    "isOpen": ctx => ctx["isOpen"]
  }
});