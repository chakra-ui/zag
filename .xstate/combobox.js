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
  initial: ctx.open ? "suggesting" : "idle",
  context: {
    "isOpenControlled": false,
    "isOpenControlled": false,
    "isOpenControlled": false,
    "isChangeEvent": false,
    "isOpenControlled && openOnChange": false,
    "openOnChange": false,
    "isCustomValue && !allowCustomValue": false,
    "isOpenControlled": false,
    "isOpenControlled": false,
    "isOpenControlled && autoComplete": false,
    "autoComplete": false,
    "isOpenControlled": false,
    "autoComplete": false,
    "autoComplete": false,
    "isOpenControlled": false,
    "restoreFocus": false,
    "autoComplete && isLastItemHighlighted": false,
    "autoComplete && isFirstItemHighlighted": false,
    "isOpenControlled && isCustomValue && !hasHighlightedItem && !allowCustomValue": false,
    "isCustomValue && !hasHighlightedItem && !allowCustomValue": false,
    "isOpenControlled && closeOnSelect": false,
    "closeOnSelect": false,
    "autoComplete": false,
    "isOpenControlled && closeOnSelect": false,
    "closeOnSelect": false,
    "isOpenControlled && autoComplete": false,
    "autoComplete": false,
    "isOpenControlled": false,
    "isOpenControlled": false,
    "isOpenControlled && isCustomValue && !allowCustomValue": false,
    "isCustomValue && !allowCustomValue": false,
    "isOpenControlled": false,
    "isOpenControlled": false,
    "isOpenControlled": false,
    "restoreFocus": false,
    "isOpenControlled && isCustomValue && !hasHighlightedItem && !allowCustomValue": false,
    "isCustomValue && !hasHighlightedItem && !allowCustomValue": false,
    "isOpenControlled && closeOnSelect": false,
    "closeOnSelect": false,
    "autoHighlight": false,
    "isOpenControlled": false,
    "isOpenControlled && isCustomValue && !allowCustomValue": false,
    "isCustomValue && !allowCustomValue": false,
    "isOpenControlled": false,
    "isOpenControlled": false,
    "isOpenControlled && closeOnSelect": false,
    "closeOnSelect": false,
    "isOpenControlled": false,
    "isOpenControlled": false
  },
  on: {
    "SELECTED_ITEMS.SYNC": {
      actions: ["syncSelectedItems"]
    },
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
    "COLLECTION.SET": {
      actions: ["setCollection"]
    },
    "POSITIONING.SET": {
      actions: ["reposition"]
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
        "CONTROLLED.OPEN": {
          target: "interacting"
        },
        "TRIGGER.CLICK": [{
          cond: "isOpenControlled",
          actions: ["setInitialFocus", "highlightFirstSelectedItem", "invokeOnOpen"]
        }, {
          target: "interacting",
          actions: ["setInitialFocus", "highlightFirstSelectedItem", "invokeOnOpen"]
        }],
        "INPUT.CLICK": [{
          cond: "isOpenControlled",
          actions: ["highlightFirstSelectedItem", "invokeOnOpen"]
        }, {
          target: "interacting",
          actions: ["highlightFirstSelectedItem", "invokeOnOpen"]
        }],
        "INPUT.FOCUS": {
          target: "focused"
        },
        OPEN: [{
          cond: "isOpenControlled",
          actions: ["invokeOnOpen"]
        }, {
          target: "interacting",
          actions: ["invokeOnOpen"]
        }],
        "VALUE.CLEAR": {
          target: "focused",
          actions: ["clearInputValue", "clearSelectedItems", "setInitialFocus"]
        }
      }
    },
    focused: {
      tags: ["focused", "closed"],
      entry: ["scrollContentToTop", "clearHighlightedItem"],
      on: {
        "CONTROLLED.OPEN": [{
          cond: "isChangeEvent",
          target: "suggesting"
        }, {
          target: "interacting"
        }],
        "INPUT.CHANGE": [{
          cond: "isOpenControlled && openOnChange",
          actions: ["setInputValue", "invokeOnOpen", "highlightFirstItemIfNeeded"]
        }, {
          cond: "openOnChange",
          target: "suggesting",
          actions: ["setInputValue", "invokeOnOpen", "highlightFirstItemIfNeeded"]
        }, {
          actions: "setInputValue"
        }],
        "LAYER.INTERACT_OUTSIDE": {
          target: "idle"
        },
        "INPUT.ESCAPE": {
          cond: "isCustomValue && !allowCustomValue",
          actions: "revertInputValue"
        },
        "INPUT.BLUR": {
          target: "idle"
        },
        "INPUT.CLICK": [{
          cond: "isOpenControlled",
          actions: ["highlightFirstSelectedItem", "invokeOnOpen"]
        }, {
          target: "interacting",
          actions: ["highlightFirstSelectedItem", "invokeOnOpen"]
        }],
        "TRIGGER.CLICK": [{
          cond: "isOpenControlled",
          actions: ["setInitialFocus", "highlightFirstSelectedItem", "invokeOnOpen"]
        }, {
          target: "interacting",
          actions: ["setInitialFocus", "highlightFirstSelectedItem", "invokeOnOpen"]
        }],
        "INPUT.ARROW_DOWN": [
        // == group 1 ==
        {
          cond: "isOpenControlled && autoComplete",
          actions: ["invokeOnOpen"]
        }, {
          cond: "autoComplete",
          target: "interacting",
          actions: ["invokeOnOpen"]
        },
        // == group 2 ==
        {
          cond: "isOpenControlled",
          actions: ["highlightFirstOrSelectedItem", "invokeOnOpen"]
        }, {
          target: "interacting",
          actions: ["highlightFirstOrSelectedItem", "invokeOnOpen"]
        }],
        "INPUT.ARROW_UP": [
        // == group 1 ==
        {
          cond: "autoComplete",
          target: "interacting",
          actions: "invokeOnOpen"
        }, {
          cond: "autoComplete",
          target: "interacting",
          actions: "invokeOnOpen"
        },
        // == group 2 ==
        {
          target: "interacting",
          actions: ["highlightLastOrSelectedItem", "invokeOnOpen"]
        }, {
          target: "interacting",
          actions: ["highlightLastOrSelectedItem", "invokeOnOpen"]
        }],
        OPEN: [{
          cond: "isOpenControlled",
          actions: ["invokeOnOpen"]
        }, {
          target: "interacting",
          actions: ["invokeOnOpen"]
        }],
        "VALUE.CLEAR": {
          actions: ["clearInputValue", "clearSelectedItems"]
        }
      }
    },
    interacting: {
      tags: ["open", "focused"],
      entry: ["setInitialFocus"],
      activities: ["scrollToHighlightedItem", "trackDismissableLayer", "computePlacement", "hideOtherElements"],
      on: {
        "CONTROLLED.CLOSE": [{
          cond: "restoreFocus",
          target: "focused",
          actions: ["setFinalFocus"]
        }, {
          target: "idle"
        }],
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
          actions: ["highlightNextItem"]
        }],
        "INPUT.ARROW_UP": [{
          cond: "autoComplete && isFirstItemHighlighted",
          actions: "clearHighlightedItem"
        }, {
          actions: "highlightPrevItem"
        }],
        "INPUT.ENTER": [
        // == group 1 ==
        {
          cond: "isOpenControlled && isCustomValue && !hasHighlightedItem && !allowCustomValue",
          actions: ["revertInputValue", "invokeOnClose"]
        }, {
          cond: "isCustomValue && !hasHighlightedItem && !allowCustomValue",
          target: "focused",
          actions: ["revertInputValue", "invokeOnClose"]
        },
        // == group 2 ==
        {
          cond: "isOpenControlled && closeOnSelect",
          actions: ["selectHighlightedItem", "invokeOnClose"]
        }, {
          cond: "closeOnSelect",
          target: "focused",
          actions: ["selectHighlightedItem", "invokeOnClose", "setFinalFocus"]
        }, {
          actions: ["selectHighlightedItem"]
        }],
        "INPUT.CHANGE": [{
          cond: "autoComplete",
          target: "suggesting",
          actions: ["setInputValue", "invokeOnOpen"]
        }, {
          target: "suggesting",
          actions: ["clearHighlightedItem", "setInputValue", "invokeOnOpen"]
        }],
        "ITEM.POINTER_MOVE": {
          actions: ["setHighlightedItem"]
        },
        "ITEM.POINTER_LEAVE": {
          actions: ["clearHighlightedItem"]
        },
        "ITEM.CLICK": [{
          cond: "isOpenControlled && closeOnSelect",
          actions: ["selectItem", "invokeOnClose"]
        }, {
          cond: "closeOnSelect",
          target: "focused",
          actions: ["selectItem", "invokeOnClose", "setFinalFocus"]
        }, {
          actions: ["selectItem"]
        }],
        "LAYER.ESCAPE": [{
          cond: "isOpenControlled && autoComplete",
          actions: ["syncInputValue", "invokeOnClose"]
        }, {
          cond: "autoComplete",
          target: "focused",
          actions: ["syncInputValue", "invokeOnClose"]
        }, {
          cond: "isOpenControlled",
          actions: "invokeOnClose"
        }, {
          target: "focused",
          actions: ["invokeOnClose", "setFinalFocus"]
        }],
        "TRIGGER.CLICK": [{
          cond: "isOpenControlled",
          actions: "invokeOnClose"
        }, {
          target: "focused",
          actions: "invokeOnClose"
        }],
        "LAYER.INTERACT_OUTSIDE": [
        // == group 1 ==
        {
          cond: "isOpenControlled && isCustomValue && !allowCustomValue",
          actions: ["revertInputValue", "invokeOnClose"]
        }, {
          cond: "isCustomValue && !allowCustomValue",
          target: "idle",
          actions: ["revertInputValue", "invokeOnClose"]
        },
        // == group 2 ==
        {
          cond: "isOpenControlled",
          actions: "invokeOnClose"
        }, {
          target: "idle",
          actions: "invokeOnClose"
        }],
        CLOSE: [{
          cond: "isOpenControlled",
          actions: ["invokeOnClose"]
        }, {
          target: "focused",
          actions: ["invokeOnClose", "setFinalFocus"]
        }],
        "VALUE.CLEAR": [{
          cond: "isOpenControlled",
          actions: ["clearInputValue", "clearSelectedItems", "invokeOnClose"]
        }, {
          target: "focused",
          actions: ["clearInputValue", "clearSelectedItems", "invokeOnClose", "setFinalFocus"]
        }]
      }
    },
    suggesting: {
      tags: ["open", "focused"],
      activities: ["trackDismissableLayer", "scrollToHighlightedItem", "computePlacement", "trackChildNodes", "hideOtherElements"],
      entry: ["setInitialFocus"],
      on: {
        "CONTROLLED.CLOSE": [{
          cond: "restoreFocus",
          target: "focused",
          actions: ["setFinalFocus"]
        }, {
          target: "idle"
        }],
        CHILDREN_CHANGE: {
          actions: ["highlightFirstItem"]
        },
        "INPUT.ARROW_DOWN": {
          target: "interacting",
          actions: ["highlightNextItem"]
        },
        "INPUT.ARROW_UP": {
          target: "interacting",
          actions: ["highlightPrevItem"]
        },
        "INPUT.HOME": {
          target: "interacting",
          actions: ["highlightFirstItem"]
        },
        "INPUT.END": {
          target: "interacting",
          actions: ["highlightLastItem"]
        },
        "INPUT.ENTER": [
        // == group 1 ==
        {
          cond: "isOpenControlled && isCustomValue && !hasHighlightedItem && !allowCustomValue",
          actions: ["revertInputValue", "invokeOnClose"]
        }, {
          cond: "isCustomValue && !hasHighlightedItem && !allowCustomValue",
          target: "focused",
          actions: ["revertInputValue", "invokeOnClose"]
        },
        // == group 2 ==
        {
          cond: "isOpenControlled && closeOnSelect",
          actions: ["selectHighlightedItem", "invokeOnClose"]
        }, {
          cond: "closeOnSelect",
          target: "focused",
          actions: ["selectHighlightedItem", "invokeOnClose", "setFinalFocus"]
        }, {
          actions: ["selectHighlightedItem"]
        }],
        "INPUT.CHANGE": [{
          cond: "autoHighlight",
          actions: ["setInputValue"]
        }, {
          actions: ["setInputValue"]
        }],
        "LAYER.ESCAPE": [{
          cond: "isOpenControlled",
          actions: ["invokeOnClose"]
        }, {
          target: "focused",
          actions: ["invokeOnClose"]
        }],
        "ITEM.POINTER_MOVE": {
          target: "interacting",
          actions: ["setHighlightedItem"]
        },
        "ITEM.POINTER_LEAVE": {
          actions: ["clearHighlightedItem"]
        },
        "LAYER.INTERACT_OUTSIDE": [
        // == group 1 ==
        {
          cond: "isOpenControlled && isCustomValue && !allowCustomValue",
          actions: ["revertInputValue", "invokeOnClose"]
        }, {
          cond: "isCustomValue && !allowCustomValue",
          target: "idle",
          actions: ["revertInputValue", "invokeOnClose"]
        },
        // == group 2 ==
        {
          cond: "isOpenControlled",
          actions: ["invokeOnClose"]
        }, {
          target: "idle",
          actions: ["invokeOnClose"]
        }],
        "TRIGGER.CLICK": [{
          cond: "isOpenControlled",
          actions: ["invokeOnClose"]
        }, {
          target: "focused",
          actions: ["invokeOnClose"]
        }],
        "ITEM.CLICK": [{
          cond: "isOpenControlled && closeOnSelect",
          actions: ["selectItem", "invokeOnClose"]
        }, {
          cond: "closeOnSelect",
          target: "focused",
          actions: ["selectItem", "invokeOnClose", "setFinalFocus"]
        }, {
          actions: ["selectItem"]
        }],
        CLOSE: [{
          cond: "isOpenControlled",
          actions: ["invokeOnClose"]
        }, {
          target: "focused",
          actions: ["invokeOnClose", "setFinalFocus"]
        }],
        "VALUE.CLEAR": [{
          cond: "isOpenControlled",
          actions: ["clearInputValue", "clearSelectedItems", "invokeOnClose"]
        }, {
          target: "focused",
          actions: ["clearInputValue", "clearSelectedItems", "invokeOnClose", "setFinalFocus"]
        }]
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
    "isOpenControlled": ctx => ctx["isOpenControlled"],
    "isChangeEvent": ctx => ctx["isChangeEvent"],
    "isOpenControlled && openOnChange": ctx => ctx["isOpenControlled && openOnChange"],
    "openOnChange": ctx => ctx["openOnChange"],
    "isCustomValue && !allowCustomValue": ctx => ctx["isCustomValue && !allowCustomValue"],
    "isOpenControlled && autoComplete": ctx => ctx["isOpenControlled && autoComplete"],
    "autoComplete": ctx => ctx["autoComplete"],
    "restoreFocus": ctx => ctx["restoreFocus"],
    "autoComplete && isLastItemHighlighted": ctx => ctx["autoComplete && isLastItemHighlighted"],
    "autoComplete && isFirstItemHighlighted": ctx => ctx["autoComplete && isFirstItemHighlighted"],
    "isOpenControlled && isCustomValue && !hasHighlightedItem && !allowCustomValue": ctx => ctx["isOpenControlled && isCustomValue && !hasHighlightedItem && !allowCustomValue"],
    "isCustomValue && !hasHighlightedItem && !allowCustomValue": ctx => ctx["isCustomValue && !hasHighlightedItem && !allowCustomValue"],
    "isOpenControlled && closeOnSelect": ctx => ctx["isOpenControlled && closeOnSelect"],
    "closeOnSelect": ctx => ctx["closeOnSelect"],
    "isOpenControlled && isCustomValue && !allowCustomValue": ctx => ctx["isOpenControlled && isCustomValue && !allowCustomValue"],
    "autoHighlight": ctx => ctx["autoHighlight"]
  }
});