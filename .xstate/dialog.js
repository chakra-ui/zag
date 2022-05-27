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
  id: "dialog",
  initial: "unknown",
  context: {
    "isTopMostDialog && closeOnOutsideClick && isValidUnderlayClick": false
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
          target: "closed",
          cond: ctx => !ctx.defaultIsOpen,
          actions: "setupDocument"
        }, {
          target: "open",
          cond: ctx => !!ctx.defaultIsOpen,
          actions: "setupDocument"
        }]
      }
    },
    open: {
      entry: ["checkRenderedElements"],
      activities: ["trapFocus", "preventScroll", "hideContentBelow", "subscribeToStore", "trackEscKey", "trackPointerDown"],
      on: {
        CLOSE: "closed",
        TRIGGER_CLICK: "closed",
        UNDERLAY_CLICK: {
          cond: "isTopMostDialog && closeOnOutsideClick && isValidUnderlayClick",
          target: "closed",
          actions: ["invokeOnOutsideClick"]
        }
      }
    },
    closed: {
      entry: ["invokeOnClose", "clearPointerdownNode"],
      on: {
        OPEN: "open",
        TRIGGER_CLICK: "open"
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
    "isTopMostDialog && closeOnOutsideClick && isValidUnderlayClick": ctx => ctx["isTopMostDialog && closeOnOutsideClick && isValidUnderlayClick"]
  }
});