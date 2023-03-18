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
    "hasSelectedOption": false,
    "hasSelectedOption": false,
    "closeOnSelect": false,
    "closeOnSelect": false,
    "hasHighlightedOption": false,
    "hasHighlightedOption": false,
    "selectOnTab": false
  },
  initial: "idle",
  on: {
    HIGHLIGHT_OPTION: {
      actions: ["setHighlightedOption", "invokeOnHighlight"]
    },
    SELECT_OPTION: {
      actions: ["setSelectedOption", "invokeOnSelect"]
    },
    CLEAR_SELECTED: {
      actions: ["clearSelectedOption", "invokeOnSelect"]
    }
  },
  entry: ["setInitialSelectedOption"],
  activities: ["trackFormControlState"],
  on: {
    UPDATE_CONTEXT: {
      actions: "updateContext"
    }
  },
  states: {
    idle: {
      tags: ["closed"],
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
          target: "idle",
          actions: ["clearHighlightedOption"]
        },
        TRIGGER_KEY: {
          target: "open"
        },
        ARROW_UP: {
          target: "open",
          actions: ["highlightLastOption", "invokeOnHighlight"]
        },
        ARROW_DOWN: {
          target: "open",
          actions: ["highlightFirstOption", "invokeOnHighlight"]
        },
        ARROW_LEFT: [{
          cond: "hasSelectedOption",
          actions: ["selectPreviousOption", "invokeOnSelect"]
        }, {
          actions: ["selectLastOption", "invokeOnSelect"]
        }],
        ARROW_RIGHT: [{
          cond: "hasSelectedOption",
          actions: ["selectNextOption", "invokeOnSelect"]
        }, {
          actions: ["selectFirstOption", "invokeOnSelect"]
        }],
        HOME: {
          actions: ["selectFirstOption", "invokeOnSelect"]
        },
        END: {
          actions: ["selectLastOption", "invokeOnSelect"]
        },
        TYPEAHEAD: {
          actions: ["selectMatchingOption", "invokeOnSelect"]
        },
        OPEN: {
          target: "open"
        }
      }
    },
    open: {
      tags: ["open"],
      entry: ["focusContent", "highlightSelectedOption", "invokeOnOpen"],
      exit: ["scrollContentToTop"],
      activities: ["trackInteractOutside", "computePlacement", "scrollToHighlightedOption"],
      on: {
        CLOSE: {
          target: "focused",
          actions: ["invokeOnClose"]
        },
        TRIGGER_CLICK: {
          target: "focused",
          actions: ["invokeOnClose"]
        },
        OPTION_CLICK: [{
          target: "focused",
          actions: ["selectHighlightedOption", "invokeOnSelect", "invokeOnClose"],
          cond: "closeOnSelect"
        }, {
          actions: ["selectHighlightedOption", "invokeOnSelect"]
        }],
        TRIGGER_KEY: [{
          target: "focused",
          actions: ["selectHighlightedOption", "invokeOnSelect", "invokeOnClose"],
          cond: "closeOnSelect"
        }, {
          actions: ["selectHighlightedOption", "invokeOnSelect"]
        }],
        BLUR: {
          target: "focused",
          actions: ["invokeOnClose"]
        },
        HOME: {
          actions: ["highlightFirstOption", "invokeOnHighlight"]
        },
        END: {
          actions: ["highlightLastOption", "invokeOnHighlight"]
        },
        ARROW_DOWN: [{
          cond: "hasHighlightedOption",
          actions: ["highlightNextOption", "invokeOnHighlight"]
        }, {
          actions: ["highlightFirstOption", "invokeOnHighlight"]
        }],
        ARROW_UP: [{
          cond: "hasHighlightedOption",
          actions: ["highlightPreviousOption", "invokeOnHighlight"]
        }, {
          actions: ["highlightLastOption", "invokeOnHighlight"]
        }],
        TYPEAHEAD: {
          actions: ["highlightMatchingOption", "invokeOnHighlight"]
        },
        POINTER_MOVE: {
          actions: ["highlightOption", "invokeOnHighlight"]
        },
        POINTER_LEAVE: {
          actions: ["clearHighlightedOption"]
        },
        TAB: [{
          target: "idle",
          actions: ["selectHighlightedOption", "invokeOnClose", "invokeOnSelect", "clearHighlightedOption"],
          cond: "selectOnTab"
        }, {
          target: "idle",
          actions: ["invokeOnClose", "clearHighlightedOption"]
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
    "hasSelectedOption": ctx => ctx["hasSelectedOption"],
    "closeOnSelect": ctx => ctx["closeOnSelect"],
    "hasHighlightedOption": ctx => ctx["hasHighlightedOption"],
    "selectOnTab": ctx => ctx["selectOnTab"]
  }
});