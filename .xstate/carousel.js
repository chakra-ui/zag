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
    "SLIDE.MUTATION": {
      actions: ["setSnapPoints"]
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
        MOUSE_DOWN: "dragging",
        "AUTOPLAY.START": "autoplay"
      }
    },
    dragging: {
      activities: ["trackPointerMove"],
      entry: ["disableScrollSnap"],
      on: {
        POINTER_MOVE: {
          actions: ["scrollSlides"]
        },
        POINTER_UP: {
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