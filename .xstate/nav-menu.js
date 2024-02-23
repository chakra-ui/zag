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
  id: "nav-menu",
  initial: "idle",
  context: {
    "isExpanded": false,
    "!isExpanded": false,
    "isExpanded": false,
    "!isExpanded": false,
    "isExpanded": false,
    "isNotItemFocused": false,
    "isExpanded": false,
    "isExpanded": false
  },
  on: {
    "PARENT.SET": {
      actions: "setParentMenu"
    },
    "CHILD.SET": {
      actions: "setChildMenu"
    },
    CLOSE: {
      target: "closed",
      actions: ["collapseMenu", "removeActiveContentId"]
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
        TRIGGER_FOCUS: {
          target: "closed",
          actions: "setFocusedMenuId"
        }
      }
    },
    closed: {
      tags: ["closed"],
      entry: ["clearAnchorPoint", "focusTrigger"],
      on: {
        TRIGGER_FOCUS: {
          actions: "setFocusedMenuId"
        },
        TRIGGER_BLUR: {
          target: "idle",
          actions: "setFocusedMenuId"
        },
        TRIGGER_CLICK: [{
          cond: "isExpanded",
          actions: ["collapseMenu"]
        }, {
          cond: "!isExpanded",
          actions: ["expandMenu"],
          target: "open"
        }],
        ARROW_LEFT: {
          actions: "focusPrevTrigger"
        },
        ARROW_RIGHT: {
          actions: "focusNextTrigger"
        },
        HOME: {
          actions: "focusFirstTrigger"
        },
        END: {
          actions: "focusLastTrigger"
        }
      }
    },
    open: {
      tags: ["open"],
      activities: ["trackPositioning", "trackInteractOutside"],
      on: {
        TRIGGER_FOCUS: {
          actions: ["setFocusedMenuId", "collapseMenu"],
          target: "closed"
        },
        TRIGGER_CLICK: [{
          cond: "isExpanded",
          actions: ["collapseMenu"],
          target: "closed"
        }, {
          cond: "!isExpanded",
          actions: ["expandMenu"]
        }],
        TO_FIRST_ITEM: {
          cond: "isExpanded",
          actions: "highlightFirstItem"
        },
        ITEM_NEXT: [{
          cond: "isNotItemFocused",
          actions: "highlightFirstItem"
        }, {
          actions: "highlightNextItem"
        }],
        ITEM_PREV: {
          actions: "highlightPrevItem"
        },
        ARROW_LEFT: {
          cond: "isExpanded",
          actions: ["focusPrevTrigger", "collapseMenu"],
          target: "closed"
        },
        ARROW_RIGHT: {
          cond: "isExpanded",
          actions: ["focusNextTrigger", "collapseMenu"],
          target: "closed"
        },
        HOME: {
          actions: "highlightFirstItem"
        },
        END: {
          actions: "highlightLastItem"
        },
        LINK_ACTIVE: {
          target: "closed",
          actions: ["collapseMenu", "setActiveLink"]
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
    "isExpanded": ctx => ctx["isExpanded"],
    "!isExpanded": ctx => ctx["!isExpanded"],
    "isNotItemFocused": ctx => ctx["isNotItemFocused"]
  }
});