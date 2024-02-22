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
    "isNotItemFocused": false
  },
  on: {
    CLOSE: {
      target: "focused",
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
          target: "focused",
          actions: "setFocusedMenuId"
        }
      }
    },
    focused: {
      activities: ["trackPositioning"],
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
          actions: ["expandMenu", "focusMenu"],
          target: "open"
        }],
        ITEM_NEXT: {
          actions: "focusNextTrigger"
        },
        ITEM_PREV: {
          actions: "focusPrevTrigger"
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
      activities: ["trackPositioning", "trackInteractOutside"],
      on: {
        TRIGGER_CLICK: [{
          cond: "isExpanded",
          actions: ["collapseMenu"],
          target: "focused"
        }, {
          cond: "!isExpanded",
          actions: ["expandMenu", "focusMenu"]
        }],
        ITEM_NEXT: [{
          cond: "isNotItemFocused",
          actions: "highlightFirstItem"
        }, {
          actions: "highlightNextItem"
        }],
        ITEM_PREV: {
          actions: "highlightPrevItem"
        },
        HOME: {
          actions: "highlightFirstItem"
        },
        END: {
          actions: "highlightLastItem"
        },
        LINK_ACTIVE: {
          target: "focused",
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