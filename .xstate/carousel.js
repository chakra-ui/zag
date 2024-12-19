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
  id: "carousel",
  initial: ctx.autoplay ? "autoplay" : "idle",
  context: {},
  on: {
    "PAGE.NEXT": {
      target: "idle",
      actions: ["clearScrollEndTimer", "setNextPage"]
    },
    "PAGE.PREV": {
      target: "idle",
      actions: ["clearScrollEndTimer", "setPrevPage"]
    },
    "PAGE.SET": {
      target: "idle",
      actions: ["clearScrollEndTimer", "setPage"]
    },
    "INDEX.SET": {
      target: "idle",
      actions: ["clearScrollEndTimer", "setMatchingPage"]
    },
    "SNAP.REFRESH": {
      actions: ["setSnapPoints", "clampPage"]
    }
  },
  activities: ["trackSlideMutation", "trackSlideIntersections", "trackSlideResize"],
  entry: ["resetScrollPosition", "setSnapPoints", "setPage"],
  exit: ["clearScrollEndTimer"],
  on: {
    UPDATE_CONTEXT: {
      actions: "updateContext"
    }
  },
  states: {
    idle: {
      activities: ["trackScroll"],
      on: {
        "DRAGGING.START": {
          target: "dragging",
          actions: ["invokeDragStart"]
        },
        "AUTOPLAY.START": {
          target: "autoplay",
          actions: ["invokeAutoplayStart"]
        }
      }
    },
    dragging: {
      activities: ["trackPointerMove"],
      entry: ["disableScrollSnap"],
      on: {
        DRAGGING: {
          actions: ["scrollSlides", "invokeDragging"]
        },
        "DRAGGING.END": {
          target: "idle",
          actions: ["endDragging", "invokeDraggingEnd"]
        }
      }
    },
    autoplay: {
      activities: ["trackDocumentVisibility", "trackScroll"],
      exit: ["invokeAutoplayEnd"],
      invoke: {
        src: "interval",
        id: "interval"
      },
      on: {
        "DRAGGING.START": {
          target: "dragging",
          actions: ["invokeDragStart"]
        },
        "AUTOPLAY.PAUSE": "idle"
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
  guards: {}
});