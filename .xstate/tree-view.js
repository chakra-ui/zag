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
  id: "tree-view",
  initial: "idle",
  context: {
    "isBranchFocused && isBranchExpanded": false,
    "isBranchFocused && isBranchExpanded": false,
    "hasSelectedItems": false
  },
  entry: ["makeFirstTreeItemTabbable"],
  on: {
    UPDATE_CONTEXT: {
      actions: "updateContext"
    }
  },
  states: {
    idle: {
      on: {
        "ITEM.SELECT_ALL": {
          actions: ["selectAllItems"]
        },
        "ITEM.FOCUS": {
          actions: ["setFocusedItem"]
        },
        "ITEM.ARROW_DOWN": {
          actions: ["focusTreeNextItem"]
        },
        "ITEM.ARROW_UP": {
          actions: ["focusTreePrevItem"]
        },
        "ITEM.ARROW_LEFT": [{
          cond: "isBranchFocused && isBranchExpanded",
          actions: ["collapseItem"]
        }, {
          actions: ["focusBranchTrigger"]
        }],
        "BRANCH.ARROW_RIGHT": [{
          cond: "isBranchFocused && isBranchExpanded",
          actions: ["focusBranchFirstItem"]
        }, {
          actions: ["expandItem"]
        }],
        "ITEM.HOME": {
          actions: ["focusTreeFirstItem"]
        },
        "ITEM.END": {
          actions: ["focusTreeLastItem"]
        },
        "ITEM.CLICK": {
          actions: ["selectItem"]
        },
        "ITEM.BLUR": {
          actions: ["clearFocusedItem"]
        },
        "BRANCH.CLICK": {
          actions: ["selectItem", "toggleItem"]
        },
        "BRANCH.TOGGLE": {
          actions: ["toggleItem"]
        },
        "EXPANDED.SET": {
          actions: ["setExpanded"]
        },
        TYPEAHEAD: {
          actions: "focusMatchedItem"
        },
        "TREE.BLUR": [{
          cond: "hasSelectedItems",
          actions: ["makeFirstSelectedItemTabbable"]
        }, {
          actions: ["makeFirstTreeItemTabbable"]
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
    "isBranchFocused && isBranchExpanded": ctx => ctx["isBranchFocused && isBranchExpanded"],
    "hasSelectedItems": ctx => ctx["hasSelectedItems"]
  }
});