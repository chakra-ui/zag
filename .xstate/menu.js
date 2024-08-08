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
    "isOpenControlled": false,
    "isOpenControlled": false,
    "isOpenControlled": false,
    "isOpenControlled": false,
    "isOpenControlled": false,
    "!isSubmenu": false,
    "isSubmenu": false,
    "isOpenControlled": false,
    "isOpenControlled": false,
    "isOpenControlled": false,
    "isOpenControlled": false,
    "isOpenControlled": false,
    "isOpenControlled": false,
    "isOpenControlled": false,
    "isOpenAutoFocusEvent || isArrowDownEvent": false,
    "isArrowUpEvent": false,
    "isOpenControlled": false,
    "isOpenControlled": false,
    "isTriggerItem": false,
    "isOpenControlled": false,
    "isOpenControlled": false,
    "isArrowLeftEvent": false,
    "!isTriggerItem && isOpenControlled": false,
    "!isTriggerItem": false,
    "isSubmenu && isOpenControlled": false,
    "isSubmenu": false,
    "isTriggerItemHighlighted": false,
    "isTriggerItemHighlighted": false,
    "!suspendPointer": false,
    "!suspendPointer && !isTriggerItem": false,
    "!isTriggerItemHighlighted && !isHighlightedItemEditable && closeOnSelect && isOpenControlled": false,
    "!isTriggerItemHighlighted && !isHighlightedItemEditable && closeOnSelect": false,
    "!isTriggerItemHighlighted && !isHighlightedItemEditable": false
  },
  on: {
    "PARENT.SET": {
      actions: "setParentMenu"
    },
    "CHILD.SET": {
      actions: "setChildMenu"
    },
    OPEN: [{
      cond: "isOpenControlled",
      actions: "invokeOnOpen"
    }, {
      target: "open",
      actions: "invokeOnOpen"
    }],
    OPEN_AUTOFOCUS: [{
      cond: "isOpenControlled",
      actions: ["invokeOnOpen"]
    }, {
      internal: true,
      target: "open",
      actions: ["highlightFirstItem", "invokeOnOpen"]
    }],
    CLOSE: [{
      cond: "isOpenControlled",
      actions: "invokeOnClose"
    }, {
      target: "closed",
      actions: "invokeOnClose"
    }],
    "HIGHLIGHTED.RESTORE": {
      actions: "restoreHighlightedItem"
    },
    "HIGHLIGHTED.SET": {
      actions: "setHighlightedItem"
    }
  },
  on: {
    UPDATE_CONTEXT: {
      actions: "updateContext"
    }
  },
  states: {
    idle: {
      tags: ["closed"],
      on: {
        "CONTROLLED.OPEN": "open",
        "CONTROLLED.CLOSE": "closed",
        CONTEXT_MENU_START: {
          target: "opening:contextmenu",
          actions: "setAnchorPoint"
        },
        CONTEXT_MENU: [{
          cond: "isOpenControlled",
          actions: ["setAnchorPoint", "invokeOnOpen"]
        }, {
          target: "open",
          actions: ["setAnchorPoint", "invokeOnOpen"]
        }],
        TRIGGER_CLICK: [{
          cond: "isOpenControlled",
          actions: "invokeOnOpen"
        }, {
          target: "open",
          actions: "invokeOnOpen"
        }],
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
      tags: ["closed"],
      after: {
        LONG_PRESS_DELAY: [{
          cond: "isOpenControlled",
          actions: "invokeOnOpen"
        }, {
          target: "open",
          actions: "invokeOnOpen"
        }]
      },
      on: {
        "CONTROLLED.OPEN": "open",
        "CONTROLLED.CLOSE": "closed",
        CONTEXT_MENU_CANCEL: [{
          cond: "isOpenControlled",
          actions: "invokeOnClose"
        }, {
          target: "closed",
          actions: "invokeOnClose"
        }]
      }
    },
    opening: {
      tags: ["closed"],
      after: {
        SUBMENU_OPEN_DELAY: [{
          cond: "isOpenControlled",
          actions: "invokeOnOpen"
        }, {
          target: "open",
          actions: "invokeOnOpen"
        }]
      },
      on: {
        "CONTROLLED.OPEN": "open",
        "CONTROLLED.CLOSE": "closed",
        BLUR: [{
          cond: "isOpenControlled",
          actions: "invokeOnClose"
        }, {
          target: "closed",
          actions: "invokeOnClose"
        }],
        TRIGGER_POINTERLEAVE: [{
          cond: "isOpenControlled",
          actions: "invokeOnClose"
        }, {
          target: "closed",
          actions: "invokeOnClose"
        }]
      }
    },
    closing: {
      tags: ["open"],
      activities: ["trackPointerMove", "trackInteractOutside"],
      after: {
        SUBMENU_CLOSE_DELAY: [{
          cond: "isOpenControlled",
          actions: ["invokeOnClose"]
        }, {
          target: "closed",
          actions: ["focusParentMenu", "restoreParentHiglightedItem", "invokeOnClose"]
        }]
      },
      on: {
        "CONTROLLED.OPEN": "open",
        "CONTROLLED.CLOSE": {
          target: "closed",
          actions: ["focusParentMenu", "restoreParentHiglightedItem"]
        },
        // don't invoke on open here since the menu is still open (we're only keeping it open)
        MENU_POINTERENTER: {
          target: "open",
          actions: "clearIntentPolygon"
        },
        POINTER_MOVED_AWAY_FROM_SUBMENU: [{
          cond: "isOpenControlled",
          actions: "invokeOnClose"
        }, {
          target: "closed",
          actions: ["focusParentMenu", "restoreParentHiglightedItem"]
        }]
      }
    },
    closed: {
      tags: ["closed"],
      entry: ["clearHighlightedItem", "focusTrigger", "resumePointer"],
      on: {
        "CONTROLLED.OPEN": [{
          cond: "isOpenAutoFocusEvent || isArrowDownEvent",
          target: "open",
          actions: "highlightFirstItem"
        }, {
          cond: "isArrowUpEvent",
          target: "open",
          actions: "highlightLastItem"
        }, {
          target: "open"
        }],
        CONTEXT_MENU_START: {
          target: "opening:contextmenu",
          actions: "setAnchorPoint"
        },
        CONTEXT_MENU: [{
          cond: "isOpenControlled",
          actions: ["setAnchorPoint", "invokeOnOpen"]
        }, {
          target: "open",
          actions: ["setAnchorPoint", "invokeOnOpen"]
        }],
        TRIGGER_CLICK: [{
          cond: "isOpenControlled",
          actions: "invokeOnOpen"
        }, {
          target: "open",
          actions: "invokeOnOpen"
        }],
        TRIGGER_POINTERMOVE: {
          cond: "isTriggerItem",
          target: "opening"
        },
        TRIGGER_BLUR: "idle",
        ARROW_DOWN: [{
          cond: "isOpenControlled",
          actions: "invokeOnOpen"
        }, {
          target: "open",
          actions: ["highlightFirstItem", "invokeOnOpen"]
        }],
        ARROW_UP: [{
          cond: "isOpenControlled",
          actions: "invokeOnOpen"
        }, {
          target: "open",
          actions: ["highlightLastItem", "invokeOnOpen"]
        }]
      }
    },
    open: {
      tags: ["open"],
      activities: ["trackInteractOutside", "trackPositioning", "scrollToHighlightedItem"],
      entry: ["focusMenu", "resumePointer"],
      on: {
        "CONTROLLED.CLOSE": [{
          target: "closed",
          cond: "isArrowLeftEvent",
          actions: ["focusParentMenu"]
        }, {
          target: "closed"
        }],
        TRIGGER_CLICK: [{
          cond: "!isTriggerItem && isOpenControlled",
          actions: "invokeOnClose"
        }, {
          cond: "!isTriggerItem",
          target: "closed",
          actions: "invokeOnClose"
        }],
        ARROW_UP: {
          actions: ["highlightPrevItem", "focusMenu"]
        },
        ARROW_DOWN: {
          actions: ["highlightNextItem", "focusMenu"]
        },
        ARROW_LEFT: [{
          cond: "isSubmenu && isOpenControlled",
          actions: "invokeOnClose"
        }, {
          cond: "isSubmenu",
          target: "closed",
          actions: ["focusParentMenu", "invokeOnClose"]
        }],
        HOME: {
          actions: ["highlightFirstItem", "focusMenu"]
        },
        END: {
          actions: ["highlightLastItem", "focusMenu"]
        },
        ARROW_RIGHT: {
          cond: "isTriggerItemHighlighted",
          actions: "openSubmenu"
        },
        ENTER: [{
          cond: "isTriggerItemHighlighted",
          actions: "openSubmenu"
        }, {
          actions: "clickHighlightedItem"
        }],
        ITEM_POINTERMOVE: [{
          cond: "!suspendPointer",
          actions: ["setHighlightedItem", "focusMenu"]
        }, {
          actions: "setLastHighlightedItem"
        }],
        ITEM_POINTERLEAVE: {
          cond: "!suspendPointer && !isTriggerItem",
          actions: "clearHighlightedItem"
        },
        ITEM_CLICK: [
        // == grouped ==
        {
          cond: "!isTriggerItemHighlighted && !isHighlightedItemEditable && closeOnSelect && isOpenControlled",
          actions: ["invokeOnSelect", "setOptionState", "closeRootMenu", "invokeOnClose"]
        }, {
          cond: "!isTriggerItemHighlighted && !isHighlightedItemEditable && closeOnSelect",
          target: "closed",
          actions: ["invokeOnSelect", "setOptionState", "closeRootMenu", "invokeOnClose"]
        },
        //
        {
          cond: "!isTriggerItemHighlighted && !isHighlightedItemEditable",
          actions: ["invokeOnSelect", "setOptionState"]
        }, {
          actions: "setHighlightedItem"
        }],
        TRIGGER_POINTERLEAVE: {
          target: "closing",
          actions: "setIntentPolygon"
        },
        ITEM_POINTERDOWN: {
          actions: "setHighlightedItem"
        },
        TYPEAHEAD: {
          actions: "highlightMatchedItem"
        },
        FOCUS_MENU: {
          actions: "focusMenu"
        },
        "POSITIONING.SET": {
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
    "isOpenControlled": ctx => ctx["isOpenControlled"],
    "!isSubmenu": ctx => ctx["!isSubmenu"],
    "isSubmenu": ctx => ctx["isSubmenu"],
    "isOpenAutoFocusEvent || isArrowDownEvent": ctx => ctx["isOpenAutoFocusEvent || isArrowDownEvent"],
    "isArrowUpEvent": ctx => ctx["isArrowUpEvent"],
    "isTriggerItem": ctx => ctx["isTriggerItem"],
    "isArrowLeftEvent": ctx => ctx["isArrowLeftEvent"],
    "!isTriggerItem && isOpenControlled": ctx => ctx["!isTriggerItem && isOpenControlled"],
    "!isTriggerItem": ctx => ctx["!isTriggerItem"],
    "isSubmenu && isOpenControlled": ctx => ctx["isSubmenu && isOpenControlled"],
    "isTriggerItemHighlighted": ctx => ctx["isTriggerItemHighlighted"],
    "!suspendPointer": ctx => ctx["!suspendPointer"],
    "!suspendPointer && !isTriggerItem": ctx => ctx["!suspendPointer && !isTriggerItem"],
    "!isTriggerItemHighlighted && !isHighlightedItemEditable && closeOnSelect && isOpenControlled": ctx => ctx["!isTriggerItemHighlighted && !isHighlightedItemEditable && closeOnSelect && isOpenControlled"],
    "!isTriggerItemHighlighted && !isHighlightedItemEditable && closeOnSelect": ctx => ctx["!isTriggerItemHighlighted && !isHighlightedItemEditable && closeOnSelect"],
    "!isTriggerItemHighlighted && !isHighlightedItemEditable": ctx => ctx["!isTriggerItemHighlighted && !isHighlightedItemEditable"]
  }
});