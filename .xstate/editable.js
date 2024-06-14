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
    "submitOnBlur": false
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
      // https://bugzilla.mozilla.org/show_bug.cgi?id=559561
      entry: ["blurInputIfNeeded"],
      on: {
        EDIT: {
          target: "edit",
          actions: ["setPreviousValue", "focusInput", "invokeOnEdit"]
        }
      }
    },
    edit: {
      activities: ["trackInteractOutside"],
      on: {
        TYPE: {
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
        SUBMIT: {
          target: "preview",
          actions: ["setPreviousValue", "restoreFocus", "invokeOnSubmit"]
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
    "submitOnBlur": ctx => ctx["submitOnBlur"]
  }
});