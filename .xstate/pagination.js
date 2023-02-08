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
  initial: "idle",
  context: {
    "isValidCount": false,
    "isValidPage": false,
    "canGoToPrevPage": false,
    "canGoToNextPage": false
  },
  on: {
    SET_COUNT: [{
      cond: "isValidCount",
      actions: ["setCount", "goToFirstPage"]
    }, {
      actions: "setCount"
    }],
    SET_PAGE: {
      cond: "isValidPage",
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
    idle: {}
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
    "isValidCount": ctx => ctx["isValidCount"],
    "isValidPage": ctx => ctx["isValidPage"],
    "canGoToPrevPage": ctx => ctx["canGoToPrevPage"],
    "canGoToNextPage": ctx => ctx["canGoToNextPage"]
  }
});