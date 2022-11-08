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
    "hasHighlightedOption": false,
    "hasHighlightedOption": false,
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
      entry: ["clearHighlightedOption"],
      on: {
        TRIGGER_CLICK: {
          target: "open"
        },
        TRIGGER_FOCUS: {
          target: "focused"
        }
      }
    },
    focused: {
      entry: ["focusTrigger", "clearHighlightedOption"],
      on: {
        TRIGGER_CLICK: {
          target: "open"
        },
        TRIGGER_BLUR: {
          target: "idle"
        },
        BLUR: {
          target: "idle"
        },
        TRIGGER_KEY: {
          target: "open"
        },
        ARROW_UP: {
          target: "open",
          actions: ["highlightLastOption"]
        },
        ARROW_DOWN: {
          target: "open",
          actions: ["highlightFirstOption"]
        },
        HOME: {
          target: "open",
          actions: ["highlightFirstOption"]
        },
        END: {
          target: "open",
          actions: ["highlightLastOption"]
        },
        TYPEAHEAD: {
          actions: ["selectMatchingOption"]
        }
      }
    },
    open: {
      entry: ["focusListbox", "highlightSelectedOption"],
      activities: ["trackInteractOutside", "computePlacement", "scrollIntoView"],
      on: {
        TRIGGER_CLICK: {
          target: "focused"
        },
        OPTION_CLICK: {
          target: "focused",
          actions: ["selectHighlightedOption"]
        },
        TRIGGER_KEY: {
          target: "focused",
          actions: ["selectHighlightedOption"]
        },
        ESC_KEY: {
          target: "focused"
        },
        BLUR: {
          target: "focused"
        },
        HOME: {
          actions: ["highlightFirstOption"]
        },
        END: {
          actions: ["highlightLastOption"]
        },
        ARROW_DOWN: [{
          cond: "hasHighlightedOption",
          actions: ["highlightNextOption"]
        }, {
          actions: ["highlightFirstOption"]
        }],
        ARROW_UP: [{
          cond: "hasHighlightedOption",
          actions: ["focusPreviousOption"]
        }, {
          actions: ["highlightLastOption"]
        }],
        TYPEAHEAD: {
          actions: ["highlightMatchingOption"]
        },
        HOVER: {
          actions: ["highlightOption"]
        },
        TAB: [{
          target: "idle",
          actions: ["selectHighlightedOption"],
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
    "hasHighlightedOption": ctx => ctx["hasHighlightedOption"],
    "selectOnTab": ctx => ctx["selectOnTab"]
  }
});