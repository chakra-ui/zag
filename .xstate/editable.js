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
  id: "editable",
  initial: ctx.startWithEditView ? "edit" : "preview",
  entry: ctx.startWithEditView ? ["focusInput"] : undefined,
  context: {
    "activateOnDblClick": false,
    "activateOnFocus": false,
    "!isAtMaxLength": false,
    "submitOnBlur": false,
    "submitOnEnter": false
  },
  on: {
    SET_VALUE: {
      actions: "setValue"
    }
  },
  on: {
    UPDATE_CONTEXT: {
      actions: "updateContext"
    }
  },
  states: {
    preview: {
      // // https://bugzilla.mozilla.org/show_bug.cgi?id=559561
      entry: ["blurInputIfNeeded"],
      on: {
        EDIT: {
          target: "edit",
          actions: ["focusInput", "invokeOnEdit"]
        },
        DBLCLICK: {
          cond: "activateOnDblClick",
          target: "edit",
          actions: ["focusInput", "invokeOnEdit"]
        },
        FOCUS: {
          cond: "activateOnFocus",
          target: "edit",
          actions: ["setPreviousValue", "focusInput", "invokeOnEdit"]
        }
      }
    },
    edit: {
      activities: ["trackInteractOutside"],
      on: {
        TYPE: {
          cond: "!isAtMaxLength",
          actions: "setValue"
        },
        BLUR: [{
          cond: "submitOnBlur",
          target: "preview",
          actions: ["restoreFocus", "invokeOnSubmit"]
        }, {
          target: "preview",
          actions: ["revertValue", "restoreFocus", "invokeOnCancel"]
        }],
        CANCEL: {
          target: "preview",
          actions: ["revertValue", "restoreFocus", "invokeOnCancel"]
        },
        ENTER: {
          cond: "submitOnEnter",
          target: "preview",
          actions: ["setPreviousValue", "invokeOnSubmit", "restoreFocus"]
        },
        SUBMIT: {
          target: "preview",
          actions: ["setPreviousValue", "invokeOnSubmit", "restoreFocus"]
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
    "activateOnDblClick": ctx => ctx["activateOnDblClick"],
    "activateOnFocus": ctx => ctx["activateOnFocus"],
    "!isAtMaxLength": ctx => ctx["!isAtMaxLength"],
    "submitOnBlur": ctx => ctx["submitOnBlur"],
    "submitOnEnter": ctx => ctx["submitOnEnter"]
  }
});