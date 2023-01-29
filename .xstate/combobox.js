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
    "focusOnClear": false,
    "openOnClick": false,
    "isCustomValue && !allowCustomValue": false,
    "autoComplete": false,
    "autoComplete": false,
    "hasFocusedOption && autoComplete": false,
    "hasFocusedOption": false,
    "autoHighlight": false,
    "autoComplete": false,
    "autoComplete && isLastOptionFocused": false,
    "autoComplete && isFirstOptionFocused": false,
    "selectOnTab": false,
    "autoComplete": false,
    "autoComplete": false
  },
  activities: ["syncInputValue"],
  onEvent(ctx, evt) {
    ctx.isKeyboardEvent = /(ARROW_UP|ARROW_DOWN|HOME|END|TAB)/.test(evt.type);
  },
  entry: "setupDocument",
  exit: "removeLiveRegion",
  on: {
    SET_VALUE: {
      actions: ["setInputValue", "setSelectionData"]
    },
    SET_INPUT_VALUE: {
      actions: "setInputValue"
    },
    CLEAR_VALUE: [{
      cond: "focusOnClear",
      target: "focused",
      actions: "clearInputValue"
    }, {
      actions: "clearInputValue"
    }],
    POINTER_OVER: {
      actions: "setIsHovering"
    },
    POINTER_LEAVE: {
      actions: "clearIsHovering"
    }
  },
  on: {
    UPDATE_CONTEXT: {
      actions: "updateContext"
    }
  },
  states: {
    idle: {
      tags: ["idle"],
      entry: ["scrollToTop", "clearFocusedOption"],
      on: {
        CLICK_BUTTON: {
          target: "interacting",
          actions: ["focusInput", "invokeOnOpen"]
        },
        POINTER_DOWN: {
          cond: "openOnClick",
          target: "interacting",
          actions: ["focusInput", "invokeOnOpen"]
        },
        FOCUS: "focused"
      }
    },
    focused: {
      tags: ["focused"],
      entry: ["focusInput", "scrollToTop", "clearFocusedOption"],
      activities: ["trackInteractOutside"],
      on: {
        CHANGE: {
          target: "suggesting",
          actions: "setInputValue"
        },
        BLUR: "idle",
        ESCAPE: {
          cond: "isCustomValue && !allowCustomValue",
          actions: "revertInputValue"
        },
        CLICK_BUTTON: {
          target: "interacting",
          actions: ["focusInput", "invokeOnOpen"]
        },
        POINTER_OVER: {
          actions: "setIsHovering"
        },
        ARROW_UP: [{
          cond: "autoComplete",
          target: "interacting",
          actions: "invokeOnOpen"
        }, {
          target: "interacting",
          actions: ["focusLastOption", "invokeOnOpen"]
        }],
        ARROW_DOWN: [{
          cond: "autoComplete",
          target: "interacting",
          actions: "invokeOnOpen"
        }, {
          target: "interacting",
          actions: ["focusFirstOption", "invokeOnOpen"]
        }],
        ALT_ARROW_DOWN: {
          target: "interacting",
          actions: ["focusInput", "invokeOnOpen"]
        }
      }
    },
    suggesting: {
      tags: ["open", "focused"],
      activities: ["trackInteractOutside", "scrollOptionIntoView", "computePlacement", "trackOptionNodes", "hideOtherElements"],
      entry: ["focusInput", "invokeOnOpen"],
      on: {
        ARROW_DOWN: {
          target: "interacting",
          actions: "focusNextOption"
        },
        ARROW_UP: {
          target: "interacting",
          actions: "focusPrevOption"
        },
        ALT_ARROW_UP: "focused",
        HOME: {
          target: "interacting",
          actions: ["focusFirstOption", "preventDefault"]
        },
        END: {
          target: "interacting",
          actions: ["focusLastOption", "preventDefault"]
        },
        ENTER: [{
          cond: "hasFocusedOption && autoComplete",
          target: "focused",
          actions: "selectActiveOption"
        }, {
          cond: "hasFocusedOption",
          target: "focused",
          actions: "selectOption"
        }],
        CHANGE: [{
          cond: "autoHighlight",
          actions: ["clearFocusedOption", "setInputValue", "focusFirstOption"]
        }, {
          actions: ["clearFocusedOption", "setInputValue"]
        }],
        ESCAPE: {
          target: "focused",
          actions: "invokeOnClose"
        },
        POINTEROVER_OPTION: [{
          cond: "autoComplete",
          target: "interacting",
          actions: "setActiveOption"
        }, {
          target: "interacting",
          actions: ["setActiveOption", "setNavigationData"]
        }],
        BLUR: {
          target: "idle",
          actions: "invokeOnClose"
        },
        CLICK_BUTTON: {
          target: "focused",
          actions: "invokeOnClose"
        },
        CLICK_OPTION: {
          target: "focused",
          actions: ["selectOption", "invokeOnClose"]
        }
      }
    },
    interacting: {
      tags: ["open", "focused"],
      activities: ["scrollOptionIntoView", "trackInteractOutside", "computePlacement", "hideOtherElements"],
      entry: "focusMatchingOption",
      on: {
        HOME: {
          actions: ["focusFirstOption", "preventDefault"]
        },
        END: {
          actions: ["focusLastOption", "preventDefault"]
        },
        ARROW_DOWN: [{
          cond: "autoComplete && isLastOptionFocused",
          actions: ["clearFocusedOption", "scrollToTop"]
        }, {
          actions: "focusNextOption"
        }],
        ARROW_UP: [{
          cond: "autoComplete && isFirstOptionFocused",
          actions: "clearFocusedOption"
        }, {
          actions: "focusPrevOption"
        }],
        ALT_UP: {
          target: "focused",
          actions: ["selectOption", "invokeOnClose"]
        },
        CLEAR_FOCUS: {
          actions: "clearFocusedOption"
        },
        TAB: {
          cond: "selectOnTab",
          target: "idle",
          actions: ["selectOption", "invokeOnClose"]
        },
        ENTER: {
          target: "focused",
          actions: ["selectOption", "invokeOnClose"]
        },
        CHANGE: [{
          cond: "autoComplete",
          target: "suggesting",
          actions: ["commitNavigationData", "setInputValue"]
        }, {
          target: "suggesting",
          actions: ["clearFocusedOption", "setInputValue"]
        }],
        POINTEROVER_OPTION: [{
          cond: "autoComplete",
          actions: "setActiveOption"
        }, {
          actions: ["setActiveOption", "setNavigationData"]
        }],
        CLICK_OPTION: {
          target: "focused",
          actions: ["selectOption", "invokeOnClose"]
        },
        ESCAPE: {
          target: "focused",
          actions: "invokeOnClose"
        },
        CLICK_BUTTON: {
          target: "focused",
          actions: "invokeOnClose"
        },
        BLUR: {
          target: "idle",
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
    "focusOnClear": ctx => ctx["focusOnClear"],
    "openOnClick": ctx => ctx["openOnClick"],
    "isCustomValue && !allowCustomValue": ctx => ctx["isCustomValue && !allowCustomValue"],
    "autoComplete": ctx => ctx["autoComplete"],
    "hasFocusedOption && autoComplete": ctx => ctx["hasFocusedOption && autoComplete"],
    "hasFocusedOption": ctx => ctx["hasFocusedOption"],
    "autoHighlight": ctx => ctx["autoHighlight"],
    "autoComplete && isLastOptionFocused": ctx => ctx["autoComplete && isLastOptionFocused"],
    "autoComplete && isFirstOptionFocused": ctx => ctx["autoComplete && isFirstOptionFocused"],
    "selectOnTab": ctx => ctx["selectOnTab"]
  }
});