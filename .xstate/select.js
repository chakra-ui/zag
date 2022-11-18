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
    "hasValue": false,
    "hasValue": false,
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
          actions: ["highlightLastOption", "invokeOnHighlight"]
        },
        ARROW_DOWN: {
          target: "open",
          actions: ["highlightFirstOption", "invokeOnHighlight"]
        },
        ARROW_LEFT: [{
          cond: "hasValue",
          actions: ["selectPreviousOption", "invokeOnSelect"]
        }, {
          actions: ["selectLastOption", "invokeOnSelect"]
        }],
        ARROW_RIGHT: [{
          cond: "hasValue",
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
      entry: ["focusMenu", "highlightSelectedOption", "invokeOnOpen"],
      exit: ["scrollMenuToTop"],
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
        OPTION_CLICK: {
          target: "focused",
          actions: ["selectHighlightedOption", "invokeOnClose", "invokeOnSelect"]
        },
        TRIGGER_KEY: {
          target: "focused",
          actions: ["selectHighlightedOption", "invokeOnClose", "invokeOnSelect"]
        },
        ESC_KEY: {
          target: "focused",
          actions: ["invokeOnClose"]
        },
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
          actions: ["selectHighlightedOption", "invokeOnClose", "invokeOnSelect"],
          cond: "selectOnTab"
        }, {
          target: "idle",
          actions: ["invokeOnClose"]
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
    "hasValue": ctx => ctx["hasValue"],
    "hasHighlightedOption": ctx => ctx["hasHighlightedOption"],
    "selectOnTab": ctx => ctx["selectOnTab"]
  }
});