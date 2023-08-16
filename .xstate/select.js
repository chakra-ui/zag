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
      actions: ["setHighlightedOption"]
    },
    SELECT_OPTION: {
      actions: ["setSelectedOption"]
    },
    CLEAR_SELECTED: {
      actions: ["clearSelectedOption"]
    }
  },
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
          actions: ["highlightLastOption"]
        },
        ARROW_DOWN: {
          target: "open",
          actions: ["highlightFirstOption"]
        },
        ARROW_LEFT: [{
          cond: "hasSelectedOption",
          actions: ["selectPreviousOption"]
        }, {
          actions: ["selectLastOption"]
        }],
        ARROW_RIGHT: [{
          cond: "hasSelectedOption",
          actions: ["selectNextOption"]
        }, {
          actions: ["selectFirstOption"]
        }],
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
      entry: ["focusContent", "highlightSelectedOption", "invokeOnOpen"],
      exit: ["scrollContentToTop"],
      activities: ["trackInteractOutside", "computePlacement", "scrollToHighlightedOption", "proxyTabFocus"],
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
          actions: ["selectHighlightedOption", "invokeOnClose"],
          cond: "closeOnSelect"
        }, {
          actions: ["selectHighlightedOption"]
        }],
        TRIGGER_KEY: [{
          target: "focused",
          actions: ["selectHighlightedOption", "invokeOnClose"],
          cond: "closeOnSelect"
        }, {
          actions: ["selectHighlightedOption"]
        }],
        BLUR: {
          target: "focused",
          actions: ["invokeOnClose"]
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
          actions: ["highlightPreviousOption"]
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
          actions: ["selectHighlightedOption", "invokeOnClose", "clearHighlightedOption"],
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