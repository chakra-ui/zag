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
  id: "time-picker",
  initial: ctx.open ? "open" : "idle",
  context: {
    "isOpenControlled": false,
    "isOpenControlled": false,
    "isOpenControlled": false,
    "isOpenControlled": false,
    "isOpenControlled": false,
    "isOpenControlled": false,
    "shouldRestoreFocus && isInteractOutsideEvent": false,
    "shouldRestoreFocus": false,
    "isOpenControlled": false,
    "shouldRestoreFocus": false
  },
  on: {
    "INPUT.BLUR": {
      actions: ["applyInputValue", "checkValidInputValue", "syncInputElement"]
    },
    "INPUT.ENTER": {
      actions: ["applyInputValue", "checkValidInputValue", "syncInputElement"]
    },
    "VALUE.CLEAR": {
      actions: ["clearValue", "syncInputElement"]
    }
  },
  on: {
    UPDATE_CONTEXT: {
      actions: "updateContext"
    }
  },
  states: {
    idle: {
      tags: ["closed"],
      on: {
        "TRIGGER.CLICK": [{
          cond: "isOpenControlled",
          actions: ["invokeOnOpen"]
        }, {
          target: "open",
          actions: ["invokeOnOpen", "focusFirstHour"]
        }],
        OPEN: [{
          cond: "isOpenControlled",
          actions: ["invokeOnOpen"]
        }, {
          target: "open",
          actions: ["invokeOnOpen", "focusFirstHour"]
        }],
        "CONTROLLED.OPEN": {
          target: "open",
          actions: ["invokeOnOpen", "focusFirstHour"]
        }
      }
    },
    focused: {
      tags: ["closed"],
      on: {
        "TRIGGER.CLICK": [{
          cond: "isOpenControlled",
          actions: ["invokeOnOpen"]
        }, {
          target: "open",
          actions: ["invokeOnOpen", "focusFirstHour"]
        }],
        OPEN: [{
          cond: "isOpenControlled",
          actions: ["invokeOnOpen"]
        }, {
          target: "open",
          actions: ["invokeOnOpen", "focusFirstHour"]
        }],
        "CONTROLLED.OPEN": {
          target: "open",
          actions: ["invokeOnOpen", "focusFirstHour"]
        }
      }
    },
    open: {
      tags: ["open"],
      entry: ["focusFirstHour"],
      activities: ["computePlacement", "trackDismissableElement"],
      on: {
        "TRIGGER.CLICK": [{
          cond: "isOpenControlled",
          actions: ["invokeOnClose"]
        }, {
          target: "focused",
          actions: ["invokeOnClose", "scrollUpColumns"]
        }],
        CLOSE: [{
          cond: "isOpenControlled",
          actions: ["invokeOnClose"]
        }, {
          target: "idle",
          actions: ["invokeOnClose", "scrollUpColumns"]
        }],
        "CONTROLLED.CLOSE": [{
          cond: "shouldRestoreFocus && isInteractOutsideEvent",
          target: "focused",
          actions: ["focusTriggerElement", "scrollUpColumns"]
        }, {
          cond: "shouldRestoreFocus",
          target: "focused",
          actions: ["focusInputElement", "scrollUpColumns"]
        }, {
          target: "idle",
          actions: ["scrollUpColumns", "scrollUpColumns"]
        }],
        INTERACT_OUTSIDE: [{
          cond: "isOpenControlled",
          actions: ["invokeOnClose", "scrollUpColumns"]
        }, {
          cond: "shouldRestoreFocus",
          target: "focused",
          actions: ["invokeOnClose", "focusTriggerElement", "scrollUpColumns"]
        }, {
          target: "idle",
          actions: ["invokeOnClose", "scrollUpColumns"]
        }],
        "POSITIONING.SET": {
          actions: ["reposition", "scrollUpColumns"]
        },
        "HOUR.CLICK": {
          actions: ["setHour", "syncInputElement"]
        },
        "MINUTE.CLICK": {
          actions: ["setMinute", "syncInputElement"]
        },
        "SECOND.CLICK": {
          actions: ["setSecond", "syncInputElement"]
        },
        "PERIOD.CLICK": {
          actions: ["setPeriod", "checkValidInputValue", "syncInputElement"]
        },
        "CONTENT.COLUMN.ARROW_UP": {
          actions: ["focusPreviousCell"]
        },
        "CONTENT.COLUMN.ARROW_DOWN": {
          actions: ["focusNextCell"]
        },
        "CONTENT.COLUMN.ARROW_LEFT": {
          actions: ["focusPreviousColumnFirstCell"]
        },
        "CONTENT.COLUMN.ARROW_RIGHT": {
          actions: ["focusNextColumnFirstCell"]
        },
        "CONTENT.COLUMN.ENTER": {
          actions: ["setCurrentCell", "focusNextColumnFirstCell"]
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
    "isOpenControlled": ctx => ctx["isOpenControlled"],
    "shouldRestoreFocus && isInteractOutsideEvent": ctx => ctx["shouldRestoreFocus && isInteractOutsideEvent"],
    "shouldRestoreFocus": ctx => ctx["shouldRestoreFocus"]
  }
});