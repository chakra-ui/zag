"use strict"

var _xstate = require("xstate")

const { actions, createMachine } = _xstate
const { choose } = actions
const fetchMachine = createMachine(
  {
    id: "tooltip",
    initial: "unknown",
    context: {
      noVisibleTooltip: false,
      closeOnPointerDown: false,
      isVisible: false,
      isInteractive: false,
      closeOnPointerDown: false,
      isInteractive: false,
    },
    on: {
      OPEN: "open",
      CLOSE: "closed",
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
      closed: {
        tags: ["closed"],
        entry: ["clearGlobalId", "invokeOnClose"],
        on: {
          FOCUS: "open",
          POINTER_ENTER: [
            {
              cond: "noVisibleTooltip",
              target: "opening",
            },
            {
              target: "open",
            },
          ],
        },
      },
      opening: {
        tags: ["closed"],
        activities: ["trackScroll", "trackPointerlockChange"],
        after: {
          OPEN_DELAY: "open",
        },
        on: {
          POINTER_LEAVE: "closed",
          BLUR: "closed",
          SCROLL: "closed",
          POINTER_LOCK_CHANGE: "closed",
          POINTER_DOWN: {
            cond: "closeOnPointerDown",
            target: "closed",
          },
        },
      },
      open: {
        tags: ["open"],
        activities: [
          "trackEscapeKey",
          "trackDisabledTriggerOnSafari",
          "trackScroll",
          "trackPointerlockChange",
          "computePlacement",
        ],
        entry: ["setGlobalId", "invokeOnOpen"],
        on: {
          POINTER_LEAVE: [
            {
              cond: "isVisible",
              target: "closing",
            },
            {
              target: "closed",
            },
          ],
          BLUR: "closed",
          ESCAPE: "closed",
          SCROLL: "closed",
          POINTER_LOCK_CHANGE: "closed",
          TOOLTIP_POINTER_LEAVE: {
            cond: "isInteractive",
            target: "closing",
          },
          POINTER_DOWN: {
            cond: "closeOnPointerDown",
            target: "closed",
          },
          CLICK: "closed",
        },
      },
      closing: {
        tags: ["open"],
        activities: ["trackStore", "computePlacement"],
        after: {
          CLOSE_DELAY: "closed",
        },
        on: {
          FORCE_CLOSE: "closed",
          POINTER_ENTER: "open",
          TOOLTIP_POINTER_ENTER: {
            cond: "isInteractive",
            target: "open",
          },
        },
      },
    },
  },
  {
    guards: {
      noVisibleTooltip: (ctx) => ctx["noVisibleTooltip"],
      closeOnPointerDown: (ctx) => ctx["closeOnPointerDown"],
      isVisible: (ctx) => ctx["isVisible"],
      isInteractive: (ctx) => ctx["isInteractive"],
    },
  },
)
