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
    "hasSelectedItems": false,
    "hasSelectedItems": false,
    "hasSelectedItems": false,
    "!multiple && hasSelectedItems": false,
    "!multiple": false,
    "!multiple && hasSelectedItems": false,
    "!multiple": false,
    "!multiple": false,
    "!multiple": false,
    "!multiple": false,
    "closeOnSelect": false,
    "multiple": false,
    "closeOnSelect": false,
    "multiple": false,
    "selectOnBlur && hasHighlightedItem": false,
    "isTargetFocusable": false,
    "hasHighlightedItem": false,
    "hasHighlightedItem": false
  },
  initial: "idle",
  on: {
    HIGHLIGHT_ITEM: {
      actions: ["setHighlightedItem"]
    },
    SELECT_ITEM: {
      actions: ["selectItem"]
    },
    CLEAR_ITEM: {
      actions: ["clearItem"]
    },
    SET_VALUE: {
      actions: ["setSelectedItems"]
    },
    CLEAR_VALUE: {
      actions: ["clearSelectedItems"]
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
          target: "open",
          actions: ["invokeOnOpen"]
        },
        TRIGGER_FOCUS: {
          target: "focused"
        },
        OPEN: {
          target: "open",
          actions: ["invokeOnOpen"]
        }
      }
    },
    focused: {
      tags: ["closed"],
      entry: ["focusTrigger"],
      on: {
        TRIGGER_BLUR: {
          target: "idle"
        },
        TRIGGER_CLICK: {
          target: "open",
          actions: ["invokeOnOpen"]
        },
        TRIGGER_KEY: [{
          cond: "hasSelectedItems",
          target: "open",
          actions: ["invokeOnOpen"]
        }, {
          target: "open",
          actions: ["highlightFirstItem", "invokeOnOpen"]
        }],
        ARROW_UP: [{
          cond: "hasSelectedItems",
          target: "open",
          actions: ["invokeOnOpen"]
        }, {
          target: "open",
          actions: ["highlightLastItem", "invokeOnOpen"]
        }],
        ARROW_DOWN: [{
          cond: "hasSelectedItems",
          target: "open",
          actions: ["invokeOnOpen"]
        }, {
          target: "open",
          actions: ["highlightFirstItem", "invokeOnOpen"]
        }],
        OPEN: {
          target: "open",
          actions: ["invokeOnOpen"]
        },
        ARROW_LEFT: [{
          cond: "!multiple && hasSelectedItems",
          actions: ["selectPreviousItem"]
        }, {
          cond: "!multiple",
          actions: ["selectLastItem"]
        }],
        ARROW_RIGHT: [{
          cond: "!multiple && hasSelectedItems",
          actions: ["selectNextItem"]
        }, {
          cond: "!multiple",
          actions: ["selectFirstItem"]
        }],
        HOME: {
          cond: "!multiple",
          actions: ["selectFirstItem"]
        },
        END: {
          cond: "!multiple",
          actions: ["selectLastItem"]
        },
        TYPEAHEAD: {
          cond: "!multiple",
          actions: ["selectMatchingItem"]
        }
      }
    },
    open: {
      tags: ["open"],
      entry: ["focusContent", "highlightFirstSelectedItem"],
      exit: ["scrollContentToTop"],
      activities: ["trackDismissableElement", "computePlacement", "scrollToHighlightedItem", "proxyTabFocus"],
      on: {
        CLOSE: {
          target: "focused",
          actions: ["clearHighlightedItem", "invokeOnClose"]
        },
        TRIGGER_CLICK: {
          target: "focused",
          actions: ["clearHighlightedItem", "invokeOnClose"]
        },
        ITEM_CLICK: [{
          cond: "closeOnSelect",
          target: "focused",
          actions: ["selectHighlightedItem", "clearHighlightedItem", "invokeOnClose"]
        }, {
          cond: "multiple",
          actions: ["selectHighlightedItem"]
        }, {
          actions: ["selectHighlightedItem", "clearHighlightedItem"]
        }],
        TRIGGER_KEY: [{
          cond: "closeOnSelect",
          target: "focused",
          actions: ["selectHighlightedItem", "clearHighlightedItem", "invokeOnClose"]
        }, {
          cond: "multiple",
          actions: ["selectHighlightedItem"]
        }, {
          actions: ["selectHighlightedItem", "clearHighlightedItem"]
        }],
        BLUR: [{
          cond: "selectOnBlur && hasHighlightedItem",
          target: "idle",
          actions: ["selectHighlightedItem", "invokeOnClose", "clearHighlightedItem"]
        }, {
          cond: "isTargetFocusable",
          target: "idle",
          actions: ["clearHighlightedItem", "invokeOnClose"]
        }, {
          target: "focused",
          actions: ["clearHighlightedItem", "invokeOnClose"]
        }],
        HOME: {
          actions: ["highlightFirstItem"]
        },
        END: {
          actions: ["highlightLastItem"]
        },
        ARROW_DOWN: [{
          cond: "hasHighlightedItem",
          actions: ["highlightNextItem"]
        }, {
          actions: ["highlightFirstItem"]
        }],
        ARROW_UP: [{
          cond: "hasHighlightedItem",
          actions: ["highlightPreviousItem"]
        }, {
          actions: ["highlightLastItem"]
        }],
        TYPEAHEAD: {
          actions: ["highlightMatchingItem"]
        },
        POINTER_MOVE: {
          actions: ["highlightItem"]
        },
        POINTER_LEAVE: {
          actions: ["clearHighlightedItem"]
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
    "hasSelectedItems": ctx => ctx["hasSelectedItems"],
    "!multiple && hasSelectedItems": ctx => ctx["!multiple && hasSelectedItems"],
    "!multiple": ctx => ctx["!multiple"],
    "closeOnSelect": ctx => ctx["closeOnSelect"],
    "multiple": ctx => ctx["multiple"],
    "selectOnBlur && hasHighlightedItem": ctx => ctx["selectOnBlur && hasHighlightedItem"],
    "isTargetFocusable": ctx => ctx["isTargetFocusable"],
    "hasHighlightedItem": ctx => ctx["hasHighlightedItem"]
  }
});