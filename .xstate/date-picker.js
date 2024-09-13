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
    "isOpenControlled": false,
    "isYearView": false,
    "isMonthView": false,
    "isYearView": false,
    "isMonthView": false,
    "isOpenControlled": false,
    "isOpenControlled": false,
    "isOpenControlled": false,
    "isOpenControlled": false,
    "shouldRestoreFocus && isInteractOutsideEvent": false,
    "shouldRestoreFocus": false,
    "isMonthView": false,
    "isYearView": false,
    "isRangePicker && hasSelectedRange": false,
    "isRangePicker && isSelectingEndDate && closeOnSelect && isOpenControlled": false,
    "isRangePicker && isSelectingEndDate && closeOnSelect": false,
    "isRangePicker && isSelectingEndDate": false,
    "isRangePicker": false,
    "isMultiPicker": false,
    "closeOnSelect && isOpenControlled": false,
    "closeOnSelect": false,
    "isRangePicker && isSelectingEndDate": false,
    "isRangePicker": false,
    "isOpenControlled": false,
    "isMonthView": false,
    "isYearView": false,
    "isRangePicker && hasSelectedRange": false,
    "isRangePicker && isSelectingEndDate && closeOnSelect && isOpenControlled": false,
    "isRangePicker && isSelectingEndDate && closeOnSelect": false,
    "isRangePicker && isSelectingEndDate": false,
    "isRangePicker": false,
    "isMultiPicker": false,
    "closeOnSelect && isOpenControlled": false,
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
    "isOpenControlled": false,
    "isDayView": false,
    "isMonthView": false,
    "isOpenControlled": false,
    "shouldRestoreFocus": false,
    "isOpenControlled": false
  },
  activities: ["setupLiveRegion"],
  on: {
    "VALUE.SET": {
      actions: ["setDateValue", "setFocusedDate"]
    },
    "VIEW.SET": {
      actions: ["setView"]
    },
    "FOCUS.SET": {
      actions: ["setFocusedDate"]
    },
    "VALUE.CLEAR": {
      actions: ["clearDateValue", "clearFocusedDate", "focusFirstInputElement"]
    },
    "INPUT.CHANGE": {
      actions: ["setInputValue", "focusParsedDate"]
    },
    "INPUT.ENTER": {
      actions: ["focusParsedDate", "selectFocusedDate"]
    },
    "INPUT.FOCUS": {
      actions: ["setActiveIndex"]
    },
    "INPUT.BLUR": {
      actions: ["setActiveIndexToStart", "selectParsedDate"]
    },
    "PRESET.CLICK": [{
      cond: "isOpenControlled",
      actions: ["setDateValue", "setFocusedDate", "invokeOnClose"]
    }, {
      target: "focused",
      actions: ["setDateValue", "setFocusedDate", "focusInputElement"]
    }],
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
        "CONTROLLED.OPEN": {
          target: "open",
          actions: ["focusFirstSelectedDate", "focusActiveCell"]
        },
        "TRIGGER.CLICK": [{
          cond: "isOpenControlled",
          actions: ["invokeOnOpen"]
        }, {
          target: "open",
          actions: ["focusFirstSelectedDate", "focusActiveCell", "invokeOnOpen"]
        }],
        OPEN: [{
          cond: "isOpenControlled",
          actions: ["invokeOnOpen"]
        }, {
          target: "open",
          actions: ["focusFirstSelectedDate", "focusActiveCell", "invokeOnOpen"]
        }]
      }
    },
    focused: {
      tags: "closed",
      on: {
        "CONTROLLED.OPEN": {
          target: "open",
          actions: ["focusFirstSelectedDate", "focusActiveCell"]
        },
        "TRIGGER.CLICK": [{
          cond: "isOpenControlled",
          actions: ["invokeOnOpen"]
        }, {
          target: "open",
          actions: ["focusFirstSelectedDate", "focusActiveCell", "invokeOnOpen"]
        }],
        OPEN: [{
          cond: "isOpenControlled",
          actions: ["invokeOnOpen"]
        }, {
          target: "open",
          actions: ["focusFirstSelectedDate", "focusActiveCell", "invokeOnOpen"]
        }]
      }
    },
    open: {
      tags: "open",
      activities: ["trackDismissableElement", "trackPositioning"],
      exit: ["clearHoveredDate", "resetView"],
      on: {
        "CONTROLLED.CLOSE": [{
          cond: "shouldRestoreFocus && isInteractOutsideEvent",
          target: "focused",
          actions: ["focusTriggerElement"]
        }, {
          cond: "shouldRestoreFocus",
          target: "focused",
          actions: ["focusInputElement"]
        }, {
          target: "idle"
        }],
        "CELL.CLICK": [{
          cond: "isMonthView",
          actions: ["setFocusedMonth", "setViewToDay"]
        }, {
          cond: "isYearView",
          actions: ["setFocusedYear", "setViewToMonth"]
        }, {
          cond: "isRangePicker && hasSelectedRange",
          actions: ["setActiveIndexToStart", "clearDateValue", "setFocusedDate", "setSelectedDate", "setActiveIndexToEnd"]
        },
        // === Grouped transitions (based on `closeOnSelect` and `isOpenControlled`) ===
        {
          cond: "isRangePicker && isSelectingEndDate && closeOnSelect && isOpenControlled",
          actions: ["setFocusedDate", "setSelectedDate", "setActiveIndexToStart", "invokeOnClose", "setRestoreFocus"]
        }, {
          cond: "isRangePicker && isSelectingEndDate && closeOnSelect",
          target: "focused",
          actions: ["setFocusedDate", "setSelectedDate", "setActiveIndexToStart", "invokeOnClose", "focusInputElement"]
        }, {
          cond: "isRangePicker && isSelectingEndDate",
          actions: ["setFocusedDate", "setSelectedDate", "setActiveIndexToStart", "clearHoveredDate"]
        },
        // ===
        {
          cond: "isRangePicker",
          actions: ["setFocusedDate", "setSelectedDate", "setActiveIndexToEnd"]
        }, {
          cond: "isMultiPicker",
          actions: ["setFocusedDate", "toggleSelectedDate"]
        },
        // === Grouped transitions (based on `closeOnSelect` and `isOpenControlled`) ===
        {
          cond: "closeOnSelect && isOpenControlled",
          actions: ["setFocusedDate", "setSelectedDate", "invokeOnClose"]
        }, {
          cond: "closeOnSelect",
          target: "focused",
          actions: ["setFocusedDate", "setSelectedDate", "invokeOnClose", "focusInputElement"]
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
        "TABLE.ESCAPE": [{
          cond: "isOpenControlled",
          actions: ["focusFirstSelectedDate", "invokeOnClose"]
        }, {
          target: "focused",
          actions: ["focusFirstSelectedDate", "invokeOnClose", "focusTriggerElement"]
        }],
        "TABLE.ENTER": [{
          cond: "isMonthView",
          actions: "setViewToDay"
        }, {
          cond: "isYearView",
          actions: "setViewToMonth"
        }, {
          cond: "isRangePicker && hasSelectedRange",
          actions: ["setActiveIndexToStart", "clearDateValue", "setSelectedDate", "setActiveIndexToEnd"]
        },
        // === Grouped transitions (based on `closeOnSelect` and `isOpenControlled`) ===
        {
          cond: "isRangePicker && isSelectingEndDate && closeOnSelect && isOpenControlled",
          actions: ["setSelectedDate", "setActiveIndexToStart", "invokeOnClose"]
        }, {
          cond: "isRangePicker && isSelectingEndDate && closeOnSelect",
          target: "focused",
          actions: ["setSelectedDate", "setActiveIndexToStart", "invokeOnClose", "focusInputElement"]
        }, {
          cond: "isRangePicker && isSelectingEndDate",
          actions: ["setSelectedDate", "setActiveIndexToStart"]
        },
        // ===
        {
          cond: "isRangePicker",
          actions: ["setSelectedDate", "setActiveIndexToEnd", "focusNextDay"]
        }, {
          cond: "isMultiPicker",
          actions: ["toggleSelectedDate"]
        },
        // === Grouped transitions (based on `closeOnSelect` and `isOpenControlled`) ===
        {
          cond: "closeOnSelect && isOpenControlled",
          actions: ["selectFocusedDate", "invokeOnClose"]
        }, {
          cond: "closeOnSelect",
          target: "focused",
          actions: ["selectFocusedDate", "invokeOnClose", "focusInputElement"]
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
        "TRIGGER.CLICK": [{
          cond: "isOpenControlled",
          actions: ["invokeOnClose"]
        }, {
          target: "focused",
          actions: ["invokeOnClose"]
        }],
        "VIEW.CHANGE": [{
          cond: "isDayView",
          actions: ["setViewToMonth"]
        }, {
          cond: "isMonthView",
          actions: ["setViewToYear"]
        }],
        INTERACT_OUTSIDE: [{
          cond: "isOpenControlled",
          actions: ["setActiveIndexToStart", "invokeOnClose"]
        }, {
          cond: "shouldRestoreFocus",
          target: "focused",
          actions: ["setActiveIndexToStart", "invokeOnClose", "focusTriggerElement"]
        }, {
          target: "idle",
          actions: ["setActiveIndexToStart", "invokeOnClose"]
        }],
        CLOSE: [{
          cond: "isOpenControlled",
          actions: ["setActiveIndexToStart", "invokeOnClose"]
        }, {
          target: "idle",
          actions: ["setActiveIndexToStart", "invokeOnClose"]
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
    "isOpenControlled": ctx => ctx["isOpenControlled"],
    "isYearView": ctx => ctx["isYearView"],
    "isMonthView": ctx => ctx["isMonthView"],
    "shouldRestoreFocus && isInteractOutsideEvent": ctx => ctx["shouldRestoreFocus && isInteractOutsideEvent"],
    "shouldRestoreFocus": ctx => ctx["shouldRestoreFocus"],
    "isRangePicker && hasSelectedRange": ctx => ctx["isRangePicker && hasSelectedRange"],
    "isRangePicker && isSelectingEndDate && closeOnSelect && isOpenControlled": ctx => ctx["isRangePicker && isSelectingEndDate && closeOnSelect && isOpenControlled"],
    "isRangePicker && isSelectingEndDate && closeOnSelect": ctx => ctx["isRangePicker && isSelectingEndDate && closeOnSelect"],
    "isRangePicker && isSelectingEndDate": ctx => ctx["isRangePicker && isSelectingEndDate"],
    "isRangePicker": ctx => ctx["isRangePicker"],
    "isMultiPicker": ctx => ctx["isMultiPicker"],
    "closeOnSelect && isOpenControlled": ctx => ctx["closeOnSelect && isOpenControlled"],
    "closeOnSelect": ctx => ctx["closeOnSelect"],
    "isDayView": ctx => ctx["isDayView"]
  }
});