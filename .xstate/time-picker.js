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
    "isOpenControlled": false,
    "shouldRestoreFocus": false
  },
  on: {
    "VALUE.CLEAR": {
      actions: ["clearValue"]
    },
    "VALUE.SET": {
      actions: ["setValue"]
    },
    "UNIT.SET": {
      actions: ["setUnitValue"]
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
        "INPUT.FOCUS": {
          target: "focused"
        },
        "TRIGGER.CLICK": [{
          cond: "isOpenControlled",
          actions: ["invokeOnOpen"]
        }, {
          target: "open",
          actions: ["invokeOnOpen"]
        }],
        OPEN: [{
          cond: "isOpenControlled",
          actions: ["invokeOnOpen"]
        }, {
          target: "open",
          actions: ["invokeOnOpen"]
        }],
        "CONTROLLED.OPEN": {
          target: "open",
          actions: ["invokeOnOpen"]
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
          actions: ["invokeOnOpen"]
        }],
        OPEN: [{
          cond: "isOpenControlled",
          actions: ["invokeOnOpen"]
        }, {
          target: "open",
          actions: ["invokeOnOpen"]
        }],
        "INPUT.ENTER": {
          actions: ["setInputValue", "clampTimeValue"]
        },
        "INPUT.BLUR": {
          target: "idle",
          actions: ["setInputValue", "clampTimeValue"]
        },
        "CONTROLLED.OPEN": {
          target: "open",
          actions: ["invokeOnOpen"]
        }
      }
    },
    open: {
      tags: ["open"],
      entry: ["setCurrentTime", "scrollColumnsToTop", "focusHourColumn"],
      exit: ["resetFocusedCell"],
      activities: ["computePlacement", "trackDismissableElement"],
      on: {
        "TRIGGER.CLICK": [{
          cond: "isOpenControlled",
          actions: ["invokeOnClose"]
        }, {
          target: "focused",
          actions: ["invokeOnClose"]
        }],
        "INPUT.ENTER": {
          actions: ["setInputValue", "clampTimeValue"]
        },
        CLOSE: [{
          cond: "isOpenControlled",
          actions: ["invokeOnClose"]
        }, {
          target: "idle",
          actions: ["invokeOnClose"]
        }],
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
        "CONTENT.ESCAPE": [{
          cond: "isOpenControlled",
          actions: ["invokeOnClose"]
        }, {
          target: "focused",
          actions: ["invokeOnClose", "focusInputElement"]
        }],
        INTERACT_OUTSIDE: [{
          cond: "isOpenControlled",
          actions: ["invokeOnClose"]
        }, {
          cond: "shouldRestoreFocus",
          target: "focused",
          actions: ["invokeOnClose", "focusTriggerElement"]
        }, {
          target: "idle",
          actions: ["invokeOnClose"]
        }],
        "POSITIONING.SET": {
          actions: ["reposition"]
        },
        "UNIT.CLICK": {
          actions: ["setFocusedValue", "setFocusedColumn", "setUnitValue"]
        },
        "CONTENT.ARROW_UP": {
          actions: ["focusPreviousCell"]
        },
        "CONTENT.ARROW_DOWN": {
          actions: ["focusNextCell"]
        },
        "CONTENT.ARROW_LEFT": {
          actions: ["focusPreviousColumnCell"]
        },
        "CONTENT.ARROW_RIGHT": {
          actions: ["focusNextColumnCell"]
        },
        "CONTENT.ENTER": {
          actions: ["selectFocusedCell", "focusNextColumnCell"]
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