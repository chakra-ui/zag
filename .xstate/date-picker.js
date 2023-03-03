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
  initial: "open",
  context: {
    "isYearView": false,
    "isMonthView": false,
    "isYearView": false,
    "isMonthView": false,
    "isMonthView": false,
    "isYearView": false,
    "isDayView": false,
    "isMonthView": false,
    "isYearView": false,
    "isMonthView": false,
    "isYearView": false,
    "isMonthView": false,
    "isYearView": false,
    "isMonthView": false,
    "isYearView": false,
    "isMonthView": false,
    "isYearView": false,
    "isDayView": false,
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
      tags: "closed",
      on: {
        "INPUT.FOCUS": {
          target: "focused"
        },
        "TRIGGER.CLICK": {
          target: "open",
          actions: ["setViewToDay", "focusSelectedDate"]
        }
      }
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
        "CELL.CLICK": [{
          cond: "isMonthView",
          actions: ["setFocusedMonth", "setViewToDay"]
        }, {
          cond: "isYearView",
          actions: ["setFocusedYear", "setViewToMonth"]
        }, {
          actions: ["setFocusedDate", "setSelectedDate"]
        }],
        "CELL.FOCUS": {
          cond: "isDayView",
          actions: ["setFocusedDate"]
        },
        "GRID.ENTER": [{
          cond: "isMonthView",
          actions: "setViewToDay"
        }, {
          cond: "isYearView",
          actions: "setViewToMonth"
        }, {
          actions: "selectFocusedDate"
        }],
        "GRID.ARROW_RIGHT": [{
          cond: "isMonthView",
          actions: "focusNextMonth"
        }, {
          cond: "isYearView",
          actions: "focusNextYear"
        }, {
          actions: "focusNextDay"
        }],
        "GRID.ARROW_LEFT": [{
          cond: "isMonthView",
          actions: "focusPreviousMonth"
        }, {
          cond: "isYearView",
          actions: "focusPreviousYear"
        }, {
          actions: ["focusPreviousDay"]
        }],
        "GRID.ARROW_UP": [{
          cond: "isMonthView",
          actions: "focusPreviousMonthColumn"
        }, {
          cond: "isYearView",
          actions: "focusPreviousYearColumn"
        }, {
          actions: ["focusPreviousWeek"]
        }],
        "GRID.ARROW_DOWN": [{
          cond: "isMonthView",
          actions: "focusNextMonthColumn"
        }, {
          cond: "isYearView",
          actions: "focusNextYearColumn"
        }, {
          actions: ["focusNextWeek"]
        }],
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
        },
        "VIEW.CHANGE": [{
          cond: "isDayView",
          actions: ["setViewToMonth", "invokeOnViewChange"]
        }, {
          cond: "isMonthView",
          actions: ["setViewToYear", "invokeOnViewChange"]
        }]
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
    "isYearView": ctx => ctx["isYearView"],
    "isMonthView": ctx => ctx["isMonthView"],
    "isDayView": ctx => ctx["isDayView"]
  }
});