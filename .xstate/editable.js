"use strict"

var _xstate = require("xstate")

const { actions, createMachine } = _xstate
const { choose } = actions
const fetchMachine = createMachine(
  {
    id: "editable",
    initial: "unknown",
    context: {
      startWithEditView: false,
      activateOnDblClick: false,
      activateOnFocus: false,
      "!isAtMaxLength": false,
      submitOnBlur: false,
      submitOnEnter: false,
    },
    on: {
      SET_VALUE: {
        actions: ["setValue", "invokeOnChange"],
      },
    },
    states: {
      unknown: {
        on: {
          SETUP: [
            {
              cond: "startWithEditView",
              target: "edit",
              actions: "setupDocument",
            },
            {
              target: "preview",
              actions: "setupDocument",
            },
          ],
        },
      },
      preview: {
        entry: "clearPointerdownNode",
        on: {
          EDIT: "edit",
          DBLCLICK: {
            cond: "activateOnDblClick",
            target: "edit",
          },
          FOCUS: {
            cond: "activateOnFocus",
            target: "edit",
            actions: "setPreviousValue",
          },
        },
      },
      edit: {
        activities: "trackPointerDown",
        entry: ["focusInput", "invokeOnEdit"],
        on: {
          TYPE: {
            cond: "!isAtMaxLength",
            actions: ["setValue", "invokeOnChange"],
          },
          BLUR: [
            {
              cond: "submitOnBlur",
              target: "preview",
              actions: ["focusEditButton", "invokeOnSubmit"],
            },
            {
              target: "preview",
              actions: ["revertValue", "focusEditButton", "invokeOnCancel"],
            },
          ],
          CANCEL: {
            target: "preview",
            actions: ["focusEditButton", "revertValue", "invokeOnCancel"],
          },
          ENTER: {
            cond: "submitOnEnter",
            target: "preview",
            actions: ["setPreviousValue", "invokeOnSubmit", "focusEditButton"],
          },
          SUBMIT: {
            target: "preview",
            actions: ["setPreviousValue", "invokeOnSubmit", "focusEditButton"],
          },
        },
      },
    },
  },
  {
    guards: {
      startWithEditView: (ctx) => ctx["startWithEditView"],
      activateOnDblClick: (ctx) => ctx["activateOnDblClick"],
      activateOnFocus: (ctx) => ctx["activateOnFocus"],
      "!isAtMaxLength": (ctx) => ctx["!isAtMaxLength"],
      submitOnBlur: (ctx) => ctx["submitOnBlur"],
      submitOnEnter: (ctx) => ctx["submitOnEnter"],
    },
  },
)
