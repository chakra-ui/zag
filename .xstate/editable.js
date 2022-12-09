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
  initial: "unknown",
  context: {
    "startWithEditView": false,
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
    unknown: {
      on: {
        SETUP: [{
          cond: "startWithEditView",
          target: "edit"
        }, {
          target: "preview"
        }]
      }
    },
    preview: {
      // // https://bugzilla.mozilla.org/show_bug.cgi?id=559561
      entry: ["blurInputIfNeeded"],
      on: {
        EDIT: "edit",
        DBLCLICK: {
          cond: "activateOnDblClick",
          target: "edit"
        },
        FOCUS: {
          cond: "activateOnFocus",
          target: "edit",
          actions: "setPreviousValue"
        }
      }
    },
    edit: {
      activities: ["trackInteractOutside"],
      entry: ["focusInput", "invokeOnEdit"],
      on: {
        TYPE: {
          cond: "!isAtMaxLength",
          actions: "setValue"
        },
        BLUR: [{
          cond: "submitOnBlur",
          target: "preview",
          actions: ["focusEditTrigger", "invokeOnSubmit"]
        }, {
          target: "preview",
          actions: ["resetValueIfNeeded", "focusEditTrigger", "invokeOnCancel"]
        }],
        CANCEL: {
          target: "preview",
          actions: ["focusEditTrigger", "resetValueIfNeeded", "invokeOnCancel"]
        },
        ENTER: {
          cond: "submitOnEnter",
          target: "preview",
          actions: ["setPreviousValue", "invokeOnSubmit", "focusEditTrigger"]
        },
        SUBMIT: {
          target: "preview",
          actions: ["setPreviousValue", "invokeOnSubmit", "focusEditTrigger"]
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
    "startWithEditView": ctx => ctx["startWithEditView"],
    "activateOnDblClick": ctx => ctx["activateOnDblClick"],
    "activateOnFocus": ctx => ctx["activateOnFocus"],
    "!isAtMaxLength": ctx => ctx["!isAtMaxLength"],
    "submitOnBlur": ctx => ctx["submitOnBlur"],
    "submitOnEnter": ctx => ctx["submitOnEnter"]
  }
});