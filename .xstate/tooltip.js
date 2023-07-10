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
  id: "tooltip",
  initial: "closed",
  context: {
    "noVisibleTooltip && !hasPointerMoveOpened": false,
    "!hasPointerMoveOpened": false,
    "closeOnPointerDown": false,
    "isVisible": false,
    "isInteractive": false,
    "closeOnPointerDown": false,
    "isInteractive": false
  },
  on: {
    OPEN: "open",
    CLOSE: "closed"
  },
  on: {
    UPDATE_CONTEXT: {
      actions: "updateContext"
    }
  },
  states: {
    closed: {
      tags: ["closed"],
      entry: ["clearGlobalId", "invokeOnClose"],
      on: {
        FOCUS: "open",
        POINTER_LEAVE: {
          actions: ["clearPointerMoveOpened"]
        },
        POINTER_MOVE: [{
          cond: "noVisibleTooltip && !hasPointerMoveOpened",
          target: "opening"
        }, {
          cond: "!hasPointerMoveOpened",
          target: "open",
          actions: ["setPointerMoveOpened"]
        }]
      }
    },
    opening: {
      tags: ["closed"],
      activities: ["trackScroll", "trackPointerlockChange"],
      after: {
        OPEN_DELAY: {
          target: "open",
          actions: ["setPointerMoveOpened"]
        }
      },
      on: {
        POINTER_LEAVE: {
          target: "closed",
          actions: ["clearPointerMoveOpened"]
        },
        BLUR: "closed",
        SCROLL: "closed",
        POINTER_LOCK_CHANGE: "closed",
        POINTER_DOWN: {
          cond: "closeOnPointerDown",
          target: "closed"
        }
      }
    },
    open: {
      tags: ["open"],
      activities: ["trackEscapeKey", "trackDisabledTriggerOnSafari", "trackScroll", "trackPointerlockChange", "trackPositioning"],
      entry: ["setGlobalId", "invokeOnOpen"],
      on: {
        POINTER_LEAVE: [{
          cond: "isVisible",
          target: "closing",
          actions: ["clearPointerMoveOpened"]
        }, {
          target: "closed",
          actions: ["clearPointerMoveOpened"]
        }],
        BLUR: "closed",
        ESCAPE: "closed",
        SCROLL: "closed",
        POINTER_LOCK_CHANGE: "closed",
        "CONTENT.POINTER_LEAVE": {
          cond: "isInteractive",
          target: "closing"
        },
        POINTER_DOWN: {
          cond: "closeOnPointerDown",
          target: "closed"
        },
        CLICK: "closed",
        SET_POSITIONING: {
          actions: "setPositioning"
        }
      }
    },
    closing: {
      tags: ["open"],
      activities: ["trackStore", "trackPositioning"],
      after: {
        CLOSE_DELAY: "closed"
      },
      on: {
        FORCE_CLOSE: "closed",
        POINTER_MOVE: {
          target: "open",
          actions: ["setPointerMoveOpened"]
        },
        "CONTENT.POINTER_MOVE": {
          cond: "isInteractive",
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
  delays: {
    OPEN_DELAY: 1000,
    CLOSE_DELAY: 500
  },
  guards: {
    "noVisibleTooltip && !hasPointerMoveOpened": ctx => ctx["noVisibleTooltip && !hasPointerMoveOpened"],
    "!hasPointerMoveOpened": ctx => ctx["!hasPointerMoveOpened"],
    "closeOnPointerDown": ctx => ctx["closeOnPointerDown"],
    "isVisible": ctx => ctx["isVisible"],
    "isInteractive": ctx => ctx["isInteractive"]
  }
});