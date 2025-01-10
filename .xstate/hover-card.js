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
  id: "hover-card",
  initial: ctx.open ? "open" : "closed",
  context: {
    "isOpenControlled": false,
    "isOpenControlled": false,
    "isOpenControlled && !isPointer": false,
    "!isPointer": false,
    "isOpenControlled": false,
    "isOpenControlled": false,
    "isOpenControlled && !isPointer": false,
    "!isPointer": false,
    "isOpenControlled": false
  },
  on: {
    UPDATE_CONTEXT: {
      actions: "updateContext"
    }
  },
  states: {
    closed: {
      tags: ["closed"],
      entry: ["clearIsPointer"],
      on: {
        "CONTROLLED.OPEN": "open",
        POINTER_ENTER: {
          target: "opening",
          actions: ["setIsPointer"]
        },
        TRIGGER_FOCUS: "opening",
        OPEN: "opening"
      }
    },
    opening: {
      tags: ["closed"],
      after: {
        OPEN_DELAY: [{
          cond: "isOpenControlled",
          actions: ["invokeOnOpen"]
        }, {
          target: "open",
          actions: ["invokeOnOpen"]
        }]
      },
      on: {
        "CONTROLLED.OPEN": "open",
        "CONTROLLED.CLOSE": "closed",
        POINTER_LEAVE: [{
          cond: "isOpenControlled",
          // We trigger toggleVisibility manually since the `ctx.open` has not changed yet (at this point)
          actions: ["invokeOnClose", "toggleVisibility"]
        }, {
          target: "closed",
          actions: ["invokeOnClose"]
        }],
        TRIGGER_BLUR: [{
          cond: "isOpenControlled && !isPointer",
          // We trigger toggleVisibility manually since the `ctx.open` has not changed yet (at this point)
          actions: ["invokeOnClose", "toggleVisibility"]
        }, {
          cond: "!isPointer",
          target: "closed",
          actions: ["invokeOnClose"]
        }],
        CLOSE: [{
          cond: "isOpenControlled",
          // We trigger toggleVisibility manually since the `ctx.open` has not changed yet (at this point)
          actions: ["invokeOnClose", "toggleVisibility"]
        }, {
          target: "closed",
          actions: ["invokeOnClose"]
        }]
      }
    },
    open: {
      tags: ["open"],
      activities: ["trackDismissableElement", "trackPositioning"],
      on: {
        "CONTROLLED.CLOSE": "closed",
        POINTER_ENTER: {
          actions: ["setIsPointer"]
        },
        POINTER_LEAVE: "closing",
        CLOSE: [{
          cond: "isOpenControlled",
          actions: ["invokeOnClose"]
        }, {
          target: "closed",
          actions: ["invokeOnClose"]
        }],
        TRIGGER_BLUR: [{
          cond: "isOpenControlled && !isPointer",
          actions: ["invokeOnClose"]
        }, {
          cond: "!isPointer",
          target: "closed",
          actions: ["invokeOnClose"]
        }],
        "POSITIONING.SET": {
          actions: "reposition"
        }
      }
    },
    closing: {
      tags: ["open"],
      activities: ["trackPositioning"],
      after: {
        CLOSE_DELAY: [{
          cond: "isOpenControlled",
          actions: ["invokeOnClose"]
        }, {
          target: "closed",
          actions: ["invokeOnClose"]
        }]
      },
      on: {
        "CONTROLLED.CLOSE": "closed",
        "CONTROLLED.OPEN": "open",
        POINTER_ENTER: {
          target: "open",
          // no need to invokeOnOpen here because it's still open (but about to close)
          actions: ["setIsPointer"]
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
    "isOpenControlled": ctx => ctx["isOpenControlled"],
    "isOpenControlled && !isPointer": ctx => ctx["isOpenControlled && !isPointer"],
    "!isPointer": ctx => ctx["!isPointer"]
  }
});