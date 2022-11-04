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
  id: "select",
  context: {
    "isPrintableCharacter": false,
    "hasFocusedOption": false,
    "hasFocusedOption": false,
    "isPrintableCharacter": false,
    "selectOnTab": false
  },
  initial: "idle",
  on: {
    UPDATE_CONTEXT: {
      actions: "updateContext"
    }
  },
  states: {
    idle: {
      entry: ["clearFocusedOption"],
      on: {
        TRIGGER_CLICK: {
          target: "open"
        },
        FOCUS: {
          target: "focused"
        }
      }
    },
    focused: {
      entry: ["focusTrigger", "clearFocusedOption"],
      on: {
        TRIGGER_CLICK: {
          target: "open"
        },
        BLUR: {
          target: "idle"
        },
        TYPE_AHEAD: {
          cond: "isPrintableCharacter",
          actions: ["selectMatchingOption"]
        },
        TRIGGER_KEY: {
          target: "open"
        },
        ARROW_UP: {
          target: "open",
          actions: ["focusLastOption"]
        },
        ARROW_DOWN: {
          target: "open",
          actions: ["focusFirstOption"]
        }
      }
    },
    open: {
      entry: ["focusListbox", "focusSelectedOption"],
      on: {
        TRIGGER_CLICK: {
          target: "focused"
        },
        OPTION_CLICK: {
          target: "focused",
          actions: ["selectFocusedOption"]
        },
        TRIGGER_KEY: {
          target: "focused",
          actions: ["selectFocusedOption"]
        },
        ESC_KEY: {
          target: "focused"
        },
        BLUR: {
          target: "idle"
        },
        ARROW_DOWN: [{
          cond: "hasFocusedOption",
          actions: ["focusNextOption"]
        }, {
          actions: ["focusFirstOption"]
        }],
        ARROW_UP: [{
          cond: "hasFocusedOption",
          actions: ["focusPreviousOption"]
        }, {
          actions: ["focusLastOption"]
        }],
        TYPE_AHEAD: {
          cond: "isPrintableCharacter",
          actions: ["focusMatchingOption"]
        },
        HOVER: {
          actions: ["focusOption"]
        },
        TAB: [{
          target: "idle",
          actions: ["selectFocusedOption"],
          cond: "selectOnTab"
        }, {
          target: "idle"
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
    "isPrintableCharacter": ctx => ctx["isPrintableCharacter"],
    "hasFocusedOption": ctx => ctx["hasFocusedOption"],
    "selectOnTab": ctx => ctx["selectOnTab"]
  }
});