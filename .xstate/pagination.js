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
  id: "pagination",
  initial: "unknown",
  context: {
    "countIsOutOfRange": false,
    "isWithinBounds": false,
    "canGoToPrevPage": false,
    "canGoToNextPage": false
  },
  on: {
    SET_COUNT: [{
      cond: "countIsOutOfRange",
      actions: ["setCount", "goToFirstPage"]
    }, {
      actions: "setCount"
    }],
    SET_PAGE: {
      cond: "isWithinBounds",
      actions: "setPage"
    },
    SET_PAGE_SIZE: {
      actions: "setPageSize"
    },
    PREVIOUS_PAGE: {
      cond: "canGoToPrevPage",
      actions: "goToPrevPage"
    },
    NEXT_PAGE: {
      cond: "canGoToNextPage",
      actions: "goToNextPage"
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
        SETUP: "idle"
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
    "countIsOutOfRange": ctx => ctx["countIsOutOfRange"],
    "isWithinBounds": ctx => ctx["isWithinBounds"],
    "canGoToPrevPage": ctx => ctx["canGoToPrevPage"],
    "canGoToNextPage": ctx => ctx["canGoToNextPage"]
  }
});