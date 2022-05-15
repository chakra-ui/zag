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
  id: "menu",
  initial: "unknown",
  context: {
    "isTriggerItem": false,
    "!isSubmenu": false,
    "!isSubmenu": false,
    "isTriggerItem && isParentActiveItem": false,
    "isKeyboardEvent": false,
    "isTriggerItem": false,
    "!isTriggerItem": false,
    "hasActiveId": false,
    "hasActiveId": false,
    "isSubmenu": false,
    "isTriggerActiveItem": false,
    "isTriggerActiveItem": false,
    "isSubmenu": false,
    "!isMenuFocused && !isTriggerActiveItem && !suspendPointer && !isActiveItem": false,
    "!suspendPointer && !isActiveItem": false,
    "!isActiveItem": false,
    "!isTriggerItem && !suspendPointer": false,
    "!isTriggerActiveItem && !isActiveItemFocusable && closeOnSelect": false,
    "!isTriggerActiveItem && !isActiveItemFocusable": false
  },
  on: {
    SET_PARENT: {
      actions: "setParentMenu"
    },
    SET_CHILD: {
      actions: "setChildMenu"
    },
    OPEN: {
      target: "open",
      actions: "focusFirstItem"
    },
    CLOSE: "closed",
    SET_POINTER_EXIT: {
      cond: "isTriggerItem",
      actions: "setPointerExit"
    },
    RESTORE_FOCUS: {
      actions: "restoreFocus"
    },
    SET_VALUE: {
      actions: ["setOptionValue", "invokeOnValueChange"]
    },
    SET_ACTIVE_ID: {
      actions: "setActiveId"
    },
    UPDATE_CONTEXT: {
      actions: "updateContext"
    }
  },
  states: {
    unknown: {
      on: {
        SETUP: {
          target: "idle",
          actions: "setupDocument"
        }
      }
    },
    idle: {
      on: {
        CONTEXT_MENU_START: {
          target: "opening:contextmenu",
          actions: "setAnchorPoint"
        },
        CONTEXT_MENU: {
          target: "open",
          actions: "setAnchorPoint"
        },
        TRIGGER_CLICK: {
          cond: "!isSubmenu",
          target: "open"
        },
        TRIGGER_FOCUS: {
          cond: "!isSubmenu",
          target: "closed"
        },
        TRIGGER_POINTERMOVE: {
          cond: "isTriggerItem && isParentActiveItem",
          target: "opening"
        }
      }
    },
    "opening:contextmenu": {
      after: {
        LONG_PRESS_DELAY: "open"
      },
      on: {
        CONTEXT_MENU_CANCEL: "closed"
      }
    },
    opening: {
      after: {
        SUBMENU_OPEN_DELAY: "open"
      },
      on: {
        BLUR: "closed",
        TRIGGER_POINTERLEAVE: "closed"
      }
    },
    closing: {
      tags: ["visible"],
      activities: ["trackPointerMove", "computePlacement"],
      after: {
        SUBMENU_CLOSE_DELAY: {
          target: "closed",
          actions: ["focusParentMenu", "restoreParentFocus"]
        }
      },
      on: {
        MENU_POINTERENTER: {
          target: "open",
          actions: "clearIntentPolygon"
        },
        POINTER_MOVED_AWAY_FROM_SUBMENU: {
          target: "closed",
          actions: "focusParentMenu"
        }
      }
    },
    closed: {
      entry: ["clearActiveId", "focusTrigger", "clearAnchorPoint", "clearPointerDownNode", "resumePointer", "closeChildMenus"],
      on: {
        CONTEXT_MENU_START: {
          target: "opening:contextmenu",
          actions: "setAnchorPoint"
        },
        CONTEXT_MENU: {
          target: "open",
          actions: "setAnchorPoint"
        },
        TRIGGER_CLICK: [{
          cond: "isKeyboardEvent",
          target: "open",
          actions: "focusFirstItem"
        }, {
          target: "open"
        }],
        TRIGGER_POINTERMOVE: {
          cond: "isTriggerItem",
          target: "opening"
        },
        TRIGGER_BLUR: "idle",
        ARROW_DOWN: {
          target: "open",
          actions: "focusFirstItem"
        },
        ARROW_UP: {
          target: "open",
          actions: "focusLastItem"
        }
      }
    },
    open: {
      tags: ["visible"],
      activities: ["trackPointerDown", "computePlacement"],
      entry: ["focusMenu", "resumePointer"],
      on: {
        TRIGGER_CLICK: {
          cond: "!isTriggerItem",
          target: "closed"
        },
        ARROW_UP: [{
          cond: "hasActiveId",
          actions: ["focusPrevItem", "focusMenu"]
        }, {
          actions: "focusLastItem"
        }],
        ARROW_DOWN: [{
          cond: "hasActiveId",
          actions: ["focusNextItem", "focusMenu"]
        }, {
          actions: "focusFirstItem"
        }],
        ARROW_LEFT: {
          cond: "isSubmenu",
          target: "closed",
          actions: "focusParentMenu"
        },
        HOME: {
          actions: ["focusFirstItem", "focusMenu"]
        },
        END: {
          actions: ["focusLastItem", "focusMenu"]
        },
        BLUR: {
          target: "closed",
          actions: "closeParentMenus"
        },
        ARROW_RIGHT: {
          cond: "isTriggerActiveItem",
          actions: "openSubmenu"
        },
        ENTER: [{
          cond: "isTriggerActiveItem",
          actions: "openSubmenu"
        }, {
          target: "closed",
          actions: ["invokeOnSelect", "clickActiveOptionIfNeeded", "closeParentMenus"]
        }],
        ESCAPE: [{
          cond: "isSubmenu",
          target: "closed",
          actions: "closeParentMenus"
        }, {
          target: "closed"
        }],
        ITEM_POINTERMOVE: [{
          cond: "!isMenuFocused && !isTriggerActiveItem && !suspendPointer && !isActiveItem",
          actions: ["focusItem", "focusMenu", "closeChildMenus"]
        }, {
          cond: "!suspendPointer && !isActiveItem",
          actions: "focusItem"
        }, {
          cond: "!isActiveItem",
          actions: "setHoveredItem"
        }],
        ITEM_POINTERLEAVE: {
          cond: "!isTriggerItem && !suspendPointer",
          actions: "clearActiveId"
        },
        ITEM_CLICK: [{
          cond: "!isTriggerActiveItem && !isActiveItemFocusable && closeOnSelect",
          target: "closed",
          actions: ["invokeOnSelect", "closeParentMenus", "changeOptionValue", "invokeOnValueChange"]
        }, {
          cond: "!isTriggerActiveItem && !isActiveItemFocusable",
          actions: ["invokeOnSelect", "changeOptionValue", "invokeOnValueChange"]
        }],
        TRIGGER_POINTERLEAVE: {
          target: "closing",
          actions: "setIntentPolygon"
        },
        TYPEAHEAD: {
          actions: "focusMatchedItem"
        },
        FOCUS_MENU: {
          actions: "focusMenu"
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
    "isTriggerItem": ctx => ctx["isTriggerItem"],
    "!isSubmenu": ctx => ctx["!isSubmenu"],
    "isTriggerItem && isParentActiveItem": ctx => ctx["isTriggerItem && isParentActiveItem"],
    "isKeyboardEvent": ctx => ctx["isKeyboardEvent"],
    "!isTriggerItem": ctx => ctx["!isTriggerItem"],
    "hasActiveId": ctx => ctx["hasActiveId"],
    "isSubmenu": ctx => ctx["isSubmenu"],
    "isTriggerActiveItem": ctx => ctx["isTriggerActiveItem"],
    "!isMenuFocused && !isTriggerActiveItem && !suspendPointer && !isActiveItem": ctx => ctx["!isMenuFocused && !isTriggerActiveItem && !suspendPointer && !isActiveItem"],
    "!suspendPointer && !isActiveItem": ctx => ctx["!suspendPointer && !isActiveItem"],
    "!isActiveItem": ctx => ctx["!isActiveItem"],
    "!isTriggerItem && !suspendPointer": ctx => ctx["!isTriggerItem && !suspendPointer"],
    "!isTriggerActiveItem && !isActiveItemFocusable && closeOnSelect": ctx => ctx["!isTriggerActiveItem && !isActiveItemFocusable && closeOnSelect"],
    "!isTriggerActiveItem && !isActiveItemFocusable": ctx => ctx["!isTriggerActiveItem && !isActiveItemFocusable"]
  }
});