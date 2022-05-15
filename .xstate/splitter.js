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
  initial: "unknown",
  context: {
    "isCollapsed": false,
    "!isFixed": false,
    "isHorizontal": false,
    "isHorizontal": false,
    "isVertical": false,
    "isVertical": false,
    "isCollapsed": false,
    "isCollapsed": false
  },
  on: {
    COLLAPSE: {
      actions: "setToMin"
    },
    EXPAND: {
      actions: "setToMax"
    },
    TOGGLE: [{
      cond: "isCollapsed",
      actions: "setToMax"
    }, {
      actions: "setToMin"
    }],
    UPDATE_CONTEXT: {
      actions: "updateContext"
    }
  },
  states: {
    unknown: {
      on: {
        SETUP: {
          target: "idle",
          actions: "setupDocument"
        }
      }
    },
    idle: {
      on: {
        POINTER_OVER: {
          cond: "!isFixed",
          target: "hover:temp"
        },
        POINTER_LEAVE: "idle",
        FOCUS: "focused"
      }
    },
    "hover:temp": {
      after: {
        HOVER_DELAY: "hover"
      },
      on: {
        POINTER_DOWN: {
          target: "dragging",
          actions: ["invokeOnChangeStart"]
        },
        POINTER_LEAVE: "idle"
      }
    },
    hover: {
      tags: ["focus"],
      on: {
        POINTER_DOWN: {
          target: "dragging",
          actions: ["invokeOnChangeStart"]
        },
        POINTER_LEAVE: "idle"
      }
    },
    focused: {
      tags: ["focus"],
      on: {
        BLUR: "idle",
        POINTER_DOWN: {
          target: "dragging",
          actions: ["invokeOnChangeStart"]
        },
        ARROW_LEFT: {
          cond: "isHorizontal",
          actions: "decrement"
        },
        ARROW_RIGHT: {
          cond: "isHorizontal",
          actions: "increment"
        },
        ARROW_UP: {
          cond: "isVertical",
          actions: "increment"
        },
        ARROW_DOWN: {
          cond: "isVertical",
          actions: "decrement"
        },
        ENTER: [{
          cond: "isCollapsed",
          actions: "setToMin"
        }, {
          actions: "setToMin"
        }],
        HOME: {
          actions: "setToMin"
        },
        END: {
          actions: "setToMax"
        },
        DOUBLE_CLICK: [{
          cond: "isCollapsed",
          actions: "setToMax"
        }, {
          actions: "setToMin"
        }]
      }
    },
    dragging: {
      tags: ["focus"],
      entry: "focusSplitter",
      activities: "trackPointerMove",
      on: {
        POINTER_UP: {
          target: "focused",
          actions: ["invokeOnChangeEnd"]
        },
        POINTER_MOVE: {
          actions: "setPointerValue"
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
    "isCollapsed": ctx => ctx["isCollapsed"],
    "!isFixed": ctx => ctx["!isFixed"],
    "isHorizontal": ctx => ctx["isHorizontal"],
    "isVertical": ctx => ctx["isVertical"]
  }
});