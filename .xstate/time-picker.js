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
  context: {},
  on: {
    "INPUT.BLUR": {
      actions: ["applyInputValue", "syncInputElement"]
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
          target: "open",
          actions: ["invokeOnOpen"]
        }],
        "CONTROLLED.OPEN": [{
          target: "open",
          actions: ["invokeOnOpen"]
        }]
      }
    },
    focused: {
      tags: ["closed"],
      on: {
        "TRIGGER.CLICK": [{
          target: "idle",
          actions: ["invokeOnOpen"]
        }],
        "CONTROLLED.OPEN": [{
          target: "open",
          actions: ["invokeOnOpen"]
        }]
      }
    },
    open: {
      tags: ["open"],
      entry: ["focusContentEl"],
      activities: ["computePlacement", "trackDismissableElement"],
      on: {
        "TRIGGER.CLICK": [{
          target: "idle",
          actions: ["invokeOnClose", "scrollUpColumns"]
        }],
        "CONTROLLED.CLOSE": [{
          target: "idle",
          actions: ["invokeOnClose", "scrollUpColumns"]
        }],
        "CONTENT.INTERACT_OUTSIDE": {
          target: "idle",
          actions: ["invokeOnClose", "scrollUpColumns"]
        },
        "POSITIONING.SET": {
          actions: ["reposition", "scrollUpColumns"]
        },
        "HOUR.CLICK": {
          actions: ["setHour", "invokeValueChange", "syncInputElement"]
        },
        "MINUTE.CLICK": {
          actions: ["setMinute", "invokeValueChange", "syncInputElement"]
        },
        "SECOND.CLICK": {
          actions: ["setSecond", "invokeValueChange", "syncInputElement"]
        },
        "PERIOD.CLICK": {
          actions: ["setPeriod", "invokeValueChange", "syncInputElement"]
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