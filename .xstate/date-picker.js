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
    "isRangePicker && isSelectingEndDate && isInline": false,
    "isRangePicker && isSelectingEndDate": false,
    "isRangePicker": false,
    "isMultiPicker": false,
    "isInline": false,
    "isRangePicker && isSelectingEndDate": false,
    "isRangePicker": false,
    "!isInline": false,
    "!isInline": false,
    "!isInline": false,
    "isMonthView": false,
    "isYearView": false,
    "isRangePicker && hasSelectedRange": false,
    "isRangePicker && isSelectingEndDate && isInline": false,
    "isRangePicker && isSelectingEndDate": false,
    "isRangePicker": false,
    "isMultiPicker": false,
    "isInline": false,
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
          actions: ["focusFirstSelectedDate", "invokeOnOpen"]
        }
      }
    },
    focused: {
      tags: "closed",
      on: {
        "TRIGGER.CLICK": {
          target: "open",
          actions: ["setViewToDay", "focusFirstSelectedDate", "invokeOnOpen"]
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
          actions: ["setView", "invokeOnOpen"]
        }
      }
    },
    open: {
      tags: "open",
      activities: ["trackDismissableElement", "trackPositioning"],
      entry: ctx.inline ? undefined : ["focusActiveCell"],
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
        // === Grouped transitions (based on isInline) ===
        {
          cond: "isRangePicker && isSelectingEndDate && isInline",
          actions: ["setFocusedDate", "setSelectedDate", "setStartIndex", "clearHoveredDate"]
        }, {
          target: "focused",
          cond: "isRangePicker && isSelectingEndDate",
          actions: ["setFocusedDate", "setSelectedDate", "setStartIndex", "clearHoveredDate", "focusInputElement", "invokeOnClose"]
        },
        // ===
        {
          cond: "isRangePicker",
          actions: ["setFocusedDate", "setSelectedDate", "setEndIndex"]
        }, {
          cond: "isMultiPicker",
          actions: ["setFocusedDate", "toggleSelectedDate"]
        },
        // === Grouped transitions (based on isInline) ===
        {
          cond: "isInline",
          actions: ["setFocusedDate", "setSelectedDate"]
        }, {
          target: "focused",
          actions: ["setFocusedDate", "setSelectedDate", "focusInputElement", "invokeOnClose"]
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
          cond: "!isInline",
          actions: ["disableTextSelection"]
        },
        "TABLE.POINTER_UP": {
          cond: "!isInline",
          actions: ["enableTextSelection"]
        },
        "TABLE.ESCAPE": {
          cond: "!isInline",
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
        // === Grouped transitions (based on isInline) ===
        {
          cond: "isRangePicker && isSelectingEndDate && isInline",
          actions: ["setSelectedDate", "setStartIndex"]
        }, {
          target: "focused",
          cond: "isRangePicker && isSelectingEndDate",
          actions: ["setSelectedDate", "setStartIndex", "focusInputElement", "invokeOnClose"]
        },
        // ===
        {
          cond: "isRangePicker",
          actions: ["setSelectedDate", "setEndIndex", "focusNextDay"]
        }, {
          cond: "isMultiPicker",
          actions: ["toggleSelectedDate"]
        },
        // === Grouped transitions (based on isInline) ===
        {
          cond: "isInline",
          actions: ["selectFocusedDate"]
        }, {
          target: "focused",
          actions: ["selectFocusedDate", "focusInputElement", "invokeOnClose"]
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
    "isRangePicker && isSelectingEndDate && isInline": ctx => ctx["isRangePicker && isSelectingEndDate && isInline"],
    "isRangePicker && isSelectingEndDate": ctx => ctx["isRangePicker && isSelectingEndDate"],
    "isRangePicker": ctx => ctx["isRangePicker"],
    "isMultiPicker": ctx => ctx["isMultiPicker"],
    "isInline": ctx => ctx["isInline"],
    "!isInline": ctx => ctx["!isInline"],
    "isDayView": ctx => ctx["isDayView"],
    "isTargetFocusable": ctx => ctx["isTargetFocusable"]
  }
});