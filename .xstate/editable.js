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
  initial: ctx.edit ? "edit" : "preview",
  entry: ctx.edit ? ["focusInput"] : undefined,
  context: {
    "isEditControlled": false,
    "isSubmitEvent": false,
    "isEditControlled": false,
    "isEditControlled": false
  },
  on: {
    "VALUE.SET": {
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
        "CONTROLLED.EDIT": {
          target: "edit",
          actions: ["setPreviousValue", "focusInput"]
        },
        EDIT: [{
          cond: "isEditControlled",
          actions: ["invokeOnEdit"]
        }, {
          target: "edit",
          actions: ["setPreviousValue", "focusInput", "invokeOnEdit"]
        }]
      }
    },
    edit: {
      activities: ["trackInteractOutside"],
      on: {
        "CONTROLLED.PREVIEW": [{
          cond: "isSubmitEvent",
          target: "preview",
          actions: ["setPreviousValue", "restoreFocus", "invokeOnSubmit"]
        }, {
          target: "preview",
          actions: ["revertValue", "restoreFocus", "invokeOnCancel"]
        }],
        CANCEL: [{
          cond: "isEditControlled",
          actions: ["invokeOnPreview"]
        }, {
          target: "preview",
          actions: ["revertValue", "restoreFocus", "invokeOnCancel", "invokeOnPreview"]
        }],
        SUBMIT: [{
          cond: "isEditControlled",
          actions: ["invokeOnPreview"]
        }, {
          target: "preview",
          actions: ["setPreviousValue", "restoreFocus", "invokeOnSubmit", "invokeOnPreview"]
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
    "isEditControlled": ctx => ctx["isEditControlled"],
    "isSubmitEvent": ctx => ctx["isSubmitEvent"]
  }
});