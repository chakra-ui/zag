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
  initial: "unknown",
  context: {
    "allowEditTag": false,
    "!isTagFocused": false,
    "(!isAtMax || allowOverflow) && !isInputValueEmpty": false,
    "addOnBlur": false,
    "clearOnBlur": false,
    "autoFocus": false,
    "!hasFocusedId": false,
    "addOnBlur": false,
    "clearOnBlur": false,
    "hasTags && isInputCaretAtStart": false,
    "hasTags && isInputCaretAtStart": false,
    "addOnPaste": false,
    "hasTags && isInputCaretAtStart && !isLastTagFocused": false,
    "allowEditTag": false,
    "isFirstTagFocused": false,
    "isInputRelatedTarget": false
  },
  activities: ["trackFormReset"],
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
    DELETE_TAG: {
      actions: ["deleteTag"]
    },
    SET_VALUE_AT_INDEX: {
      actions: ["setValueAtIndex"]
    },
    CLEAR_ALL: {
      actions: ["clearTags", "focusInput"]
    },
    ADD_TAG: {
      // (!isAtMax || allowOverflow) && !inputValueIsEmpty
      cond: "(!isAtMax || allowOverflow) && !isInputValueEmpty",
      actions: ["addTag", "clearInputValue"]
    },
    EXT_BLUR: [{
      cond: "addOnBlur",
      actions: "raiseAddTagEvent"
    }, {
      cond: "clearOnBlur",
      actions: "clearInputValue"
    }]
  },
  on: {
    UPDATE_CONTEXT: {
      actions: "updateContext"
    }
  },
  states: {
    unknown: {
      on: {
        SETUP: [{
          cond: "autoFocus",
          target: "focused:input",
          actions: ["checkValue"]
        }, {
          target: "idle",
          actions: ["checkValue"]
        }]
      }
    },
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
          cond: "allowEditTag",
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
      activities: ["autoResizeTagInput"],
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
          actions: ["clearEditedTagValue", "clearFocusedId", "clearEditedId", "raiseExtBlurEvent"]
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
    "autoFocus": ctx => ctx["autoFocus"],
    "!hasFocusedId": ctx => ctx["!hasFocusedId"],
    "hasTags && isInputCaretAtStart": ctx => ctx["hasTags && isInputCaretAtStart"],
    "addOnPaste": ctx => ctx["addOnPaste"],
    "hasTags && isInputCaretAtStart && !isLastTagFocused": ctx => ctx["hasTags && isInputCaretAtStart && !isLastTagFocused"],
    "isFirstTagFocused": ctx => ctx["isFirstTagFocused"],
    "isInputRelatedTarget": ctx => ctx["isInputRelatedTarget"]
  }
});