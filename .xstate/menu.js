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
  initial: ctx.open ? "open" : "idle",
  context: {
    "!isSubmenu": false,
    "isSubmenu": false,
    "isTriggerItem": false,
    "!isTriggerItem": false,
    "isForwardTabNavigation": false,
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
    OPEN: {
      target: "open",
      actions: "invokeOnOpen"
    },
    OPEN_AUTOFOCUS: {
      internal: true,
      target: "open",
      actions: ["focusFirstItem", "invokeOnOpen"]
    },
    CLOSE: {
      target: "closed",
      actions: "invokeOnClose"
    },
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
          actions: ["setAnchorPoint", "invokeOnOpen"]
        },
        TRIGGER_CLICK: {
          target: "open",
          actions: "invokeOnOpen"
        },
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
        LONG_PRESS_DELAY: {
          target: "open",
          actions: "invokeOnOpen"
        }
      },
      on: {
        CONTEXT_MENU_CANCEL: {
          target: "closed",
          actions: "invokeOnClose"
        }
      }
    },
    opening: {
      after: {
        SUBMENU_OPEN_DELAY: {
          target: "open",
          actions: "invokeOnOpen"
        }
      },
      on: {
        BLUR: {
          target: "closed",
          actions: "invokeOnClose"
        },
        TRIGGER_POINTERLEAVE: {
          target: "closed",
          actions: "invokeOnClose"
        }
      }
    },
    closing: {
      tags: ["visible"],
      activities: ["trackPointerMove", "trackInteractOutside"],
      after: {
        SUBMENU_CLOSE_DELAY: {
          target: "closed",
          actions: ["focusParentMenu", "restoreParentFocus", "invokeOnClose"]
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
          actions: ["setAnchorPoint", "invokeOnOpen"]
        },
        TRIGGER_CLICK: {
          target: "open",
          actions: "invokeOnOpen"
        },
        TRIGGER_POINTERMOVE: {
          cond: "isTriggerItem",
          target: "opening"
        },
        TRIGGER_BLUR: "idle",
        ARROW_DOWN: {
          target: "open",
          actions: ["focusFirstItem", "invokeOnOpen"]
        },
        ARROW_UP: {
          target: "open",
          actions: ["focusLastItem", "invokeOnOpen"]
        }
      }
    },
    open: {
      tags: ["visible"],
      activities: ["trackInteractOutside", "trackPositioning", "scrollToHighlightedItem"],
      entry: ["focusMenu", "resumePointer"],
      on: {
        TRIGGER_CLICK: {
          cond: "!isTriggerItem",
          target: "closed",
          actions: "invokeOnClose"
        },
        TAB: [{
          cond: "isForwardTabNavigation",
          actions: ["focusNextItem"]
        }, {
          actions: ["focusPrevItem"]
        }],
        ARROW_UP: {
          actions: ["focusPrevItem", "focusMenu"]
        },
        ARROW_DOWN: {
          actions: ["focusNextItem", "focusMenu"]
        },
        ARROW_LEFT: {
          cond: "isSubmenu",
          target: "closed",
          actions: ["focusParentMenu", "invokeOnClose"]
        },
        HOME: {
          actions: ["focusFirstItem", "focusMenu"]
        },
        END: {
          actions: ["focusLastItem", "focusMenu"]
        },
        REQUEST_CLOSE: {
          target: "closed",
          actions: "invokeOnClose"
        },
        ARROW_RIGHT: {
          cond: "isTriggerItemFocused",
          actions: "openSubmenu"
        },
        ENTER: [{
          cond: "isTriggerItemFocused",
          actions: "openSubmenu"
        }, {
          cond: "closeOnSelect",
          target: "closed",
          actions: "clickFocusedItem"
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
          actions: ["invokeOnSelect", "changeOptionValue", "invokeOnValueChange", "closeRootMenu", "invokeOnClose"]
        }, {
          cond: "!isTriggerItemFocused && !isFocusedItemEditable",
          actions: ["invokeOnSelect", "changeOptionValue", "invokeOnValueChange"]
        }, {
          actions: "focusItem"
        }],
        TRIGGER_POINTERLEAVE: {
          target: "closing",
          actions: "setIntentPolygon"
        },
        ITEM_POINTERDOWN: {
          actions: "focusItem"
        },
        TYPEAHEAD: {
          actions: "focusMatchedItem"
        },
        FOCUS_MENU: {
          actions: "focusMenu"
        },
        SET_POSITIONING: {
          actions: "reposition"
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
    "isForwardTabNavigation": ctx => ctx["isForwardTabNavigation"],
    "isTriggerItemFocused": ctx => ctx["isTriggerItemFocused"],
    "closeOnSelect": ctx => ctx["closeOnSelect"],
    "!suspendPointer && !isTargetFocused": ctx => ctx["!suspendPointer && !isTargetFocused"],
    "!isTargetFocused": ctx => ctx["!isTargetFocused"],
    "!suspendPointer && !isTriggerItem": ctx => ctx["!suspendPointer && !isTriggerItem"],
    "!isTriggerItemFocused && !isFocusedItemEditable && closeOnSelect": ctx => ctx["!isTriggerItemFocused && !isFocusedItemEditable && closeOnSelect"],
    "!isTriggerItemFocused && !isFocusedItemEditable": ctx => ctx["!isTriggerItemFocused && !isFocusedItemEditable"]
  }
});