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
    "isOpenControlled": false,
    "isOpenControlled": false,
    "isOpenControlled": false,
    "isOpenControlled": false,
    "shouldRestoreFocus": false,
    "isOpenControlled": false,
    "isOpenControlled": false,
    "shouldRestoreFocus": false,
    "isOpenControlled": false,
    "isOpenControlled && closeOnSelect": false,
    "closeOnSelect": false,
    "shouldRestoreFocus": false,
    "isOpenControlled": false,
    "shouldRestoreFocus": false,
    "isOpenControlled": false
  },
  activities: ["trackFormControl"],
  on: {
    "VALUE.SET": {
      actions: ["setValue"]
    },
    "FORMAT.SET": {
      actions: ["setFormat"]
    },
    "CHANNEL_INPUT.CHANGE": {
      actions: ["setChannelColorFromInput"]
    },
    "EYEDROPPER.CLICK": {
      actions: ["openEyeDropper"]
    },
    "SWATCH_TRIGGER.CLICK": {
      actions: ["setValue"]
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
        "CONTROLLED.OPEN": {
          target: "open",
          actions: ["setInitialFocus"]
        },
        OPEN: [{
          cond: "isOpenControlled",
          actions: ["invokeOnOpen"]
        }, {
          target: "open",
          actions: ["invokeOnOpen", "setInitialFocus"]
        }],
        "TRIGGER.CLICK": [{
          cond: "isOpenControlled",
          actions: ["invokeOnOpen"]
        }, {
          target: "open",
          actions: ["invokeOnOpen", "setInitialFocus"]
        }],
        "CHANNEL_INPUT.FOCUS": {
          target: "focused",
          actions: ["setActiveChannel"]
        }
      }
    },
    focused: {
      tags: ["closed", "focused"],
      on: {
        "CONTROLLED.OPEN": {
          target: "open",
          actions: ["setInitialFocus"]
        },
        OPEN: [{
          cond: "isOpenControlled",
          actions: ["invokeOnOpen"]
        }, {
          target: "open",
          actions: ["invokeOnOpen", "setInitialFocus"]
        }],
        "TRIGGER.CLICK": [{
          cond: "isOpenControlled",
          actions: ["invokeOnOpen"]
        }, {
          target: "open",
          actions: ["invokeOnOpen", "setInitialFocus"]
        }],
        "CHANNEL_INPUT.FOCUS": {
          actions: ["setActiveChannel"]
        },
        "CHANNEL_INPUT.BLUR": {
          target: "idle",
          actions: ["setChannelColorFromInput"]
        },
        "TRIGGER.BLUR": {
          target: "idle"
        }
      }
    },
    open: {
      tags: ["open"],
      activities: ["trackPositioning", "trackDismissableElement"],
      on: {
        "CONTROLLED.CLOSE": [{
          cond: "shouldRestoreFocus",
          target: "focused",
          actions: ["setReturnFocus"]
        }, {
          target: "idle"
        }],
        "TRIGGER.CLICK": [{
          cond: "isOpenControlled",
          actions: ["invokeOnClose"]
        }, {
          target: "idle",
          actions: ["invokeOnClose"]
        }],
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
          actions: ["decrementAreaXChannel"]
        },
        "AREA.ARROW_RIGHT": {
          actions: ["incrementAreaXChannel"]
        },
        "AREA.ARROW_UP": {
          actions: ["incrementAreaYChannel"]
        },
        "AREA.ARROW_DOWN": {
          actions: ["decrementAreaYChannel"]
        },
        "AREA.PAGE_UP": {
          actions: ["incrementAreaXChannel"]
        },
        "AREA.PAGE_DOWN": {
          actions: ["decrementAreaXChannel"]
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
          cond: "isOpenControlled",
          actions: ["invokeOnClose"]
        }, {
          cond: "shouldRestoreFocus",
          target: "focused",
          actions: ["invokeOnClose", "setReturnFocus"]
        }, {
          target: "idle",
          actions: ["invokeOnClose"]
        }],
        CLOSE: [{
          cond: "isOpenControlled",
          actions: ["invokeOnClose"]
        }, {
          target: "idle",
          actions: ["invokeOnClose"]
        }],
        "SWATCH_TRIGGER.CLICK": [{
          cond: "isOpenControlled && closeOnSelect",
          actions: ["setValue", "invokeOnClose"]
        }, {
          cond: "closeOnSelect",
          target: "focused",
          actions: ["setValue", "invokeOnClose", "setReturnFocus"]
        }, {
          actions: ["setValue"]
        }]
      }
    },
    "open:dragging": {
      tags: ["open"],
      exit: ["clearActiveChannel"],
      activities: ["trackPointerMove", "disableTextSelection", "trackPositioning", "trackDismissableElement"],
      on: {
        "CONTROLLED.CLOSE": [{
          cond: "shouldRestoreFocus",
          target: "focused",
          actions: ["setReturnFocus"]
        }, {
          target: "idle"
        }],
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
          cond: "isOpenControlled",
          actions: ["invokeOnClose"]
        }, {
          cond: "shouldRestoreFocus",
          target: "focused",
          actions: ["invokeOnClose", "setReturnFocus"]
        }, {
          target: "idle",
          actions: ["invokeOnClose"]
        }],
        CLOSE: [{
          cond: "isOpenControlled",
          actions: ["invokeOnClose"]
        }, {
          target: "idle",
          actions: ["invokeOnClose"]
        }]
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
    "isOpenControlled": ctx => ctx["isOpenControlled"],
    "shouldRestoreFocus": ctx => ctx["shouldRestoreFocus"],
    "isOpenControlled && closeOnSelect": ctx => ctx["isOpenControlled && closeOnSelect"],
    "closeOnSelect": ctx => ctx["closeOnSelect"]
  }
});