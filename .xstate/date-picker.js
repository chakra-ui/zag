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
  id: "datepicker",
  initial: "focused",
  context: {},
  activities: ["setupLiveRegion"],
  on: {
    "GRID.POINTER_DOWN": {
      actions: ["disableTextSelection"]
    },
    "GRID.POINTER_UP": {
      actions: ["enableTextSelection"]
    },
    "VALUE.SET": {
      actions: ["setSelectedDate", "setFocusedDate"]
    },
    "GOTO.NEXT": {
      actions: ["focusPreviousPage"]
    },
    "GOTO.PREV": {
      actions: ["focusNextPage"]
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
        "TRIGGER.CLICK": {
          target: "open",
          actions: ["setViewToDate", "focusSelectedDateIfNeeded"]
        },
        "FIELD.TYPE": {}
      }
    },
    open: {
      tags: "open",
      on: {
        "CELL.FOCUS": {
          actions: ["setFocusedDate"]
        },
        "GRID.ENTER": {
          actions: ["selectFocusedDate"]
        },
        "CELL.CLICK": {
          actions: ["setFocusedDate", "setSelectedDate"]
        },
        "GRID.ARROW_RIGHT": {
          actions: ["focusNextDay"]
        },
        "GRID.ARROW_LEFT": {
          actions: ["focusPreviousDay"]
        },
        "GRID.ARROW_UP": {
          actions: ["focusPreviousWeek"]
        },
        "GRID.ARROW_DOWN": {
          actions: ["focusNextWeek"]
        },
        "GRID.PAGE_UP": {
          actions: ["focusPreviousSection"]
        },
        "GRID.PAGE_DOWN": {
          actions: ["focusNextSection"]
        },
        "TRIGGER.CLICK": {
          target: "focused"
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