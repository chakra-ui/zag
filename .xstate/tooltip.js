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
  initial: ctx.open ? "open" : "closed",
  activities: ["trackFocusVisible"],
  context: {
    "noVisibleTooltip && !hasPointerMoveOpened": false,
    "!hasPointerMoveOpened": false,
    "isOpenControlled": false,
    "isOpenControlled": false,
    "isOpenControlled": false,
    "isVisible": false,
    "isOpenControlled": false,
    "isInteractive": false,
    "isOpenControlled": false,
    "isOpenControlled": false,
    "isOpenControlled": false,
    "isInteractive": false
  },
  on: {
    UPDATE_CONTEXT: {
      actions: "updateContext"
    }
  },
  states: {
    closed: {
      tags: ["closed"],
      entry: ["clearGlobalId"],
      on: {
        "CONTROLLED.OPEN": "open",
        OPEN: {
          target: "open",
          actions: ["invokeOnOpen"]
        },
        POINTER_LEAVE: {
          actions: ["clearPointerMoveOpened"]
        },
        POINTER_MOVE: [{
          cond: "noVisibleTooltip && !hasPointerMoveOpened",
          target: "opening"
        }, {
          cond: "!hasPointerMoveOpened",
          target: "open",
          actions: ["setPointerMoveOpened", "invokeOnOpen"]
        }]
      }
    },
    opening: {
      tags: ["closed"],
      activities: ["trackScroll", "trackPointerlockChange"],
      after: {
        OPEN_DELAY: [{
          cond: "isOpenControlled",
          actions: ["setPointerMoveOpened", "invokeOnOpen"]
        }, {
          target: "open",
          actions: ["setPointerMoveOpened", "invokeOnOpen"]
        }]
      },
      on: {
        "CONTROLLED.OPEN": "open",
        "CONTROLLED.CLOSE": "closed",
        OPEN: [{
          cond: "isOpenControlled",
          actions: ["invokeOnOpen"]
        }, {
          target: "open",
          actions: ["invokeOnOpen"]
        }],
        POINTER_LEAVE: [{
          cond: "isOpenControlled",
          actions: ["clearPointerMoveOpened", "invokeOnClose"]
        }, {
          target: "closed",
          actions: ["clearPointerMoveOpened", "invokeOnClose"]
        }],
        CLOSE: {
          target: "closed",
          actions: ["invokeOnClose"]
        }
      }
    },
    open: {
      tags: ["open"],
      activities: ["trackEscapeKey", "trackScroll", "trackPointerlockChange", "trackPositioning"],
      entry: ["setGlobalId"],
      on: {
        "CONTROLLED.CLOSE": "closed",
        CLOSE: {
          target: "closed",
          actions: ["invokeOnClose"]
        },
        POINTER_LEAVE: [{
          cond: "isVisible",
          target: "closing",
          actions: ["clearPointerMoveOpened"]
        },
        // == group ==
        {
          cond: "isOpenControlled",
          actions: ["clearPointerMoveOpened", "invokeOnClose"]
        }, {
          target: "closed",
          actions: ["clearPointerMoveOpened", "invokeOnClose"]
        }],
        "CONTENT.POINTER_LEAVE": {
          cond: "isInteractive",
          target: "closing"
        },
        "POSITIONING.SET": {
          actions: "reposition"
        }
      }
    },
    closing: {
      tags: ["open"],
      activities: ["trackStore", "trackPositioning"],
      after: {
        CLOSE_DELAY: [{
          cond: "isOpenControlled",
          actions: ["invokeOnClose"]
        }, {
          target: "closed",
          actions: ["invokeOnClose"]
        }]
      },
      on: {
        "CONTROLLED.CLOSE": "closed",
        "CONTROLLED.OPEN": "open",
        CLOSE: [{
          cond: "isOpenControlled",
          actions: ["invokeOnClose"]
        }, {
          target: "closed",
          actions: ["invokeOnClose"]
        }],
        POINTER_MOVE: [{
          cond: "isOpenControlled",
          actions: ["setPointerMoveOpened", "invokeOnOpen"]
        }, {
          target: "open",
          actions: ["setPointerMoveOpened", "invokeOnOpen"]
        }],
        "CONTENT.POINTER_MOVE": {
          cond: "isInteractive",
          target: "open"
        },
        "POSITIONING.SET": {
          actions: "reposition"
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
    "isOpenControlled": ctx => ctx["isOpenControlled"],
    "isVisible": ctx => ctx["isVisible"],
    "isInteractive": ctx => ctx["isInteractive"]
  }
});