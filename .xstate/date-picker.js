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
  context: {
    "isYearView": false,
    "isMonthView": false,
    "isYearView": false,
    "isMonthView": false
  },
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
    "FOCUS.SET": {
      actions: ["setFocusedDate"]
    },
    "VALUE.CLEAR": {
      actions: ["clearSelectedDate", "clearFocusedDate"]
    },
    "GOTO.NEXT": [{
      cond: "isYearView",
      actions: ["focusNextDecade"]
    }, {
      cond: "isMonthView",
      actions: ["focusNextYear"]
    }, {
      actions: ["focusNextPage"]
    }],
    "GOTO.PREV": [{
      cond: "isYearView",
      actions: ["focusPreviousDecade"]
    }, {
      cond: "isMonthView",
      actions: ["focusPreviousYear"]
    }, {
      actions: ["focusPreviousPage"]
    }]
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
          actions: ["setViewToDay", "focusSelectedDate"]
        },
        "INPUT.CHANGE": {
          actions: ["focusTypedDate"]
        },
        "INPUT.ENTER": {
          actions: ["selectFocusedDate"]
        }
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
        "GRID.HOME": {
          actions: ["focusSectionStart"]
        },
        "GRID.END": {
          actions: ["focusSectionEnd"]
        },
        "TRIGGER.CLICK": {
          target: "focused"
        }
      }
    },
    "open:range": {}
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
    "isYearView": ctx => ctx["isYearView"],
    "isMonthView": ctx => ctx["isMonthView"]
  }
});