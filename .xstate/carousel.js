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
    "GOTO.NEXT": {
      target: "idle",
      actions: ["clearScrollEndTimer", "setNextSnapIndex"]
    },
    "GOTO.PREV": {
      target: "idle",
      actions: ["clearScrollEndTimer", "setPrevSnapIndex"]
    },
    GOTO: {
      target: "idle",
      actions: ["clearScrollEndTimer", "setSnapIndex"]
    },
    "GOTO.INDEX": {
      target: "idle",
      actions: ["clearScrollEndTimer", "setMatchingSnapIndex"]
    },
    "SNAP.REFRESH": {
      actions: ["setSnapPoints", "clampSnapIndex"]
    }
  },
  activities: ["trackSlideMutation", "trackSlideIntersections"],
  entry: ["resetScrollPosition", "setSnapPoints", "setSnapIndex"],
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