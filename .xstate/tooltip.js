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
    "noVisibleTooltip": false,
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
        POINTER_ENTER: [{
          cond: "noVisibleTooltip",
          target: "opening"
        }, {
          target: "open"
        }]
      }
    },
    opening: {
      tags: ["closed"],
      activities: ["trackScroll", "trackPointerlockChange"],
      after: {
        OPEN_DELAY: "open"
      },
      on: {
        POINTER_LEAVE: "closed",
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
      activities: ["trackEscapeKey", "trackDisabledTriggerOnSafari", "trackScroll", "trackPointerlockChange", "computePlacement"],
      entry: ["setGlobalId", "invokeOnOpen"],
      on: {
        POINTER_LEAVE: [{
          cond: "isVisible",
          target: "closing"
        }, {
          target: "closed"
        }],
        BLUR: "closed",
        ESCAPE: "closed",
        SCROLL: "closed",
        POINTER_LOCK_CHANGE: "closed",
        TOOLTIP_POINTER_LEAVE: {
          cond: "isInteractive",
          target: "closing"
        },
        POINTER_DOWN: {
          cond: "closeOnPointerDown",
          target: "closed"
        },
        CLICK: "closed"
      }
    },
    closing: {
      tags: ["open"],
      activities: ["trackStore", "computePlacement"],
      after: {
        CLOSE_DELAY: "closed"
      },
      on: {
        FORCE_CLOSE: "closed",
        POINTER_ENTER: "open",
        TOOLTIP_POINTER_ENTER: {
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
    "noVisibleTooltip": ctx => ctx["noVisibleTooltip"],
    "closeOnPointerDown": ctx => ctx["closeOnPointerDown"],
    "isVisible": ctx => ctx["isVisible"],
    "isInteractive": ctx => ctx["isInteractive"]
  }
});