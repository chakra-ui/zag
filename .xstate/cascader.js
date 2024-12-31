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
  id: "cascader",
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
    "isOpenControlled": false,
    "isOpenControlled": false,
    "isLeafNode && closeOnSelect && isOpenControlled": false,
    "isLeafNode && closeOnSelect": false,
    "isLeafNode": false,
    "isClickTrigger": false,
    "hasHighlightedItem": false,
    "hasHighlightedItem": false,
    "hasHighlightedItem && loop && isLastItemHighlighted": false,
    "hasHighlightedItem": false,
    "hasHighlightedItem && loop && isFirstItemHighlighted": false,
    "hasHighlightedItem": false,
    "isHighlightedItemInSubLevel": false,
    "isOpenControlled": false,
    "hasHighlightedItem": false,
    "isHoverTrigger": false
  },
  initial: ctx.open ? "open" : "idle",
  entry: ["syncSelectedItems", "syncHighlightedItem"],
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
      on: {
        "CONTROLLED.OPEN": [{
          cond: "isTriggerClickEvent",
          target: "open",
          actions: ["setInitialFocus", "highlightLastSelectedItem"]
        }, {
          target: "open",
          actions: ["setInitialFocus"]
        }],
        "TRIGGER.CLICK": [{
          cond: "isOpenControlled",
          actions: ["invokeOnOpen"]
        }, {
          target: "open",
          actions: ["invokeOnOpen", "setInitialFocus", "highlightLastSelectedItem"]
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
          actions: ["setInitialFocus", "highlightLastSelectedItem"]
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
          actions: ["setInitialFocus", "invokeOnOpen", "highlightLastSelectedItem"]
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
        }]
      }
    },
    open: {
      tags: ["open"],
      exit: ["scrollListsToTop"],
      activities: ["trackDismissableElement", "computePlacement", "scrollToHighlightedItems"],
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
        "ITEM.CLICK": [
        // === Grouped transitions (based on `closeOnSelect` and `isOpenControlled`) ===
        {
          cond: "isLeafNode && closeOnSelect && isOpenControlled",
          actions: ["selectItemAtIndexPath", "invokeOnClose"]
        }, {
          cond: "isLeafNode && closeOnSelect",
          target: "focused",
          actions: ["selectItemAtIndexPath", "invokeOnClose", "focusTriggerEl", "clearHighlightedItem"]
        }, {
          cond: "isLeafNode",
          actions: ["highlightItem", "selectItemAtIndexPath"]
        },
        // ===
        {
          cond: "isClickTrigger",
          actions: ["highlightItem"]
        }],
        "CONTENT.HOME": [{
          cond: "hasHighlightedItem",
          actions: ["highlightFirstItem"]
        }, {
          actions: ["highlightFirstItemInRoot"]
        }],
        "CONTENT.END": [{
          cond: "hasHighlightedItem",
          actions: ["highlightLastItem"]
        }, {
          actions: ["highlightLastItemInRoot"]
        }],
        "CONTENT.ARROW_DOWN": [{
          cond: "hasHighlightedItem && loop && isLastItemHighlighted",
          actions: ["highlightFirstItem"]
        }, {
          cond: "hasHighlightedItem",
          actions: ["highlightNextItem"]
        }, {
          actions: ["highlightFirstItemInRoot"]
        }],
        "CONTENT.ARROW_UP": [{
          cond: "hasHighlightedItem && loop && isFirstItemHighlighted",
          actions: ["highlightLastItem"]
        }, {
          cond: "hasHighlightedItem",
          actions: ["highlightPreviousItem"]
        }, {
          actions: ["highlightLastItemInRoot"]
        }],
        "CONTENT.ARROW_LEFT": [{
          cond: "isHighlightedItemInSubLevel",
          actions: ["highlightItemParent"]
        }, {
          cond: "isOpenControlled",
          actions: ["invokeOnClose"]
        }, {
          target: "focused",
          actions: ["invokeOnClose", "focusTriggerEl", "clearHighlightedItem"]
        }],
        "CONTENT.ARROW_RIGHT": {
          cond: "hasHighlightedItem",
          actions: ["highlightItemFirstChild"]
        },
        "ITEM.POINTER_MOVE": {
          cond: "isHoverTrigger",
          actions: ["highlightItem"]
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
    "isLeafNode && closeOnSelect && isOpenControlled": ctx => ctx["isLeafNode && closeOnSelect && isOpenControlled"],
    "isLeafNode && closeOnSelect": ctx => ctx["isLeafNode && closeOnSelect"],
    "isLeafNode": ctx => ctx["isLeafNode"],
    "isClickTrigger": ctx => ctx["isClickTrigger"],
    "hasHighlightedItem": ctx => ctx["hasHighlightedItem"],
    "hasHighlightedItem && loop && isLastItemHighlighted": ctx => ctx["hasHighlightedItem && loop && isLastItemHighlighted"],
    "hasHighlightedItem && loop && isFirstItemHighlighted": ctx => ctx["hasHighlightedItem && loop && isFirstItemHighlighted"],
    "isHighlightedItemInSubLevel": ctx => ctx["isHighlightedItemInSubLevel"],
    "isHoverTrigger": ctx => ctx["isHoverTrigger"]
  }
});