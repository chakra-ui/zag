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
  initial: ctx.open ? "open" : "idle",
  context: {
    "isYearView": false,
    "isMonthView": false,
    "isYearView": false,
    "isMonthView": false,
    "isMonthView": false,
    "isYearView": false,
    "isRangePicker && hasSelectedRange": false,
    "isRangePicker && isSelectingEndDate && closeOnSelect": false,
    "isRangePicker && isSelectingEndDate": false,
    "isRangePicker": false,
    "isMultiPicker": false,
    "closeOnSelect": false,
    "isRangePicker && isSelectingEndDate": false,
    "isRangePicker": false,
    "isMonthView": false,
    "isYearView": false,
    "isRangePicker && hasSelectedRange": false,
    "isRangePicker && isSelectingEndDate && closeOnSelect": false,
    "isRangePicker && isSelectingEndDate": false,
    "isRangePicker": false,
    "isMultiPicker": false,
    "closeOnSelect": false,
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
    "VIEW.SET": {
      actions: ["setView"]
    },
    "FOCUS.SET": {
      actions: ["setFocusedDate"]
    },
    "VALUE.CLEAR": {
      actions: ["clearSelectedDate", "clearFocusedDate", "focusInputElement"]
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
          actions: ["focusFirstSelectedDate", "focusActiveCell", "invokeOnOpen"]
        },
        OPEN: {
          target: "open",
          actions: ["invokeOnOpen"]
        }
      }
    },
    focused: {
      tags: "closed",
      on: {
        "TRIGGER.CLICK": {
          target: "open",
          actions: ["setViewToDay", "focusFirstSelectedDate", "focusActiveCell", "invokeOnOpen"]
        },
        "INPUT.CHANGE": {
          actions: ["focusParsedDate"]
        },
        "INPUT.ENTER": {
          actions: ["focusParsedDate", "selectFocusedDate"]
        },
        "INPUT.BLUR": {
          target: "idle"
        },
        "CELL.FOCUS": {
          target: "open",
          actions: ["setView", "focusActiveCell", "invokeOnOpen"]
        },
        OPEN: {
          target: "open",
          actions: ["invokeOnOpen"]
        }
      }
    },
    open: {
      tags: "open",
      activities: ["trackDismissableElement", "trackPositioning"],
      exit: ["clearHoveredDate", "resetView"],
      on: {
        "INPUT.CHANGE": {
          actions: ["focusParsedDate"]
        },
        "CELL.CLICK": [{
          cond: "isMonthView",
          actions: ["setFocusedMonth", "setViewToDay"]
        }, {
          cond: "isYearView",
          actions: ["setFocusedYear", "setViewToMonth"]
        }, {
          cond: "isRangePicker && hasSelectedRange",
          actions: ["setStartIndex", "clearSelectedDate", "setFocusedDate", "setSelectedDate", "setEndIndex"]
        },
        // === Grouped transitions (based on `closeOnSelect`) ===
        {
          cond: "isRangePicker && isSelectingEndDate && closeOnSelect",
          target: "focused",
          actions: ["setFocusedDate", "setSelectedDate", "setStartIndex", "clearHoveredDate", "focusInputElement", "invokeOnClose"]
        }, {
          cond: "isRangePicker && isSelectingEndDate",
          actions: ["setFocusedDate", "setSelectedDate", "setStartIndex", "clearHoveredDate"]
        },
        // ===
        {
          cond: "isRangePicker",
          actions: ["setFocusedDate", "setSelectedDate", "setEndIndex"]
        }, {
          cond: "isMultiPicker",
          actions: ["setFocusedDate", "toggleSelectedDate"]
        },
        // === Grouped transitions (based on `closeOnSelect`) ===
        {
          cond: "closeOnSelect",
          target: "focused",
          actions: ["setFocusedDate", "setSelectedDate", "focusInputElement", "invokeOnClose"]
        }, {
          actions: ["setFocusedDate", "setSelectedDate"]
        }
        // ===
        ],

        "CELL.POINTER_MOVE": {
          cond: "isRangePicker && isSelectingEndDate",
          actions: ["setHoveredDate", "setFocusedDate"]
        },
        "TABLE.POINTER_LEAVE": {
          cond: "isRangePicker",
          actions: ["clearHoveredDate"]
        },
        "TABLE.POINTER_DOWN": {
          actions: ["disableTextSelection"]
        },
        "TABLE.POINTER_UP": {
          actions: ["enableTextSelection"]
        },
        "TABLE.ESCAPE": {
          target: "focused",
          actions: ["setViewToDay", "focusFirstSelectedDate", "focusTriggerElement", "invokeOnClose"]
        },
        "TABLE.ENTER": [{
          cond: "isMonthView",
          actions: "setViewToDay"
        }, {
          cond: "isYearView",
          actions: "setViewToMonth"
        }, {
          cond: "isRangePicker && hasSelectedRange",
          actions: ["setStartIndex", "clearSelectedDate", "setSelectedDate", "setEndIndex"]
        },
        // === Grouped transitions (based on `closeOnSelect`) ===
        {
          cond: "isRangePicker && isSelectingEndDate && closeOnSelect",
          target: "focused",
          actions: ["setSelectedDate", "setStartIndex", "focusInputElement", "invokeOnClose"]
        }, {
          cond: "isRangePicker && isSelectingEndDate",
          actions: ["setSelectedDate", "setStartIndex"]
        },
        // ===
        {
          cond: "isRangePicker",
          actions: ["setSelectedDate", "setEndIndex", "focusNextDay"]
        }, {
          cond: "isMultiPicker",
          actions: ["toggleSelectedDate"]
        },
        // === Grouped transitions (based on `closeOnSelect`) ===
        {
          cond: "closeOnSelect",
          target: "focused",
          actions: ["selectFocusedDate", "focusInputElement", "invokeOnClose"]
        }, {
          actions: ["selectFocusedDate"]
        }
        // ===
        ],

        "TABLE.ARROW_RIGHT": [{
          cond: "isMonthView",
          actions: "focusNextMonth"
        }, {
          cond: "isYearView",
          actions: "focusNextYear"
        }, {
          actions: ["focusNextDay", "setHoveredDate"]
        }],
        "TABLE.ARROW_LEFT": [{
          cond: "isMonthView",
          actions: "focusPreviousMonth"
        }, {
          cond: "isYearView",
          actions: "focusPreviousYear"
        }, {
          actions: ["focusPreviousDay"]
        }],
        "TABLE.ARROW_UP": [{
          cond: "isMonthView",
          actions: "focusPreviousMonthColumn"
        }, {
          cond: "isYearView",
          actions: "focusPreviousYearColumn"
        }, {
          actions: ["focusPreviousWeek"]
        }],
        "TABLE.ARROW_DOWN": [{
          cond: "isMonthView",
          actions: "focusNextMonthColumn"
        }, {
          cond: "isYearView",
          actions: "focusNextYearColumn"
        }, {
          actions: ["focusNextWeek"]
        }],
        "TABLE.PAGE_UP": {
          actions: ["focusPreviousSection"]
        },
        "TABLE.PAGE_DOWN": {
          actions: ["focusNextSection"]
        },
        "TABLE.HOME": [{
          cond: "isMonthView",
          actions: ["focusFirstMonth"]
        }, {
          cond: "isYearView",
          actions: ["focusFirstYear"]
        }, {
          actions: ["focusSectionStart"]
        }],
        "TABLE.END": [{
          cond: "isMonthView",
          actions: ["focusLastMonth"]
        }, {
          cond: "isYearView",
          actions: ["focusLastYear"]
        }, {
          actions: ["focusSectionEnd"]
        }],
        "TRIGGER.CLICK": {
          target: "focused",
          actions: ["invokeOnClose"]
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
          target: "idle",
          actions: ["setStartIndex", "invokeOnClose"]
        }, {
          target: "focused",
          actions: ["focusTriggerElement", "setStartIndex", "invokeOnClose"]
        }],
        CLOSE: {
          target: "idle",
          actions: ["setStartIndex", "invokeOnClose"]
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
    "isYearView": ctx => ctx["isYearView"],
    "isMonthView": ctx => ctx["isMonthView"],
    "isRangePicker && hasSelectedRange": ctx => ctx["isRangePicker && hasSelectedRange"],
    "isRangePicker && isSelectingEndDate && closeOnSelect": ctx => ctx["isRangePicker && isSelectingEndDate && closeOnSelect"],
    "isRangePicker && isSelectingEndDate": ctx => ctx["isRangePicker && isSelectingEndDate"],
    "isRangePicker": ctx => ctx["isRangePicker"],
    "isMultiPicker": ctx => ctx["isMultiPicker"],
    "closeOnSelect": ctx => ctx["closeOnSelect"],
    "isDayView": ctx => ctx["isDayView"],
    "isTargetFocusable": ctx => ctx["isTargetFocusable"]
  }
});