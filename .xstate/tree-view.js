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
    "isShiftKey && isMultipleSelection": false,
    "openOnClick": false
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
      actions: ["selectAllNodes", "focusTreeLastNode"]
    }, {
      cond: "isMultipleSelection",
      actions: ["selectAllNodes"]
    }],
    "EXPANDED.ALL": {
      actions: ["expandAllBranches"]
    }
  },
  on: {
    UPDATE_CONTEXT: {
      actions: "updateContext"
    }
  },
  states: {
    idle: {
      on: {
        "NODE.FOCUS": {
          actions: ["setFocusedNode"]
        },
        "NODE.ARROW_DOWN": [{
          cond: "isShiftKey && isMultipleSelection",
          actions: ["focusTreeNextNode", "extendSelectionToNextNode"]
        }, {
          actions: ["focusTreeNextNode"]
        }],
        "NODE.ARROW_UP": [{
          cond: "isShiftKey && isMultipleSelection",
          actions: ["focusTreePrevNode", "extendSelectionToPrevNode"]
        }, {
          actions: ["focusTreePrevNode"]
        }],
        "NODE.ARROW_LEFT": {
          actions: ["focusBranchNode"]
        },
        "BRANCH_NODE.ARROW_LEFT": [{
          cond: "isBranchExpanded",
          actions: ["collapseBranch"]
        }, {
          actions: ["focusBranchNode"]
        }],
        "BRANCH_NODE.ARROW_RIGHT": [{
          cond: "isBranchFocused && isBranchExpanded",
          actions: ["focusBranchFirstNode"]
        }, {
          actions: ["expandBranch"]
        }],
        "SIBLINGS.EXPAND": {
          actions: ["expandSiblingBranches"]
        },
        "NODE.HOME": [{
          cond: "isShiftKey && isMultipleSelection",
          actions: ["extendSelectionToFirstNode", "focusTreeFirstNode"]
        }, {
          actions: ["focusTreeFirstNode"]
        }],
        "NODE.END": [{
          cond: "isShiftKey && isMultipleSelection",
          actions: ["extendSelectionToLastNode", "focusTreeLastNode"]
        }, {
          actions: ["focusTreeLastNode"]
        }],
        "NODE.CLICK": [{
          cond: "isCtrlKey && isMultipleSelection",
          actions: ["toggleNodeSelection"]
        }, {
          cond: "isShiftKey && isMultipleSelection",
          actions: ["extendSelectionToNode"]
        }, {
          actions: ["selectNode"]
        }],
        "BRANCH_NODE.CLICK": [{
          cond: "isCtrlKey && isMultipleSelection",
          actions: ["toggleNodeSelection"]
        }, {
          cond: "isShiftKey && isMultipleSelection",
          actions: ["extendSelectionToNode"]
        }, {
          cond: "openOnClick",
          actions: ["selectNode", "toggleBranchNode"]
        }, {
          actions: ["selectNode"]
        }],
        "BRANCH_TOGGLE.CLICK": {
          actions: ["toggleBranchNode"]
        },
        "TREE.TYPEAHEAD": {
          actions: ["focusMatchedNode"]
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
    "isCtrlKey && isMultipleSelection": ctx => ctx["isCtrlKey && isMultipleSelection"],
    "openOnClick": ctx => ctx["openOnClick"]
  }
});