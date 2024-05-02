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
  id: "floating-panel",
  initial: ctx.open ? "open" : "closed",
  context: {
    "!isMaximized": false,
    "!isMinimized": false,
    "closeOnEsc": false
  },
  activities: ["trackPanelStack"],
  on: {
    WINDOW_FOCUS: {
      actions: ["bringToFrontOfPanelStack"]
    }
  },
  on: {
    UPDATE_CONTEXT: {
      actions: "updateContext"
    }
  },
  states: {
    closed: {
      tags: ["closed"],
      on: {
        OPEN: {
          target: "open",
          actions: ["invokeOnOpen", "setAnchorPosition", "setPositionStyle", "setSizeStyle"]
        }
      }
    },
    open: {
      tags: ["open"],
      entry: ["bringToFrontOfPanelStack"],
      activities: ["trackBoundaryRect"],
      on: {
        DRAG_START: {
          cond: "!isMaximized",
          target: "open.dragging",
          actions: ["setPrevPosition"]
        },
        RESIZE_START: {
          cond: "!isMinimized",
          target: "open.resizing",
          actions: ["setPrevSize"]
        },
        CLOSE: {
          target: "closed",
          actions: ["invokeOnClose", "resetRect"]
        },
        ESCAPE: {
          cond: "closeOnEsc",
          target: "closed",
          actions: ["invokeOnClose", "resetRect"]
        },
        MINIMIZE: {
          actions: ["setMinimized", "invokeOnMinimize"]
        },
        MAXIMIZE: {
          actions: ["setMaximized", "invokeOnMaximize"]
        },
        RESTORE: {
          actions: ["setRestored"]
        },
        MOVE: {
          actions: ["setPositionFromKeybord"]
        }
      }
    },
    "open.dragging": {
      tags: ["open"],
      activities: ["trackPointerMove"],
      exit: ["clearPrevPosition"],
      on: {
        DRAG: {
          actions: ["setPosition"]
        },
        DRAG_END: {
          target: "open",
          actions: ["invokeOnDragEnd"]
        },
        CLOSE: {
          target: "closed",
          actions: ["invokeOnClose", "resetRect"]
        },
        ESCAPE: {
          target: "open"
        }
      }
    },
    "open.resizing": {
      tags: ["open"],
      activities: ["trackPointerMove"],
      exit: ["clearPrevSize"],
      on: {
        DRAG: {
          actions: ["setSize"]
        },
        DRAG_END: {
          target: "open",
          actions: ["invokeOnResizeEnd"]
        },
        CLOSE: {
          target: "closed",
          actions: ["invokeOnClose", "resetRect"]
        },
        ESCAPE: {
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
    "!isMaximized": ctx => ctx["!isMaximized"],
    "!isMinimized": ctx => ctx["!isMinimized"],
    "closeOnEsc": ctx => ctx["closeOnEsc"]
  }
});