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
    "currentPageIsAboveNewItemsCount": false,
    "isWithinBounds": false,
    "canGoToPrevPage": false,
    "canGoToNextPage": false
  },
  on: {
    UPDATE_ITEMS: [{
      cond: "currentPageIsAboveNewItemsCount",
      actions: ["updateItems", "goToFirstPage"]
    }, {
      actions: "updateItems"
    }],
    SET_PAGE: {
      actions: "setPage",
      cond: "isWithinBounds"
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
    "currentPageIsAboveNewItemsCount": ctx => ctx["currentPageIsAboveNewItemsCount"],
    "isWithinBounds": ctx => ctx["isWithinBounds"],
    "canGoToPrevPage": ctx => ctx["canGoToPrevPage"],
    "canGoToNextPage": ctx => ctx["canGoToNextPage"]
  }
});