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
  id: "tags-input",
  initial: ctx.autoFocus ? "focused:input" : "idle",
  context: {
    "allowEditTag": false,
    "!isTagFocused": false,
    "(!isAtMax || allowOverflow) && !isInputValueEmpty": false,
    "addOnBlur": false,
    "clearOnBlur": false,
    "!hasFocusedId": false,
    "addOnBlur": false,
    "clearOnBlur": false,
    "hasTags && isInputCaretAtStart": false,
    "hasTags && isInputCaretAtStart": false,
    "addOnPaste": false,
    "hasTags && isInputCaretAtStart && !isLastTagFocused": false,
    "allowEditTag && hasFocusedId": false,
    "isFirstTagFocused": false,
    "isInputRelatedTarget": false
  },
  activities: ["trackFormControlState"],
  exit: ["removeLiveRegion", "clearLog"],
  on: {
    DOUBLE_CLICK_TAG: {
      internal: true,
      cond: "allowEditTag",
      target: "editing:tag",
      actions: ["setEditedId", "initializeEditedTagValue"]
    },
    POINTER_DOWN_TAG: {
      internal: true,
      cond: "!isTagFocused",
      target: "navigating:tag",
      actions: ["focusTag", "focusInput"]
    },
    SET_INPUT_VALUE: {
      actions: ["setInputValue"]
    },
    SET_VALUE: {
      actions: ["setValue"]
    },
    CLEAR_TAG: {
      actions: ["deleteTag"]
    },
    SET_VALUE_AT_INDEX: {
      actions: ["setValueAtIndex"]
    },
    CLEAR_VALUE: {
      actions: ["clearTags", "clearInputValue", "focusInput"]
    },
    ADD_TAG: {
      // (!isAtMax || allowOverflow) && !inputValueIsEmpty
      cond: "(!isAtMax || allowOverflow) && !isInputValueEmpty",
      actions: ["addTag", "clearInputValue"]
    },
    EXTERNAL_BLUR: [{
      cond: "addOnBlur",
      actions: "raiseAddTagEvent"
    }, {
      cond: "clearOnBlur",
      actions: "clearInputValue"
    }]
  },
  entry: ["setupDocument", "checkValue"],
  on: {
    UPDATE_CONTEXT: {
      actions: "updateContext"
    }
  },
  states: {
    idle: {
      on: {
        FOCUS: "focused:input",
        POINTER_DOWN: {
          cond: "!hasFocusedId",
          target: "focused:input"
        }
      }
    },
    "focused:input": {
      tags: ["focused"],
      entry: ["focusInput", "clearFocusedId"],
      activities: ["trackInteractOutside"],
      on: {
        TYPE: {
          actions: "setInputValue"
        },
        BLUR: [{
          cond: "addOnBlur",
          target: "idle",
          actions: "raiseAddTagEvent"
        }, {
          cond: "clearOnBlur",
          target: "idle",
          actions: "clearInputValue"
        }, {
          target: "idle"
        }],
        ENTER: {
          actions: ["raiseAddTagEvent"]
        },
        DELIMITER_KEY: {
          actions: ["raiseAddTagEvent"]
        },
        ARROW_LEFT: {
          cond: "hasTags && isInputCaretAtStart",
          target: "navigating:tag",
          actions: "focusLastTag"
        },
        BACKSPACE: {
          target: "navigating:tag",
          cond: "hasTags && isInputCaretAtStart",
          actions: "focusLastTag"
        },
        PASTE: {
          cond: "addOnPaste",
          actions: ["setInputValue", "addTagFromPaste"]
        }
      }
    },
    "navigating:tag": {
      tags: ["focused"],
      activities: ["trackInteractOutside"],
      on: {
        ARROW_RIGHT: [{
          cond: "hasTags && isInputCaretAtStart && !isLastTagFocused",
          actions: "focusNextTag"
        }, {
          target: "focused:input"
        }],
        ARROW_LEFT: {
          actions: "focusPrevTag"
        },
        BLUR: {
          target: "idle",
          actions: "clearFocusedId"
        },
        ENTER: {
          cond: "allowEditTag && hasFocusedId",
          target: "editing:tag",
          actions: ["setEditedId", "initializeEditedTagValue", "focusEditedTagInput"]
        },
        ARROW_DOWN: "focused:input",
        ESCAPE: "focused:input",
        TYPE: {
          target: "focused:input",
          actions: "setInputValue"
        },
        BACKSPACE: [{
          cond: "isFirstTagFocused",
          actions: ["deleteFocusedTag", "focusFirstTag"]
        }, {
          actions: ["deleteFocusedTag", "focusPrevTag"]
        }],
        DELETE: {
          actions: ["deleteFocusedTag", "focusTagAtIndex"]
        }
      }
    },
    "editing:tag": {
      tags: ["editing", "focused"],
      entry: "focusEditedTagInput",
      activities: ["autoResize"],
      on: {
        TAG_INPUT_TYPE: {
          actions: "setEditedTagValue"
        },
        TAG_INPUT_ESCAPE: {
          target: "navigating:tag",
          actions: ["clearEditedTagValue", "focusInput", "clearEditedId", "focusTagAtIndex"]
        },
        TAG_INPUT_BLUR: [{
          cond: "isInputRelatedTarget",
          target: "navigating:tag",
          actions: ["clearEditedTagValue", "clearFocusedId", "clearEditedId"]
        }, {
          target: "idle",
          actions: ["clearEditedTagValue", "clearFocusedId", "clearEditedId", "raiseExternalBlurEvent"]
        }],
        TAG_INPUT_ENTER: {
          target: "navigating:tag",
          actions: ["submitEditedTagValue", "focusInput", "clearEditedId", "focusTagAtIndex", "invokeOnTagUpdate"]
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
    "allowEditTag": ctx => ctx["allowEditTag"],
    "!isTagFocused": ctx => ctx["!isTagFocused"],
    "(!isAtMax || allowOverflow) && !isInputValueEmpty": ctx => ctx["(!isAtMax || allowOverflow) && !isInputValueEmpty"],
    "addOnBlur": ctx => ctx["addOnBlur"],
    "clearOnBlur": ctx => ctx["clearOnBlur"],
    "!hasFocusedId": ctx => ctx["!hasFocusedId"],
    "hasTags && isInputCaretAtStart": ctx => ctx["hasTags && isInputCaretAtStart"],
    "addOnPaste": ctx => ctx["addOnPaste"],
    "hasTags && isInputCaretAtStart && !isLastTagFocused": ctx => ctx["hasTags && isInputCaretAtStart && !isLastTagFocused"],
    "allowEditTag && hasFocusedId": ctx => ctx["allowEditTag && hasFocusedId"],
    "isFirstTagFocused": ctx => ctx["isFirstTagFocused"],
    "isInputRelatedTarget": ctx => ctx["isInputRelatedTarget"]
  }
});