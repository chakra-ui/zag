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
    "isMultipleSelection": false,
    "isShiftKey && isMultipleSelection": false,
    "isShiftKey && isMultipleSelection": false,
    "isBranchExpanded": false,
    "isBranchFocused && isBranchExpanded": false,
    "isShiftKey && isMultipleSelection": false,
    "isShiftKey && isMultipleSelection": false,
    "isShiftKey && isMultipleSelection": false,
    "isShiftKey && isMultipleSelection": false
  },
  on: {
    "EXPANDED.SET": {
      actions: ["setExpanded"]
    },
    "SELECTED.SET": {
      actions: ["setSelected"]
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
        "ITEM.REMOVE": {
          actions: ["setSelected", "setFocusedItem"]
        },
        "ITEM.SELECT_ALL": {
          cond: "isMultipleSelection",
          actions: ["selectAllItems", "focusTreeLastItem"]
        },
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
        "BRANCH.EXPAND_LEVEL": {
          actions: ["expandSameLevelBranches"]
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
          cond: "isShiftKey && isMultipleSelection",
          actions: ["extendSelectionToItem"]
        }, {
          actions: ["selectItem"]
        }],
        "BRANCH.CLICK": [{
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
        TYPEAHEAD: {
          actions: "focusMatchedItem"
        },
        "TREE.BLUR": {
          actions: ["clearFocusedItem"]
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
    "isMultipleSelection": ctx => ctx["isMultipleSelection"],
    "isShiftKey && isMultipleSelection": ctx => ctx["isShiftKey && isMultipleSelection"],
    "isBranchExpanded": ctx => ctx["isBranchExpanded"],
    "isBranchFocused && isBranchExpanded": ctx => ctx["isBranchFocused && isBranchExpanded"]
  }
});