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
    "!isItemEl": false,
    "!isItemEl": false,
    "!isItemEl": false,
    "isVertical && hasSubmenu": false,
    "isVertical": false,
    "!isVertical && hasSubmenu": false,
    "!isVertical": false
  },
  on: {
    SET_PARENT: {
      actions: "setParentMenu"
    },
    SET_CHILD: {
      actions: "setChildMenu"
    },
    CLOSE: {
      actions: ["collapseMenu", "focusTrigger"],
      target: "collapsed"
    },
    ITEM_CLICK: [{
      cond: "isExpanded",
      actions: "collapseMenu",
      target: "collapsed"
    }, {
      actions: "expandMenu",
      target: "expanded"
    }],
    ITEM_POINTERMOVE: {
      actions: ["setFocusedId", "removeHighlightedLinkId"]
    },
    ITEM_POINTERLEAVE: {
      actions: "removeFocusedId"
    },
    LINK_CLICK: {
      actions: ["setActiveLink", "collapseMenu", "removeFocusedId"]
    },
    LINK_FOCUS: [{
      cond: "!isItemEl",
      actions: "highlightLink"
    }, {
      actions: ["setFocusedId", "removeHighlightedLinkId"]
    }],
    LINK_POINTERMOVE: [{
      cond: "!isItemEl",
      actions: "highlightLink"
    }, {
      actions: ["setFocusedId", "removeHighlightedLinkId"]
    }],
    LINK_POINTERLEAVE: [{
      cond: "!isItemEl",
      actions: "removeHighlightedLinkId"
    }, {
      actions: ["removeFocusedId"]
    }],
    SUB_ITEMFOCUS: {
      internal: true,
      actions: "focusFirstItem",
      target: "collapsed"
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
        ITEM_FOCUS: {
          actions: ["setFocusedId", "removeHighlightedLinkId"],
          target: "collapsed"
        }
      }
    },
    collapsed: {
      on: {
        ITEM_FOCUS: {
          actions: ["setFocusedId", "removeHighlightedLinkId"]
        },
        ITEM_BLUR: {
          actions: "removeFocusedId"
        },
        ITEM_ARROWRIGHT: {
          actions: "focusNextItem"
        },
        ITEM_ARROWDOWN: {
          actions: "focusNextItem"
        },
        ITEM_ARROWLEFT: {
          actions: "focusPrevItem"
        },
        ITEM_FIRST: {
          actions: "focusFirstItem"
        },
        ITEM_LAST: {
          actions: "focusLastItem"
        }
      }
    },
    expanded: {
      tags: ["expanded"],
      activities: ["trackInteractOutside"],
      on: {
        ITEM_FOCUS: {
          actions: ["setFocusedId", "removeHighlightedLinkId"]
        },
        ITEM_ARROWRIGHT: [{
          cond: "isVertical && hasSubmenu",
          actions: "focusSubMenu"
        }, {
          cond: "isVertical",
          actions: "highlightFirstLink"
        }, {
          actions: "focusNextItem"
        }],
        ITEM_ARROWDOWN: [{
          cond: "!isVertical && hasSubmenu",
          actions: "focusSubMenu"
        }, {
          cond: "!isVertical",
          actions: "highlightFirstLink"
        }, {
          actions: "focusNextItem"
        }],
        ITEM_ARROWLEFT: {
          actions: "focusPrevItem"
        },
        ITEM_FIRST: {
          actions: "focusFirstItem"
        },
        ITEM_LAST: {
          actions: "focusLastItem"
        },
        LINK_FIRST: {
          actions: "highlightFirstLink"
        },
        LINK_LAST: {
          actions: "highlightLastLink"
        },
        LINK_NEXT: {
          actions: "highlightNextLink"
        },
        LINK_PREV: {
          actions: "highlightPrevLink"
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
    "!isItemEl": ctx => ctx["!isItemEl"],
    "isVertical && hasSubmenu": ctx => ctx["isVertical && hasSubmenu"],
    "isVertical": ctx => ctx["isVertical"],
    "!isVertical && hasSubmenu": ctx => ctx["!isVertical && hasSubmenu"],
    "!isVertical": ctx => ctx["!isVertical"]
  }
});