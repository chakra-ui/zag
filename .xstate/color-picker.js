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
  id: "color-picker",
  initial: ctx.open ? "open" : "idle",
  context: {
    "shouldRestoreFocus": false,
    "shouldRestoreFocus": false
  },
  activities: ["trackFormControl"],
  on: {
    "VALUE.SET": {
      actions: ["setValue"]
    },
    "CHANNEL_INPUT.CHANGE": {
      actions: ["setChannelColorFromInput"]
    }
  },
  on: {
    UPDATE_CONTEXT: {
      actions: "updateContext"
    }
  },
  states: {
    idle: {
      tags: ["closed"],
      on: {
        OPEN: {
          target: "open",
          actions: ["setInitialFocus", "invokeOnOpen"]
        },
        "TRIGGER.CLICK": {
          target: "open",
          actions: ["setInitialFocus", "invokeOnOpen"]
        },
        "CHANNEL_INPUT.FOCUS": {
          target: "focused",
          actions: ["setActiveChannel"]
        }
      }
    },
    focused: {
      tags: ["closed", "focused"],
      on: {
        OPEN: {
          target: "open",
          actions: ["setInitialFocus", "invokeOnOpen"]
        },
        "TRIGGER.CLICK": {
          target: "open",
          actions: ["setInitialFocus", "invokeOnOpen"]
        },
        "CHANNEL_INPUT.FOCUS": {
          actions: ["setActiveChannel"]
        },
        "CHANNEL_INPUT.BLUR": {
          target: "idle",
          actions: ["setChannelColorFromInput"]
        }
      }
    },
    open: {
      tags: ["open"],
      activities: ["trackPositioning", "trackDismissableElement"],
      on: {
        "TRIGGER.CLICK": {
          target: "idle",
          actions: ["invokeOnClose"]
        },
        "EYEDROPPER.CLICK": {
          actions: ["openEyeDropper"]
        },
        "AREA.POINTER_DOWN": {
          target: "open:dragging",
          actions: ["setActiveChannel", "setAreaColorFromPoint", "focusAreaThumb"]
        },
        "AREA.FOCUS": {
          actions: ["setActiveChannel"]
        },
        "CHANNEL_SLIDER.POINTER_DOWN": {
          target: "open:dragging",
          actions: ["setActiveChannel", "setChannelColorFromPoint", "focusChannelThumb"]
        },
        "CHANNEL_SLIDER.FOCUS": {
          actions: ["setActiveChannel"]
        },
        "AREA.ARROW_LEFT": {
          actions: ["decrementXChannel"]
        },
        "AREA.ARROW_RIGHT": {
          actions: ["incrementXChannel"]
        },
        "AREA.ARROW_UP": {
          actions: ["incrementYChannel"]
        },
        "AREA.ARROW_DOWN": {
          actions: ["decrementYChannel"]
        },
        "AREA.PAGE_UP": {
          actions: ["incrementXChannel"]
        },
        "AREA.PAGE_DOWN": {
          actions: ["decrementXChannel"]
        },
        "CHANNEL_SLIDER.ARROW_LEFT": {
          actions: ["decrementChannel"]
        },
        "CHANNEL_SLIDER.ARROW_RIGHT": {
          actions: ["incrementChannel"]
        },
        "CHANNEL_SLIDER.ARROW_UP": {
          actions: ["incrementChannel"]
        },
        "CHANNEL_SLIDER.ARROW_DOWN": {
          actions: ["decrementChannel"]
        },
        "CHANNEL_SLIDER.PAGE_UP": {
          actions: ["incrementChannel"]
        },
        "CHANNEL_SLIDER.PAGE_DOWN": {
          actions: ["decrementChannel"]
        },
        "CHANNEL_SLIDER.HOME": {
          actions: ["setChannelToMin"]
        },
        "CHANNEL_SLIDER.END": {
          actions: ["setChannelToMax"]
        },
        "CHANNEL_INPUT.BLUR": {
          actions: ["setChannelColorFromInput"]
        },
        INTERACT_OUTSIDE: [{
          cond: "shouldRestoreFocus",
          target: "focused",
          actions: ["setReturnFocus", "invokeOnClose"]
        }, {
          target: "idle",
          actions: ["invokeOnClose"]
        }],
        CLOSE: {
          target: "idle",
          actions: ["invokeOnClose"]
        }
      }
    },
    "open:dragging": {
      tags: ["open"],
      exit: ["clearActiveChannel"],
      activities: ["trackPointerMove", "disableTextSelection", "trackPositioning", "trackDismissableElement"],
      on: {
        "AREA.POINTER_MOVE": {
          actions: ["setAreaColorFromPoint", "focusAreaThumb"]
        },
        "AREA.POINTER_UP": {
          target: "open",
          actions: ["invokeOnChangeEnd"]
        },
        "CHANNEL_SLIDER.POINTER_MOVE": {
          actions: ["setChannelColorFromPoint", "focusChannelThumb"]
        },
        "CHANNEL_SLIDER.POINTER_UP": {
          target: "open",
          actions: ["invokeOnChangeEnd"]
        },
        INTERACT_OUTSIDE: [{
          cond: "shouldRestoreFocus",
          target: "focused",
          actions: ["setReturnFocus", "invokeOnClose"]
        }, {
          target: "idle",
          actions: ["invokeOnClose"]
        }],
        CLOSE: {
          target: "idle",
          actions: ["invokeOnClose"]
        }
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
    "shouldRestoreFocus": ctx => ctx["shouldRestoreFocus"]
  }
});