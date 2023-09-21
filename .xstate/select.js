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
    "HIGHLIGHTED_VALUE.SET": {
      actions: ["setHighlightedItem"]
    },
    "ITEM.SELECT": {
      actions: ["selectItem"]
    },
    "ITEM.CLEAR": {
      actions: ["clearItem"]
    },
    "VALUE.SET": {
      actions: ["setSelectedItems"]
    },
    "VALUE.CLEAR": {
      actions: ["clearSelectedItems"]
    },
    "COLLECTION.SET": {
      actions: ["setCollection"]
    },
    "POSITIONING.SET": {
      actions: ["setPositioning"]
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
        "TRIGGER.CLICK": {
          target: "open",
          actions: ["invokeOnOpen", "highlightFirstSelectedItem"]
        },
        "TRIGGER.FOCUS": {
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
      entry: ["focusTriggerEl"],
      on: {
        OPEN: {
          target: "open",
          actions: ["invokeOnOpen"]
        },
        "TRIGGER.BLUR": {
          target: "idle"
        },
        "TRIGGER.CLICK": {
          target: "open",
          actions: ["invokeOnOpen", "highlightFirstSelectedItem"]
        },
        "TRIGGER.ENTER": [{
          cond: "hasSelectedItems",
          target: "open",
          actions: ["highlightFirstSelectedItem", "invokeOnOpen"]
        }, {
          target: "open",
          actions: ["highlightFirstItem", "invokeOnOpen"]
        }],
        "TRIGGER.ARROW_UP": [{
          cond: "hasSelectedItems",
          target: "open",
          actions: ["highlightFirstSelectedItem", "invokeOnOpen"]
        }, {
          target: "open",
          actions: ["highlightLastItem", "invokeOnOpen"]
        }],
        "TRIGGER.ARROW_DOWN": [{
          cond: "hasSelectedItems",
          target: "open",
          actions: ["highlightFirstSelectedItem", "invokeOnOpen"]
        }, {
          target: "open",
          actions: ["highlightFirstItem", "invokeOnOpen"]
        }],
        "TRIGGER.ARROW_LEFT": [{
          cond: "!multiple && hasSelectedItems",
          actions: ["selectPreviousItem"]
        }, {
          cond: "!multiple",
          actions: ["selectLastItem"]
        }],
        "TRIGGER.ARROW_RIGHT": [{
          cond: "!multiple && hasSelectedItems",
          actions: ["selectNextItem"]
        }, {
          cond: "!multiple",
          actions: ["selectFirstItem"]
        }],
        "TRIGGER.HOME": {
          cond: "!multiple",
          actions: ["selectFirstItem"]
        },
        "TRIGGER.END": {
          cond: "!multiple",
          actions: ["selectLastItem"]
        },
        "TRIGGER.TYPEAHEAD": {
          cond: "!multiple",
          actions: ["selectMatchingItem"]
        }
      }
    },
    open: {
      tags: ["open"],
      entry: ["focusContentEl"],
      exit: ["scrollContentToTop"],
      activities: ["trackDismissableElement", "computePlacement", "scrollToHighlightedItem", "proxyTabFocus"],
      on: {
        CLOSE: {
          target: "focused",
          actions: ["clearHighlightedItem", "invokeOnClose"]
        },
        "TRIGGER.CLICK": {
          target: "focused",
          actions: ["clearHighlightedItem", "invokeOnClose"]
        },
        "ITEM.CLICK": [{
          cond: "closeOnSelect",
          target: "focused",
          actions: ["selectHighlightedItem", "clearHighlightedItem", "invokeOnClose"]
        }, {
          cond: "multiple",
          actions: ["selectHighlightedItem"]
        }, {
          actions: ["selectHighlightedItem", "clearHighlightedItem"]
        }],
        "CONTENT.ENTER": [{
          cond: "closeOnSelect",
          target: "focused",
          actions: ["selectHighlightedItem", "clearHighlightedItem", "invokeOnClose"]
        }, {
          cond: "multiple",
          actions: ["selectHighlightedItem"]
        }, {
          actions: ["selectHighlightedItem", "clearHighlightedItem"]
        }],
        "CONTENT.INTERACT_OUTSIDE": [{
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
        "CONTENT.HOME": {
          actions: ["highlightFirstItem"]
        },
        "CONTENT.END": {
          actions: ["highlightLastItem"]
        },
        "CONTENT.ARROW_DOWN": [{
          cond: "hasHighlightedItem",
          actions: ["highlightNextItem"]
        }, {
          actions: ["highlightFirstItem"]
        }],
        "CONTENT.ARROW_UP": [{
          cond: "hasHighlightedItem",
          actions: ["highlightPreviousItem"]
        }, {
          actions: ["highlightLastItem"]
        }],
        "CONTENT.TYPEAHEAD": {
          actions: ["highlightMatchingItem"]
        },
        "ITEM.POINTER_MOVE": {
          actions: ["highlightItem"]
        },
        "ITEM.POINTER_LEAVE": {
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