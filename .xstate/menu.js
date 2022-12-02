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
  initial: "idle",
  context: {
    "!isSubmenu": false,
    "isSubmenu": false,
    "isTriggerItem": false,
    "!isTriggerItem": false,
    "hasFocusedItem": false,
    "hasFocusedItem": false,
    "isSubmenu": false,
    "isTriggerItemFocused": false,
    "isTriggerItemFocused": false,
    "closeOnSelect": false,
    "!suspendPointer && !isTargetFocused": false,
    "!isTargetFocused": false,
    "!suspendPointer && !isTriggerItem": false,
    "!isTriggerItemFocused && !isFocusedItemEditable && closeOnSelect": false,
    "!isTriggerItemFocused && !isFocusedItemEditable": false
  },
  on: {
    SET_PARENT: {
      actions: "setParentMenu"
    },
    SET_CHILD: {
      actions: "setChildMenu"
    },
    OPEN: "open",
    OPEN_AUTOFOCUS: {
      internal: true,
      target: "open",
      actions: "focusFirstItem"
    },
    CLOSE: "closed",
    RESTORE_FOCUS: {
      actions: "restoreFocus"
    },
    SET_VALUE: {
      actions: ["setOptionValue", "invokeOnValueChange"]
    },
    SET_HIGHLIGHTED_ID: {
      actions: "setFocusedItem"
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
        CONTEXT_MENU_START: {
          target: "opening:contextmenu",
          actions: "setAnchorPoint"
        },
        CONTEXT_MENU: {
          target: "open",
          actions: "setAnchorPoint"
        },
        TRIGGER_CLICK: "open",
        TRIGGER_FOCUS: {
          cond: "!isSubmenu",
          target: "closed"
        },
        TRIGGER_POINTERMOVE: {
          cond: "isSubmenu",
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
      activities: ["trackPointerMove", "trackInteractOutside"],
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
          actions: ["focusParentMenu", "restoreParentFocus"]
        }
      }
    },
    closed: {
      entry: ["clearFocusedItem", "focusTrigger", "clearAnchorPoint", "resumePointer"],
      on: {
        CONTEXT_MENU_START: {
          target: "opening:contextmenu",
          actions: "setAnchorPoint"
        },
        CONTEXT_MENU: {
          target: "open",
          actions: "setAnchorPoint"
        },
        TRIGGER_CLICK: "open",
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
      activities: ["trackInteractOutside", "computePlacement"],
      entry: ["focusMenu", "resumePointer"],
      exit: ["clearPointerdownNode"],
      on: {
        TRIGGER_CLICK: {
          cond: "!isTriggerItem",
          target: "closed"
        },
        ARROW_UP: [{
          cond: "hasFocusedItem",
          actions: ["focusPrevItem", "focusMenu"]
        }, {
          actions: "focusLastItem"
        }],
        ARROW_DOWN: [{
          cond: "hasFocusedItem",
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
        REQUEST_CLOSE: "closed",
        ARROW_RIGHT: {
          cond: "isTriggerItemFocused",
          actions: "openSubmenu"
        },
        ENTER: [{
          cond: "isTriggerItemFocused",
          actions: "openSubmenu"
        }, {
          cond: "closeOnSelect",
          actions: "clickFocusedItem",
          target: "closed"
        }, {
          actions: "clickFocusedItem"
        }],
        ITEM_POINTERMOVE: [{
          cond: "!suspendPointer && !isTargetFocused",
          actions: ["focusItem", "focusMenu"]
        }, {
          cond: "!isTargetFocused",
          actions: "setHoveredItem"
        }],
        ITEM_POINTERLEAVE: {
          cond: "!suspendPointer && !isTriggerItem",
          actions: "clearFocusedItem"
        },
        ITEM_CLICK: [{
          cond: "!isTriggerItemFocused && !isFocusedItemEditable && closeOnSelect",
          target: "closed",
          actions: ["invokeOnSelect", "changeOptionValue", "invokeOnValueChange", "closeRootMenu"]
        }, {
          cond: "!isTriggerItemFocused && !isFocusedItemEditable",
          actions: ["invokeOnSelect", "changeOptionValue", "invokeOnValueChange"]
        }, {
          actions: ["focusItem"]
        }],
        TRIGGER_POINTERLEAVE: {
          target: "closing",
          actions: "setIntentPolygon"
        },
        ITEM_POINTERDOWN: {
          actions: ["setPointerdownNode", "focusItem"]
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
  delays: {
    LONG_PRESS_DELAY: 700,
    SUBMENU_OPEN_DELAY: 100,
    SUBMENU_CLOSE_DELAY: 200
  },
  guards: {
    "!isSubmenu": ctx => ctx["!isSubmenu"],
    "isSubmenu": ctx => ctx["isSubmenu"],
    "isTriggerItem": ctx => ctx["isTriggerItem"],
    "!isTriggerItem": ctx => ctx["!isTriggerItem"],
    "hasFocusedItem": ctx => ctx["hasFocusedItem"],
    "isTriggerItemFocused": ctx => ctx["isTriggerItemFocused"],
    "closeOnSelect": ctx => ctx["closeOnSelect"],
    "!suspendPointer && !isTargetFocused": ctx => ctx["!suspendPointer && !isTargetFocused"],
    "!isTargetFocused": ctx => ctx["!isTargetFocused"],
    "!suspendPointer && !isTriggerItem": ctx => ctx["!suspendPointer && !isTriggerItem"],
    "!isTriggerItemFocused && !isFocusedItemEditable && closeOnSelect": ctx => ctx["!isTriggerItemFocused && !isFocusedItemEditable && closeOnSelect"],
    "!isTriggerItemFocused && !isFocusedItemEditable": ctx => ctx["!isTriggerItemFocused && !isFocusedItemEditable"]
  }
});