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
  id: "combobox",
  initial: ctx.autoFocus ? "focused" : "idle",
  context: {
    "openOnClick": false,
    "isCustomValue && !allowCustomValue": false,
    "openOnClick": false,
    "autoComplete": false,
    "hasSelectedItems": false,
    "autoComplete": false,
    "hasSelectedItems": false,
    "autoComplete && isLastItemHighlighted": false,
    "!hasHighlightedItem && hasSelectedItems": false,
    "autoComplete && isFirstItemHighlighted": false,
    "!hasHighlightedItem && hasSelectedItems": false,
    "!closeOnSelect": false,
    "autoComplete": false,
    "!closeOnSelect": false,
    "autoComplete": false,
    "selectOnBlur && hasHighlightedItem": false,
    "isCustomValue && !allowCustomValue": false,
    "!isHighlightedItemVisible": false,
    "!closeOnSelect": false,
    "autoHighlight": false,
    "isCustomValue && !allowCustomValue": false,
    "!closeOnSelect": false
  },
  on: {
    "HIGHLIGHTED_VALUE.SET": {
      actions: ["setHighlightedItem"]
    },
    "ITEM.SELECT": {
      actions: ["selectItem"]
    },
    "ITEM.CLEAR": {
      actions: ["clearItem"]
    },
    "VALUE.SET": {
      actions: ["setSelectedItems"]
    },
    "INPUT_VALUE.SET": {
      actions: "setInputValue"
    },
    "VALUE.CLEAR": {
      target: "focused",
      actions: ["clearInputValue", "clearSelectedItems"]
    },
    "INPUT.COMPOSITION_START": {
      actions: ["setIsComposing"]
    },
    "INPUT.COMPOSITION_END": {
      actions: ["clearIsComposing"]
    },
    "COLLECTION.SET": {
      actions: ["setCollection"]
    }
  },
  on: {
    UPDATE_CONTEXT: {
      actions: "updateContext"
    }
  },
  states: {
    idle: {
      tags: ["idle", "closed"],
      entry: ["scrollContentToTop", "clearHighlightedItem"],
      on: {
        "TRIGGER.CLICK": {
          target: "interacting",
          actions: ["focusInput", "highlightFirstSelectedItem", "invokeOnOpen"]
        },
        "INPUT.CLICK": {
          cond: "openOnClick",
          target: "interacting",
          actions: ["highlightFirstSelectedItem", "invokeOnOpen"]
        },
        "INPUT.FOCUS": {
          target: "focused"
        },
        OPEN: {
          target: "interacting",
          actions: ["invokeOnOpen"]
        }
      }
    },
    focused: {
      tags: ["focused", "closed"],
      entry: ["focusInput", "scrollContentToTop", "clearHighlightedItem"],
      activities: ["trackInteractOutside"],
      on: {
        "INPUT.CHANGE": {
          target: "suggesting",
          actions: "setInputValue"
        },
        "CONTENT.INTERACT_OUTSIDE": {
          target: "idle"
        },
        "INPUT.ESCAPE": {
          cond: "isCustomValue && !allowCustomValue",
          actions: "revertInputValue"
        },
        "INPUT.CLICK": {
          cond: "openOnClick",
          target: "interacting",
          actions: ["highlightFirstSelectedItem", "invokeOnOpen"]
        },
        "TRIGGER.CLICK": {
          target: "interacting",
          actions: ["focusInput", "highlightFirstSelectedItem", "invokeOnOpen"]
        },
        "INPUT.ARROW_DOWN": [{
          cond: "autoComplete",
          target: "interacting",
          actions: ["invokeOnOpen"]
        }, {
          cond: "hasSelectedItems",
          target: "interacting",
          actions: ["highlightFirstSelectedItem", "invokeOnOpen"]
        }, {
          target: "interacting",
          actions: ["highlightNextItem", "invokeOnOpen"]
        }],
        "INPUT.ARROW_DOWN+ALT": {
          target: "interacting",
          actions: "invokeOnOpen"
        },
        "INPUT.ARROW_UP": [{
          cond: "autoComplete",
          target: "interacting",
          actions: "invokeOnOpen"
        }, {
          cond: "hasSelectedItems",
          target: "interacting",
          actions: ["highlightFirstSelectedItem", "invokeOnOpen"]
        }, {
          target: "interacting",
          actions: ["highlightLastItem", "invokeOnOpen"]
        }],
        OPEN: {
          target: "interacting",
          actions: ["invokeOnOpen"]
        }
      }
    },
    interacting: {
      tags: ["open", "focused"],
      activities: ["scrollIntoView", "trackInteractOutside", "computePlacement", "hideOtherElements"],
      on: {
        "INPUT.HOME": {
          actions: ["highlightFirstItem"]
        },
        "INPUT.END": {
          actions: ["highlightLastItem"]
        },
        "INPUT.ARROW_DOWN": [{
          cond: "autoComplete && isLastItemHighlighted",
          actions: ["clearHighlightedItem", "scrollContentToTop"]
        }, {
          cond: "!hasHighlightedItem && hasSelectedItems",
          actions: ["highlightFirstSelectedItem"]
        }, {
          actions: ["highlightNextItem"]
        }],
        "INPUT.ARROW_UP": [{
          cond: "autoComplete && isFirstItemHighlighted",
          actions: "clearHighlightedItem"
        }, {
          cond: "!hasHighlightedItem && hasSelectedItems",
          actions: ["highlightFirstSelectedItem"]
        }, {
          actions: "highlightPrevItem"
        }],
        "INPUT.ARROW_UP+ALT": {
          target: "focused"
        },
        "INPUT.ENTER": [{
          cond: "!closeOnSelect",
          actions: ["selectHighlightedItem"]
        }, {
          target: "focused",
          actions: ["selectHighlightedItem", "invokeOnClose"]
        }],
        "INPUT.CHANGE": [{
          cond: "autoComplete",
          target: "suggesting",
          actions: ["setInputValue"]
        }, {
          target: "suggesting",
          actions: ["clearHighlightedItem", "setInputValue"]
        }],
        "ITEM.POINTER_OVER": {
          actions: ["setHighlightedItem"]
        },
        "ITEM.POINTER_LEAVE": {
          actions: ["clearHighlightedItem"]
        },
        "ITEM.CLICK": [{
          cond: "!closeOnSelect",
          actions: ["selectItem"]
        }, {
          target: "focused",
          actions: ["selectItem", "invokeOnClose"]
        }],
        "INPUT.ESCAPE": [{
          cond: "autoComplete",
          target: "focused",
          actions: ["syncInputValue", "invokeOnClose"]
        }, {
          target: "focused",
          actions: ["invokeOnClose"]
        }],
        "TRIGGER.CLICK": {
          target: "focused",
          actions: "invokeOnClose"
        },
        "CONTENT.INTERACT_OUTSIDE": [{
          cond: "selectOnBlur && hasHighlightedItem",
          target: "idle",
          actions: ["selectHighlightedItem", "invokeOnClose"]
        }, {
          cond: "isCustomValue && !allowCustomValue",
          target: "idle",
          actions: ["revertInputValue", "invokeOnClose"]
        }, {
          target: "idle",
          actions: "invokeOnClose"
        }],
        CLOSE: {
          target: "focused",
          actions: "invokeOnClose"
        }
      }
    },
    suggesting: {
      tags: ["open", "focused"],
      activities: ["trackInteractOutside", "scrollIntoView", "computePlacement", "trackChildNodes", "hideOtherElements"],
      entry: ["focusInput", "invokeOnOpen"],
      on: {
        CHILDREN_CHANGE: {
          cond: "!isHighlightedItemVisible",
          actions: ["highlightFirstItem"]
        },
        "INPUT.ARROW_DOWN": {
          target: "interacting",
          actions: "highlightNextItem"
        },
        "INPUT.ARROW_UP": {
          target: "interacting",
          actions: "highlightPrevItem"
        },
        "INPUT.ARROW_UP+ALT": {
          target: "focused"
        },
        "INPUT.HOME": {
          target: "interacting",
          actions: ["highlightFirstItem"]
        },
        "INPUT.END": {
          target: "interacting",
          actions: ["highlightLastItem"]
        },
        "INPUT.ENTER": [{
          cond: "!closeOnSelect",
          actions: ["selectHighlightedItem"]
        }, {
          target: "focused",
          actions: ["selectHighlightedItem", "invokeOnClose"]
        }],
        "INPUT.CHANGE": [{
          cond: "autoHighlight",
          actions: ["setInputValue", "highlightFirstItem"]
        }, {
          actions: ["clearHighlightedItem", "setInputValue"]
        }],
        "INPUT.ESCAPE": {
          target: "focused",
          actions: "invokeOnClose"
        },
        "ITEM.POINTER_OVER": {
          target: "interacting",
          actions: "setHighlightedItem"
        },
        "ITEM.POINTER_LEAVE": {
          actions: "clearHighlightedItem"
        },
        "CONTENT.INTERACT_OUTSIDE": [{
          cond: "isCustomValue && !allowCustomValue",
          target: "idle",
          actions: ["revertInputValue", "invokeOnClose"]
        }, {
          target: "idle",
          actions: "invokeOnClose"
        }],
        "TRIGGER.CLICK": {
          target: "focused",
          actions: "invokeOnClose"
        },
        "ITEM.CLICK": [{
          cond: "!closeOnSelect",
          actions: ["selectItem"]
        }, {
          target: "focused",
          actions: ["selectItem", "invokeOnClose"]
        }],
        CLOSE: {
          target: "focused",
          actions: "invokeOnClose"
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
    "openOnClick": ctx => ctx["openOnClick"],
    "isCustomValue && !allowCustomValue": ctx => ctx["isCustomValue && !allowCustomValue"],
    "autoComplete": ctx => ctx["autoComplete"],
    "hasSelectedItems": ctx => ctx["hasSelectedItems"],
    "autoComplete && isLastItemHighlighted": ctx => ctx["autoComplete && isLastItemHighlighted"],
    "!hasHighlightedItem && hasSelectedItems": ctx => ctx["!hasHighlightedItem && hasSelectedItems"],
    "autoComplete && isFirstItemHighlighted": ctx => ctx["autoComplete && isFirstItemHighlighted"],
    "!closeOnSelect": ctx => ctx["!closeOnSelect"],
    "selectOnBlur && hasHighlightedItem": ctx => ctx["selectOnBlur && hasHighlightedItem"],
    "!isHighlightedItemVisible": ctx => ctx["!isHighlightedItemVisible"],
    "autoHighlight": ctx => ctx["autoHighlight"]
  }
});