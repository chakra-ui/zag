"use strict"

var _xstate = require("xstate")

const { actions, createMachine } = _xstate
const { choose } = actions
const fetchMachine = createMachine(
  {
    id: "dialog",
    initial: "unknown",
    context: {
      "isTopMostDialog && closeOnOutsideClick && isValidUnderlayClick": false,
    },
    states: {
      unknown: {
        on: {
          SETUP: {
            target: "closed",
            actions: "setupDocument",
          },
        },
      },
      open: {
        entry: ["checkRenderedElements"],
        activities: [
          "trapFocus",
          "preventScroll",
          "hideContentBelow",
          "subscribeToStore",
          "trackEscKey",
          "trackPointerDown",
        ],
        on: {
          CLOSE: "closed",
          TRIGGER_CLICK: "closed",
          UNDERLAY_CLICK: {
            cond: "isTopMostDialog && closeOnOutsideClick && isValidUnderlayClick",
            target: "closed",
            actions: ["invokeOnOutsideClick"],
          },
        },
      },
      closed: {
        entry: ["invokeOnClose", "clearPointerdownNode"],
        on: {
          OPEN: "open",
          TRIGGER_CLICK: "open",
        },
      },
    },
  },
  {
    guards: {
      "isTopMostDialog && closeOnOutsideClick && isValidUnderlayClick": (ctx) =>
        ctx["isTopMostDialog && closeOnOutsideClick && isValidUnderlayClick"],
    },
  },
)
