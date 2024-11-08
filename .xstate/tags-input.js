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
    "isTagEditable": false,
    "(!isAtMax || allowOverflow) && !isInputValueEmpty": false,
    "addOnBlur": false,
    "clearOnBlur": false,
    "!hasHighlightedTag": false,
    "addOnBlur": false,
    "clearOnBlur": false,
    "hasTags && isInputCaretAtStart": false,
    "hasTags && isInputCaretAtStart": false,
    "hasHighlightedTag": false,
    "addOnPaste": false,
    "hasTags && isInputCaretAtStart && !isLastTagHighlighted": false,
    "isTagEditable && hasHighlightedTag": false,
    "isFirstTagHighlighted": false,
    "hasHighlightedTag": false,
    "addOnPaste": false,
    "isInputRelatedTarget": false,
    "isEditedTagEmpty": false
  },
  activities: ["trackLiveRegion", "trackFormControlState"],
  exit: ["clearLog"],
  on: {
    DOUBLE_CLICK_TAG: {
      internal: true,
      cond: "isTagEditable",
      target: "editing:tag",
      actions: ["setEditedId", "initializeEditedTagValue"]
    },
    POINTER_DOWN_TAG: {
      internal: true,
      target: "navigating:tag",
      actions: ["highlightTag", "focusInput"]
    },
    CLICK_DELETE_TAG: {
      target: "focused:input",
      actions: ["deleteTag"]
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
      actions: ["addTag"]
    },
    INSERT_TAG: {
      // (!isAtMax || allowOverflow) && !inputValueIsEmpty
      cond: "(!isAtMax || allowOverflow) && !isInputValueEmpty",
      actions: ["addTag", "clearInputValue"]
    },
    EXTERNAL_BLUR: [{
      cond: "addOnBlur",
      actions: "raiseInsertTagEvent"
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
    idle: {
      on: {
        FOCUS: "focused:input",
        POINTER_DOWN: {
          cond: "!hasHighlightedTag",
          target: "focused:input"
        }
      }
    },
    "focused:input": {
      tags: ["focused"],
      entry: ["focusInput", "clearHighlightedId"],
      activities: ["trackInteractOutside"],
      on: {
        TYPE: {
          actions: "setInputValue"
        },
        BLUR: [{
          cond: "addOnBlur",
          target: "idle",
          actions: "raiseInsertTagEvent"
        }, {
          cond: "clearOnBlur",
          target: "idle",
          actions: "clearInputValue"
        }, {
          target: "idle"
        }],
        ENTER: {
          actions: ["raiseInsertTagEvent"]
        },
        DELIMITER_KEY: {
          actions: ["raiseInsertTagEvent"]
        },
        ARROW_LEFT: {
          cond: "hasTags && isInputCaretAtStart",
          target: "navigating:tag",
          actions: "highlightLastTag"
        },
        BACKSPACE: {
          target: "navigating:tag",
          cond: "hasTags && isInputCaretAtStart",
          actions: "highlightLastTag"
        },
        DELETE: {
          cond: "hasHighlightedTag",
          actions: ["deleteHighlightedTag", "highlightTagAtIndex"]
        },
        PASTE: [{
          cond: "addOnPaste",
          actions: ["setInputValue", "addTagFromPaste"]
        }, {
          actions: "setInputValue"
        }]
      }
    },
    "navigating:tag": {
      tags: ["focused"],
      activities: ["trackInteractOutside"],
      on: {
        ARROW_RIGHT: [{
          cond: "hasTags && isInputCaretAtStart && !isLastTagHighlighted",
          actions: "highlightNextTag"
        }, {
          target: "focused:input"
        }],
        ARROW_LEFT: {
          actions: "highlightPrevTag"
        },
        BLUR: {
          target: "idle",
          actions: "clearHighlightedId"
        },
        ENTER: {
          cond: "isTagEditable && hasHighlightedTag",
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
          cond: "isFirstTagHighlighted",
          actions: ["deleteHighlightedTag", "highlightFirstTag"]
        }, {
          cond: "hasHighlightedTag",
          actions: ["deleteHighlightedTag", "highlightPrevTag"]
        }, {
          actions: ["highlightLastTag"]
        }],
        DELETE: {
          target: "focused:input",
          actions: ["deleteHighlightedTag", "highlightTagAtIndex"]
        },
        PASTE: [{
          cond: "addOnPaste",
          target: "focused:input",
          actions: ["setInputValue", "addTagFromPaste"]
        }, {
          target: "focused:input",
          actions: "setInputValue"
        }]
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
          actions: ["clearEditedTagValue", "focusInput", "clearEditedId", "highlightTagAtIndex"]
        },
        TAG_INPUT_BLUR: [{
          cond: "isInputRelatedTarget",
          target: "navigating:tag",
          actions: ["clearEditedTagValue", "clearHighlightedId", "clearEditedId"]
        }, {
          target: "idle",
          actions: ["clearEditedTagValue", "clearHighlightedId", "clearEditedId", "raiseExternalBlurEvent"]
        }],
        TAG_INPUT_ENTER: [{
          cond: "isEditedTagEmpty",
          target: "navigating:tag",
          actions: ["deleteHighlightedTag", "focusInput", "clearEditedId", "highlightTagAtIndex"]
        }, {
          target: "navigating:tag",
          actions: ["submitEditedTagValue", "focusInput", "clearEditedId", "highlightTagAtIndex"]
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
    "isTagEditable": ctx => ctx["isTagEditable"],
    "(!isAtMax || allowOverflow) && !isInputValueEmpty": ctx => ctx["(!isAtMax || allowOverflow) && !isInputValueEmpty"],
    "addOnBlur": ctx => ctx["addOnBlur"],
    "clearOnBlur": ctx => ctx["clearOnBlur"],
    "!hasHighlightedTag": ctx => ctx["!hasHighlightedTag"],
    "hasTags && isInputCaretAtStart": ctx => ctx["hasTags && isInputCaretAtStart"],
    "hasHighlightedTag": ctx => ctx["hasHighlightedTag"],
    "addOnPaste": ctx => ctx["addOnPaste"],
    "hasTags && isInputCaretAtStart && !isLastTagHighlighted": ctx => ctx["hasTags && isInputCaretAtStart && !isLastTagHighlighted"],
    "isTagEditable && hasHighlightedTag": ctx => ctx["isTagEditable && hasHighlightedTag"],
    "isFirstTagHighlighted": ctx => ctx["isFirstTagHighlighted"],
    "isInputRelatedTarget": ctx => ctx["isInputRelatedTarget"],
    "isEditedTagEmpty": ctx => ctx["isEditedTagEmpty"]
  }
});