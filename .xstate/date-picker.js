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
  id: "date-picker",
  initial: "focused",
  context: {},
  activities: ["setupAnnouncer"],
  on: {
    POINTER_DOWN: {
      actions: ["disableTextSelection"]
    },
    POINTER_UP: {
      actions: ["enableTextSelection"]
    },
    SET_VALUE: {
      actions: ["setSelectedDate"]
    }
  },
  on: {
    UPDATE_CONTEXT: {
      actions: "updateContext"
    }
  },
  states: {
    idle: {
      tags: "closed"
    },
    focused: {
      tags: "closed",
      on: {
        FOCUS_SEGMENT: {
          actions: ["setFocusedSegment"]
        },
        ARROW_UP: {
          actions: ["incrementFocusedSegment"]
        },
        ARROW_DOWN: {
          actions: ["decrementFocusedSegment"]
        },
        ARROW_RIGHT: {
          actions: ["focusNextSegment"]
        },
        ARROW_LEFT: {
          actions: ["focusPreviousSegment"]
        }
      }
    },
    "open:month": {
      tags: "open",
      on: {
        FOCUS_CELL: {
          actions: ["setFocusedDate"]
        },
        ENTER: {
          actions: ["selectFocusedDate"]
        },
        CLICK_CELL: {
          actions: ["setFocusedDate", "setSelectedDate"]
        },
        ARROW_RIGHT: {
          actions: ["focusNextDay"]
        },
        ARROW_LEFT: {
          actions: ["focusPreviousDay"]
        },
        ARROW_UP: {
          actions: ["focusPreviousWeek"]
        },
        ARROW_DOWN: {
          actions: ["focusNextWeek"]
        },
        PAGE_UP: {
          actions: ["focusPreviousSection"]
        },
        PAGE_DOWN: {
          actions: ["focusNextSection"]
        },
        CLICK_PREV: {
          actions: ["focusPreviousPage"]
        },
        CLICK_NEXT: {
          actions: ["focusNextPage"]
        }
      }
    },
    "open:year": {
      tags: "open"
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