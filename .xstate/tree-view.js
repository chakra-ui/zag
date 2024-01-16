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
    "isMultipleSelection && moveFocus": false,
    "isMultipleSelection": false,
    "isShiftKey && isMultipleSelection": false,
    "isShiftKey && isMultipleSelection": false,
    "isBranchExpanded": false,
    "isBranchFocused && isBranchExpanded": false,
    "isShiftKey && isMultipleSelection": false,
    "isShiftKey && isMultipleSelection": false,
    "isCtrlKey && isMultipleSelection": false,
    "isShiftKey && isMultipleSelection": false,
    "isCtrlKey && isMultipleSelection": false,
    "isShiftKey && isMultipleSelection": false
  },
  on: {
    "EXPANDED.SET": {
      actions: ["setExpanded"]
    },
    "SELECTED.SET": {
      actions: ["setSelected"]
    },
    "SELECTED.ALL": [{
      cond: "isMultipleSelection && moveFocus",
      actions: ["selectAllItems", "focusTreeLastItem"]
    }, {
      cond: "isMultipleSelection",
      actions: ["selectAllItems"]
    }],
    "EXPANDED.ALL": {
      actions: ["expandAllBranches"]
    }
  },
  activities: ["trackChildrenMutation"],
  entry: ["setFocusableNode"],
  on: {
    UPDATE_CONTEXT: {
      actions: "updateContext"
    }
  },
  states: {
    idle: {
      on: {
        "ITEM.FOCUS": {
          actions: ["setFocusedItem"]
        },
        "ITEM.ARROW_DOWN": [{
          cond: "isShiftKey && isMultipleSelection",
          actions: ["focusTreeNextItem", "extendSelectionToNextItem"]
        }, {
          actions: ["focusTreeNextItem"]
        }],
        "ITEM.ARROW_UP": [{
          cond: "isShiftKey && isMultipleSelection",
          actions: ["focusTreePrevItem", "extendSelectionToPrevItem"]
        }, {
          actions: ["focusTreePrevItem"]
        }],
        "ITEM.ARROW_LEFT": {
          actions: ["focusBranchControl"]
        },
        "BRANCH.ARROW_LEFT": [{
          cond: "isBranchExpanded",
          actions: ["collapseBranch"]
        }, {
          actions: ["focusBranchControl"]
        }],
        "BRANCH.ARROW_RIGHT": [{
          cond: "isBranchFocused && isBranchExpanded",
          actions: ["focusBranchFirstItem"]
        }, {
          actions: ["expandBranch"]
        }],
        "EXPAND.SIBLINGS": {
          actions: ["expandSiblingBranches"]
        },
        "ITEM.HOME": [{
          cond: "isShiftKey && isMultipleSelection",
          actions: ["extendSelectionToFirstItem", "focusTreeFirstItem"]
        }, {
          actions: ["focusTreeFirstItem"]
        }],
        "ITEM.END": [{
          cond: "isShiftKey && isMultipleSelection",
          actions: ["extendSelectionToLastItem", "focusTreeLastItem"]
        }, {
          actions: ["focusTreeLastItem"]
        }],
        "ITEM.CLICK": [{
          cond: "isCtrlKey && isMultipleSelection",
          actions: ["addOrRemoveItemFromSelection"]
        }, {
          cond: "isShiftKey && isMultipleSelection",
          actions: ["extendSelectionToItem"]
        }, {
          actions: ["selectItem"]
        }],
        "BRANCH.CLICK": [{
          cond: "isCtrlKey && isMultipleSelection",
          actions: ["addOrRemoveItemFromSelection"]
        }, {
          cond: "isShiftKey && isMultipleSelection",
          actions: ["extendSelectionToItem"]
        },
        // TODO: consider supporting click to expand (instead of using the toggle)
        {
          actions: ["selectItem", "toggleBranch"]
        }],
        "BRANCH_TOGGLE.CLICK": {
          actions: ["toggleBranch"]
        },
        "TREE.TYPEAHEAD": {
          actions: ["focusMatchedItem"]
        },
        "TREE.BLUR": {
          actions: ["clearFocusedItem", "setFocusableNode"]
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
    "isMultipleSelection && moveFocus": ctx => ctx["isMultipleSelection && moveFocus"],
    "isMultipleSelection": ctx => ctx["isMultipleSelection"],
    "isShiftKey && isMultipleSelection": ctx => ctx["isShiftKey && isMultipleSelection"],
    "isBranchExpanded": ctx => ctx["isBranchExpanded"],
    "isBranchFocused && isBranchExpanded": ctx => ctx["isBranchFocused && isBranchExpanded"],
    "isCtrlKey && isMultipleSelection": ctx => ctx["isCtrlKey && isMultipleSelection"]
  }
});