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
    "!isTagHighlighted": false,
    "(!isAtMax || allowOverflow) && !isInputValueEmpty": false,
    "addOnBlur": false,
    "clearOnBlur": false,
    "!hasHighlightedTag": false,
    "addOnBlur": false,
    "clearOnBlur": false,
    "hasTags && isInputCaretAtStart": false,
    "hasTags && isInputCaretAtStart": false,
    "addOnPaste": false,
    "hasTags && isInputCaretAtStart && !isLastTagHighlighted": false,
    "allowEditTag && hasHighlightedTag": false,
    "isFirstTagHighlighted": false,
    "isInputRelatedTarget": false
  },
  activities: ["trackLiveRegion", "trackFormControlState"],
  exit: ["clearLog"],
  on: {
    DOUBLE_CLICK_TAG: {
      internal: true,
      cond: "allowEditTag",
      target: "editing:tag",
      actions: ["setEditedId", "initializeEditedTagValue"]
    },
    POINTER_DOWN_TAG: {
      internal: true,
      cond: "!isTagHighlighted",
      target: "navigating:tag",
      actions: ["highlightTag", "focusInput"]
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
          actions: "highlightLastTag"
        },
        BACKSPACE: {
          target: "navigating:tag",
          cond: "hasTags && isInputCaretAtStart",
          actions: "highlightLastTag"
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
          cond: "allowEditTag && hasHighlightedTag",
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
          actions: ["deleteHighlightedTag", "highlightPrevTag"]
        }],
        DELETE: {
          actions: ["deleteHighlightedTag", "highlightTagAtIndex"]
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
        TAG_INPUT_ENTER: {
          target: "navigating:tag",
          actions: ["submitEditedTagValue", "focusInput", "clearEditedId", "highlightTagAtIndex"]
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
    "!isTagHighlighted": ctx => ctx["!isTagHighlighted"],
    "(!isAtMax || allowOverflow) && !isInputValueEmpty": ctx => ctx["(!isAtMax || allowOverflow) && !isInputValueEmpty"],
    "addOnBlur": ctx => ctx["addOnBlur"],
    "clearOnBlur": ctx => ctx["clearOnBlur"],
    "!hasHighlightedTag": ctx => ctx["!hasHighlightedTag"],
    "hasTags && isInputCaretAtStart": ctx => ctx["hasTags && isInputCaretAtStart"],
    "addOnPaste": ctx => ctx["addOnPaste"],
    "hasTags && isInputCaretAtStart && !isLastTagHighlighted": ctx => ctx["hasTags && isInputCaretAtStart && !isLastTagHighlighted"],
    "allowEditTag && hasHighlightedTag": ctx => ctx["allowEditTag && hasHighlightedTag"],
    "isFirstTagHighlighted": ctx => ctx["isFirstTagHighlighted"],
    "isInputRelatedTarget": ctx => ctx["isInputRelatedTarget"]
  }
});