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
    "hasHighlightedItem": false,
    "hasHighlightedItem": false,
    "selectOnTab": false
  },
  initial: "idle",
  on: {
    HIGHLIGHT_ITEM: {
      actions: ["setHighlightedItem"]
    },
    SELECT_ITEM: {
      actions: ["selectItem"]
    },
    CLEAR_VALUE: {
      actions: ["clearSelectedItems"]
    },
    CLEAR_ITEM: {
      actions: ["clearItem"]
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
      activities: ["trackInteractOutside", "computePlacement", "scrollToHighlightedItem", "proxyTabFocus"],
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
        BLUR: {
          target: "focused",
          actions: ["clearHighlightedItem", "invokeOnClose"]
        },
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
        },
        TAB: [{
          cond: "selectOnTab",
          target: "idle",
          actions: ["selectHighlightedItem", "invokeOnClose", "clearHighlightedItem"]
        }, {
          target: "idle",
          actions: ["invokeOnClose", "clearHighlightedItem"]
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
    "hasSelectedItems": ctx => ctx["hasSelectedItems"],
    "!multiple && hasSelectedItems": ctx => ctx["!multiple && hasSelectedItems"],
    "!multiple": ctx => ctx["!multiple"],
    "closeOnSelect": ctx => ctx["closeOnSelect"],
    "multiple": ctx => ctx["multiple"],
    "hasHighlightedItem": ctx => ctx["hasHighlightedItem"],
    "selectOnTab": ctx => ctx["selectOnTab"]
  }
});