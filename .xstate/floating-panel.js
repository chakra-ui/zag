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
          target: "open",
          actions: ["invokeOnOpen", "setPositionStyle", "setSizeStyle"]
        }
      }
    },
    open: {
      tags: ["open"],
      on: {
        DRAG_START: {
          target: "open.dragging",
          actions: ["setPrevPosition"]
        },
        RESIZE_START: {
          target: "open.resizing",
          actions: ["setPrevSize"]
        },
        CLOSE: {
          target: "closed"
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
          target: "closed"
        }
      }
    },
    "open.resizing": {
      tags: ["open"],
      activities: ["trackPointerMove"],
      exit: ["clearLastSize"],
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
          actions: ["invokeOnClose"]
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