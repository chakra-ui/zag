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
    SET_HIGHLIGHT: {
      actions: ["setHighlightOption"]
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
      entry: ["clearHighlightedOption"],
      on: {
        TRIGGER_CLICK: {
          target: "open"
        },
        TRIGGER_FOCUS: {
          target: "focused"
        },
        OPEN: {
          target: "open"
        }
      }
    },
    focused: {
      tags: ["closed"],
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
        ARROW_LEFT: {
          actions: ["selectPreviousOption"]
        },
        ARROW_RIGHT: {
          actions: ["selectNextOption"]
        },
        HOME: {
          actions: ["selectFirstOption"]
        },
        END: {
          actions: ["selectLastOption"]
        },
        TYPEAHEAD: {
          actions: ["selectMatchingOption"]
        },
        OPEN: {
          target: "open"
        }
      }
    },
    open: {
      tags: ["open"],
      entry: ["focusListbox", "highlightSelectedOption"],
      exit: ["scrollToTop"],
      activities: ["trackInteractOutside", "computePlacement", "scrollIntoView"],
      on: {
        CLOSE: {
          // should close go to idle?
          target: "focused"
        },
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
        POINTER_MOVE: {
          actions: ["highlightOption"]
        },
        POINTER_LEAVE: {
          actions: ["clearHighlightedOption"]
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