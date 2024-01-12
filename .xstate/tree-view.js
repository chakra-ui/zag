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
    "isBranchExpanded": false,
    "isBranchFocused && isBranchExpanded": false
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
        "ITEM.ARROW_LEFT": {
          actions: ["focusBranchTrigger"]
        },
        "BRANCH.ARROW_LEFT": [{
          cond: "isBranchExpanded",
          actions: ["collapseBranch"]
        }, {
          actions: ["focusBranchTrigger"]
        }],
        "BRANCH.ARROW_RIGHT": [{
          cond: "isBranchFocused && isBranchExpanded",
          actions: ["focusBranchFirstItem"]
        }, {
          actions: ["expandBranch"]
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
        "BRANCH.CLICK": {
          actions: ["selectItem", "toggleBranch"]
        },
        "BRANCH.TOGGLE": {
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
    "isBranchExpanded": ctx => ctx["isBranchExpanded"],
    "isBranchFocused && isBranchExpanded": ctx => ctx["isBranchFocused && isBranchExpanded"]
  }
});