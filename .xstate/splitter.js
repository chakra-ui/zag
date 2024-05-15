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
  id: "splitter",
  initial: "idle",
  context: {
    "isHorizontal": false,
    "isHorizontal": false,
    "isVertical": false,
    "isVertical": false,
    "isStartPanelAtMax": false
  },
  on: {
    SET_PANEL_SIZE: {
      actions: "setPanelSize"
    }
  },
  on: {
    UPDATE_CONTEXT: {
      actions: "updateContext"
    }
  },
  states: {
    idle: {
      entry: ["clearActiveHandleId"],
      on: {
        POINTER_OVER: {
          target: "hover:temp",
          actions: ["setActiveHandleId"]
        },
        FOCUS: {
          target: "focused",
          actions: ["setActiveHandleId"]
        },
        DOUBLE_CLICK: {
          actions: ["resetStartPanel", "setPreviousPanels"]
        }
      }
    },
    "hover:temp": {
      after: {
        HOVER_DELAY: "hover"
      },
      on: {
        POINTER_DOWN: {
          target: "dragging",
          actions: ["setActiveHandleId"]
        },
        POINTER_LEAVE: "idle"
      }
    },
    hover: {
      tags: ["focus"],
      on: {
        POINTER_DOWN: "dragging",
        POINTER_LEAVE: "idle"
      }
    },
    focused: {
      tags: ["focus"],
      on: {
        BLUR: "idle",
        POINTER_DOWN: {
          target: "dragging",
          actions: ["setActiveHandleId"]
        },
        ARROW_LEFT: {
          cond: "isHorizontal",
          actions: ["shrinkStartPanel", "setPreviousPanels"]
        },
        ARROW_RIGHT: {
          cond: "isHorizontal",
          actions: ["expandStartPanel", "setPreviousPanels"]
        },
        ARROW_UP: {
          cond: "isVertical",
          actions: ["shrinkStartPanel", "setPreviousPanels"]
        },
        ARROW_DOWN: {
          cond: "isVertical",
          actions: ["expandStartPanel", "setPreviousPanels"]
        },
        ENTER: [{
          cond: "isStartPanelAtMax",
          actions: ["setStartPanelToMin", "setPreviousPanels"]
        }, {
          actions: ["setStartPanelToMax", "setPreviousPanels"]
        }],
        HOME: {
          actions: ["setStartPanelToMin", "setPreviousPanels"]
        },
        END: {
          actions: ["setStartPanelToMax", "setPreviousPanels"]
        }
      }
    },
    dragging: {
      tags: ["focus"],
      entry: "focusResizeHandle",
      activities: ["trackPointerMove"],
      on: {
        POINTER_MOVE: {
          actions: ["setPointerValue", "setGlobalCursor", "invokeOnResize"]
        },
        POINTER_UP: {
          target: "focused",
          actions: ["setPreviousPanels", "clearGlobalCursor", "blurResizeHandle", "invokeOnResizeEnd"]
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
  delays: {
    HOVER_DELAY: 250
  },
  guards: {
    "isHorizontal": ctx => ctx["isHorizontal"],
    "isVertical": ctx => ctx["isVertical"],
    "isStartPanelAtMax": ctx => ctx["isStartPanelAtMax"]
  }
});