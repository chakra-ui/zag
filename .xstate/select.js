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
    "isOpenControlled": false,
    "isOpenControlled": false,
    "isOpenControlled": false,
    "isOpenControlled": false,
    "isOpenControlled": false,
    "isOpenControlled": false,
    "isOpenControlled": false,
    "!multiple && hasSelectedItems": false,
    "!multiple": false,
    "!multiple && hasSelectedItems": false,
    "!multiple": false,
    "!multiple": false,
    "!multiple": false,
    "!multiple": false,
    "shouldRestoreFocus": false,
    "isOpenControlled": false,
    "isOpenControlled": false,
    "closeOnSelect && isOpenControlled": false,
    "closeOnSelect": false,
    "selectOnBlur && hasHighlightedItem && isOpenControlled": false,
    "selectOnBlur && hasHighlightedItem": false,
    "shouldRestoreFocus && isOpenControlled": false,
    "shouldRestoreFocus": false,
    "isOpenControlled": false,
    "hasHighlightedItem && loop && isLastItemHighlighted": false,
    "hasHighlightedItem": false,
    "hasHighlightedItem && loop && isFirstItemHighlighted": false,
    "hasHighlightedItem": false
  },
  initial: ctx.open ? "open" : "idle",
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
        "CONTROLLED.OPEN": {
          target: "open",
          actions: ["highlightBasedOnPreviousEvent"]
        },
        "TRIGGER.CLICK": [{
          cond: "isOpenControlled",
          actions: ["invokeOnOpen"]
        }, {
          target: "open",
          actions: ["invokeOnOpen", "highlightFirstSelectedItem"]
        }],
        "TRIGGER.FOCUS": {
          target: "focused"
        },
        OPEN: [{
          cond: "isOpenControlled",
          actions: ["invokeOnOpen"]
        }, {
          target: "open",
          actions: ["invokeOnOpen"]
        }]
      }
    },
    focused: {
      tags: ["closed"],
      entry: ["focusTriggerEl"],
      on: {
        "CONTROLLED.OPEN": {
          target: "open",
          actions: ["highlightBasedOnPreviousEvent"]
        },
        OPEN: [{
          cond: "isOpenControlled",
          actions: ["invokeOnOpen"]
        }, {
          target: "open",
          actions: ["invokeOnOpen"]
        }],
        "TRIGGER.BLUR": {
          target: "idle"
        },
        "TRIGGER.CLICK": [{
          cond: "isOpenControlled",
          actions: ["invokeOnOpen"]
        }, {
          target: "open",
          actions: ["invokeOnOpen", "highlightFirstSelectedItem"]
        }],
        "TRIGGER.ENTER": [{
          cond: "isOpenControlled",
          actions: ["invokeOnOpen"]
        }, {
          target: "open",
          actions: ["invokeOnOpen", "highlightComputedFirstItem"]
        }],
        "TRIGGER.ARROW_UP": [{
          cond: "isOpenControlled",
          actions: ["invokeOnOpen"]
        }, {
          target: "open",
          actions: ["invokeOnOpen", "highlightComputedLastItem"]
        }],
        "TRIGGER.ARROW_DOWN": [{
          cond: "isOpenControlled",
          actions: ["invokeOnOpen"]
        }, {
          target: "open",
          actions: ["invokeOnOpen", "highlightComputedFirstItem"]
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
        "CONTROLLED.CLOSE": [{
          cond: "shouldRestoreFocus",
          target: "focused",
          actions: ["clearHighlightedItem"]
        }, {
          target: "idle",
          actions: ["clearHighlightedItem"]
        }],
        CLOSE: [{
          cond: "isOpenControlled",
          actions: ["invokeOnClose"]
        }, {
          target: "focused",
          actions: ["invokeOnClose", "clearHighlightedItem"]
        }],
        "TRIGGER.CLICK": [{
          cond: "isOpenControlled",
          actions: ["invokeOnClose"]
        }, {
          target: "focused",
          actions: ["invokeOnClose", "clearHighlightedItem"]
        }],
        "ITEM.CLICK": [{
          cond: "closeOnSelect && isOpenControlled",
          actions: ["selectHighlightedItem", "invokeOnClose"]
        }, {
          cond: "closeOnSelect",
          target: "focused",
          actions: ["selectHighlightedItem", "invokeOnClose", "clearHighlightedItem"]
        }, {
          actions: ["selectHighlightedItem"]
        }],
        "CONTENT.INTERACT_OUTSIDE": [
        // == group 1 ==
        {
          cond: "selectOnBlur && hasHighlightedItem && isOpenControlled",
          actions: ["selectHighlightedItem", "invokeOnClose"]
        }, {
          cond: "selectOnBlur && hasHighlightedItem",
          target: "idle",
          actions: ["selectHighlightedItem", "invokeOnClose", "clearHighlightedItem"]
        },
        // == group 2 ==
        {
          cond: "shouldRestoreFocus && isOpenControlled",
          actions: ["invokeOnClose"]
        }, {
          cond: "shouldRestoreFocus",
          target: "focused",
          actions: ["invokeOnClose", "clearHighlightedItem"]
        },
        // == group 3 ==
        {
          cond: "isOpenControlled",
          actions: ["invokeOnClose"]
        }, {
          target: "idle",
          actions: ["invokeOnClose", "clearHighlightedItem"]
        }],
        "CONTENT.HOME": {
          actions: ["highlightFirstItem"]
        },
        "CONTENT.END": {
          actions: ["highlightLastItem"]
        },
        "CONTENT.ARROW_DOWN": [{
          cond: "hasHighlightedItem && loop && isLastItemHighlighted",
          actions: ["highlightFirstItem"]
        }, {
          cond: "hasHighlightedItem",
          actions: ["highlightNextItem"]
        }, {
          actions: ["highlightFirstItem"]
        }],
        "CONTENT.ARROW_UP": [{
          cond: "hasHighlightedItem && loop && isFirstItemHighlighted",
          actions: ["highlightLastItem"]
        }, {
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
        },
        "POSITIONING.SET": {
          actions: ["reposition"]
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
    "!multiple && hasSelectedItems": ctx => ctx["!multiple && hasSelectedItems"],
    "!multiple": ctx => ctx["!multiple"],
    "shouldRestoreFocus": ctx => ctx["shouldRestoreFocus"],
    "closeOnSelect && isOpenControlled": ctx => ctx["closeOnSelect && isOpenControlled"],
    "closeOnSelect": ctx => ctx["closeOnSelect"],
    "selectOnBlur && hasHighlightedItem && isOpenControlled": ctx => ctx["selectOnBlur && hasHighlightedItem && isOpenControlled"],
    "selectOnBlur && hasHighlightedItem": ctx => ctx["selectOnBlur && hasHighlightedItem"],
    "shouldRestoreFocus && isOpenControlled": ctx => ctx["shouldRestoreFocus && isOpenControlled"],
    "hasHighlightedItem && loop && isLastItemHighlighted": ctx => ctx["hasHighlightedItem && loop && isLastItemHighlighted"],
    "hasHighlightedItem": ctx => ctx["hasHighlightedItem"],
    "hasHighlightedItem && loop && isFirstItemHighlighted": ctx => ctx["hasHighlightedItem && loop && isFirstItemHighlighted"]
  }
});