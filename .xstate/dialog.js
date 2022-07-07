"use strict"

var _xstate = require("xstate")

const { actions, createMachine, assign } = _xstate
const { choose } = actions
const fetchMachine = createMachine(
  {
    id: "dialog",
    initial: "unknown",
    context: {
      isDefaultOpen: false,
      "isTopMostDialog && closeOnOutsideClick && isValidUnderlayClick": false,
    },
    on: {
      UPDATE_CONTEXT: {
        actions: "updateContext",
      },
    },
    states: {
      unknown: {
        on: {
          SETUP: [
            {
              target: "open",
              cond: "isDefaultOpen",
            },
            {
              target: "closed",
            },
          ],
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
    actions: {
      updateContext: assign((context, event) => {
        return {
          [event.contextKey]: true,
        }
      }),
    },
    guards: {
      isDefaultOpen: (ctx) => ctx["isDefaultOpen"],
      "isTopMostDialog && closeOnOutsideClick && isValidUnderlayClick": (ctx) =>
        ctx["isTopMostDialog && closeOnOutsideClick && isValidUnderlayClick"],
    },
  },
)
