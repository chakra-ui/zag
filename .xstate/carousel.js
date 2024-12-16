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
        "DRAGGING.START": "dragging",
        "AUTOPLAY.START": "autoplay"
      }
    },
    dragging: {
      activities: ["trackPointerMove"],
      entry: ["disableScrollSnap"],
      on: {
        DRAGGING: {
          actions: ["scrollSlides"]
        },
        "DRAGGING.END": {
          target: "idle",
          actions: ["endDragging"]
        }
      }
    },
    autoplay: {
      activities: ["trackDocumentVisibility", "trackScroll"],
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