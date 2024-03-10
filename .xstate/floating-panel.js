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
  context: {},
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
          target: "open"
        }
      }
    },
    open: {
      tags: ["open"],
      activities: ["trackBoundaryRect"],
      on: {
        DRAG_START: {
          target: "open.dragging"
        },
        RESIZE_START: {
          target: "open.resizing"
        },
        CLOSE: {
          target: "closed"
        }
      }
    },
    "open.dragging": {
      tags: ["open"],
      activities: ["trackBoundaryRect", "trackPointerMove", "trackDockRects"],
      exit: ["resetDragDiff"],
      on: {
        DRAG: {},
        DRAG_END: {},
        CLOSE: {
          target: "closed"
        }
      }
    },
    "open.resizing": {
      tags: ["open"],
      activities: ["trackBoundaryRect", "trackPointerMove"],
      exit: ["resetResizeDiff"],
      on: {
        RESIZE: {},
        RESIZE_END: {},
        CLOSE: {
          target: "closed"
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
  guards: {}
});