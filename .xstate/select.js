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
    "isTriggerClickEvent": false,
    "isOpenControlled": false,
    "isOpenControlled": false,
    "isTriggerClickEvent": false,
    "isTriggerArrowUpEvent": false,
    "isTriggerArrowDownEvent || isTriggerEnterEvent": false,
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
    "isOpenControlled": false,
    "isOpenControlled": false,
    "closeOnSelect && isOpenControlled": false,
    "closeOnSelect": false,
    "hasHighlightedItem && loop && isLastItemHighlighted": false,
    "hasHighlightedItem": false,
    "hasHighlightedItem && loop && isFirstItemHighlighted": false,
    "hasHighlightedItem": false
  },
  initial: ctx.open ? "open" : "idle",
  entry: ["syncSelectElement"],
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
    "CLEAR.CLICK": {
      actions: ["clearSelectedItems", "focusTriggerEl"]
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
        "CONTROLLED.OPEN": [{
          cond: "isTriggerClickEvent",
          target: "open",
          actions: ["setInitialFocus", "highlightFirstSelectedItem"]
        }, {
          target: "open",
          actions: ["setInitialFocus"]
        }],
        "TRIGGER.CLICK": [{
          cond: "isOpenControlled",
          actions: ["invokeOnOpen"]
        }, {
          target: "open",
          actions: ["invokeOnOpen", "setInitialFocus", "highlightFirstSelectedItem"]
        }],
        "TRIGGER.FOCUS": {
          target: "focused"
        },
        OPEN: [{
          cond: "isOpenControlled",
          actions: ["invokeOnOpen"]
        }, {
          target: "open",
          actions: ["setInitialFocus", "invokeOnOpen"]
        }]
      }
    },
    focused: {
      tags: ["closed"],
      on: {
        "CONTROLLED.OPEN": [{
          cond: "isTriggerClickEvent",
          target: "open",
          actions: ["setInitialFocus", "highlightFirstSelectedItem"]
        }, {
          cond: "isTriggerArrowUpEvent",
          target: "open",
          actions: ["setInitialFocus", "highlightComputedLastItem"]
        }, {
          cond: "isTriggerArrowDownEvent || isTriggerEnterEvent",
          target: "open",
          actions: ["setInitialFocus", "highlightComputedFirstItem"]
        }, {
          target: "open",
          actions: ["setInitialFocus"]
        }],
        OPEN: [{
          cond: "isOpenControlled",
          actions: ["invokeOnOpen"]
        }, {
          target: "open",
          actions: ["setInitialFocus", "invokeOnOpen"]
        }],
        "TRIGGER.BLUR": {
          target: "idle"
        },
        "TRIGGER.CLICK": [{
          cond: "isOpenControlled",
          actions: ["invokeOnOpen"]
        }, {
          target: "open",
          actions: ["setInitialFocus", "invokeOnOpen", "highlightFirstSelectedItem"]
        }],
        "TRIGGER.ENTER": [{
          cond: "isOpenControlled",
          actions: ["invokeOnOpen"]
        }, {
          target: "open",
          actions: ["setInitialFocus", "invokeOnOpen", "highlightComputedFirstItem"]
        }],
        "TRIGGER.ARROW_UP": [{
          cond: "isOpenControlled",
          actions: ["invokeOnOpen"]
        }, {
          target: "open",
          actions: ["setInitialFocus", "invokeOnOpen", "highlightComputedLastItem"]
        }],
        "TRIGGER.ARROW_DOWN": [{
          cond: "isOpenControlled",
          actions: ["invokeOnOpen"]
        }, {
          target: "open",
          actions: ["setInitialFocus", "invokeOnOpen", "highlightComputedFirstItem"]
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
      exit: ["scrollContentToTop"],
      activities: ["trackDismissableElement", "computePlacement", "scrollToHighlightedItem"],
      on: {
        "CONTROLLED.CLOSE": {
          target: "focused",
          actions: ["focusTriggerEl", "clearHighlightedItem"]
        },
        CLOSE: [{
          cond: "isOpenControlled",
          actions: ["invokeOnClose"]
        }, {
          target: "focused",
          actions: ["invokeOnClose", "focusTriggerEl", "clearHighlightedItem"]
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
          actions: ["selectHighlightedItem", "invokeOnClose", "focusTriggerEl", "clearHighlightedItem"]
        }, {
          actions: ["selectHighlightedItem"]
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
    "isTriggerClickEvent": ctx => ctx["isTriggerClickEvent"],
    "isOpenControlled": ctx => ctx["isOpenControlled"],
    "isTriggerArrowUpEvent": ctx => ctx["isTriggerArrowUpEvent"],
    "isTriggerArrowDownEvent || isTriggerEnterEvent": ctx => ctx["isTriggerArrowDownEvent || isTriggerEnterEvent"],
    "!multiple && hasSelectedItems": ctx => ctx["!multiple && hasSelectedItems"],
    "!multiple": ctx => ctx["!multiple"],
    "closeOnSelect && isOpenControlled": ctx => ctx["closeOnSelect && isOpenControlled"],
    "closeOnSelect": ctx => ctx["closeOnSelect"],
    "hasHighlightedItem && loop && isLastItemHighlighted": ctx => ctx["hasHighlightedItem && loop && isLastItemHighlighted"],
    "hasHighlightedItem": ctx => ctx["hasHighlightedItem"],
    "hasHighlightedItem && loop && isFirstItemHighlighted": ctx => ctx["hasHighlightedItem && loop && isFirstItemHighlighted"]
  }
});