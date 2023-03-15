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
  initial: ctx.inline ? "open" : "idle",
  context: {
    "isYearView": false,
    "isMonthView": false,
    "isYearView": false,
    "isMonthView": false,
    "isMonthView": false,
    "isYearView": false,
    "isRangePicker && hasSelectedRange": false,
    "isRangePicker && isSelectingEndDate": false,
    "isRangePicker": false,
    "isMultiPicker": false,
    "isDayView && !isSameFocusedValue": false,
    "isRangePicker && isSelectingEndDate": false,
    "isRangePicker": false,
    "isMonthView": false,
    "isYearView": false,
    "isMultiPicker": false,
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
    "isMonthView": false,
    "isYearView": false,
    "isDayView": false,
    "isMonthView": false,
    "isTargetFocusable": false
  },
  activities: ["setupLiveRegion"],
  on: {
    "VALUE.SET": {
      actions: ["setSelectedDate", "setFocusedDate"]
    },
    "FOCUS.SET": {
      actions: ["setFocusedDate"]
    },
    "VALUE.CLEAR": {
      target: "focused",
      actions: ["clearSelectedDate", "clearFocusedDate", "setInputValue", "focusInputElement"]
    },
    "GOTO.NEXT": [{
      cond: "isYearView",
      actions: ["focusNextDecade", "announceVisibleRange"]
    }, {
      cond: "isMonthView",
      actions: ["focusNextYear", "announceVisibleRange"]
    }, {
      actions: ["focusNextPage"]
    }],
    "GOTO.PREV": [{
      cond: "isYearView",
      actions: ["focusPreviousDecade", "announceVisibleRange"]
    }, {
      cond: "isMonthView",
      actions: ["focusPreviousYear", "announceVisibleRange"]
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
          actions: ["setViewToDay", "focusFirstSelectedDate"]
        }
      }
    },
    focused: {
      tags: "closed",
      on: {
        "TRIGGER.CLICK": {
          target: "open",
          actions: ["setViewToDay", "focusFirstSelectedDate"]
        },
        "INPUT.CHANGE": {
          actions: ["focusParsedDate"]
        },
        "INPUT.ENTER": {
          actions: ["focusParsedDate", "selectFocusedDate", "setInputValue"]
        },
        "INPUT.BLUR": {
          target: "idle"
        },
        "CELL.FOCUS": {
          target: "open",
          actions: ["setView"]
        }
      }
    },
    open: {
      tags: "open",
      activities: ["trackDismissableElement"],
      entry: ["focusActiveCell"],
      exit: ["clearHoveredDate"],
      on: {
        "CELL.CLICK": [{
          cond: "isMonthView",
          actions: ["setFocusedMonth", "setViewToDay"]
        }, {
          cond: "isYearView",
          actions: ["setFocusedYear", "setViewToMonth"]
        }, {
          cond: "isRangePicker && hasSelectedRange",
          actions: ["resetIndex", "clearSelectedDate", "setFocusedDate", "setSelectedDate", "setEndIndex"]
        }, {
          target: "focused",
          cond: "isRangePicker && isSelectingEndDate",
          actions: ["setFocusedDate", "setSelectedDate", "resetIndex", "clearHoveredDate", "setInputValue", "focusInputElement"]
        }, {
          cond: "isRangePicker",
          actions: ["setFocusedDate", "setSelectedDate", "setEndIndex"]
        }, {
          cond: "isMultiPicker",
          actions: ["setFocusedDate", "toggleSelectedDate", "setInputValue"]
        }, {
          target: "focused",
          actions: ["setFocusedDate", "setSelectedDate", "setInputValue", "focusInputElement"]
        }],
        "CELL.FOCUS": {
          cond: "isDayView && !isSameFocusedValue",
          actions: ["setFocusedDate"]
        },
        "CELL.POINTER_MOVE": {
          cond: "isRangePicker && isSelectingEndDate",
          actions: ["setHoveredDate"]
        },
        "GRID.POINTER_LEAVE": {
          cond: "isRangePicker",
          actions: ["clearHoveredDate"]
        },
        "GRID.POINTER_DOWN": {
          actions: ["disableTextSelection"]
        },
        "GRID.POINTER_UP": {
          actions: ["enableTextSelection"]
        },
        "GRID.ESCAPE": {
          target: "focused",
          actions: ["setViewToDay", "focusFirstSelectedDate", "focusTriggerElement"]
        },
        "GRID.ENTER": [{
          cond: "isMonthView",
          actions: "setViewToDay"
        }, {
          cond: "isYearView",
          actions: "setViewToMonth"
        }, {
          cond: "isMultiPicker",
          actions: "toggleSelectedDate"
        }, {
          target: "focused",
          actions: ["selectFocusedDate", "setInputValue", "focusInputElement"]
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
        "GRID.HOME": [{
          cond: "isMonthView",
          actions: ["focusMonthStart"]
        }, {
          cond: "isYearView",
          actions: ["focusYearStart"]
        }, {
          actions: ["focusSectionStart"]
        }],
        "GRID.END": [{
          cond: "isMonthView",
          actions: ["focusMonthEnd"]
        }, {
          cond: "isYearView",
          actions: ["focusYearEnd"]
        }, {
          actions: ["focusSectionEnd"]
        }],
        "TRIGGER.CLICK": {
          target: "focused"
        },
        "VIEW.CHANGE": [{
          cond: "isDayView",
          actions: ["setViewToMonth"]
        }, {
          cond: "isMonthView",
          actions: ["setViewToYear"]
        }],
        DISMISS: [{
          cond: "isTargetFocusable",
          target: "idle"
        }, {
          target: "focused",
          actions: ["focusTriggerElement"]
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
    "isRangePicker && hasSelectedRange": ctx => ctx["isRangePicker && hasSelectedRange"],
    "isRangePicker && isSelectingEndDate": ctx => ctx["isRangePicker && isSelectingEndDate"],
    "isRangePicker": ctx => ctx["isRangePicker"],
    "isMultiPicker": ctx => ctx["isMultiPicker"],
    "isDayView && !isSameFocusedValue": ctx => ctx["isDayView && !isSameFocusedValue"],
    "isDayView": ctx => ctx["isDayView"],
    "isTargetFocusable": ctx => ctx["isTargetFocusable"]
  }
});