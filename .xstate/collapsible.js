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
  id: "collapsible",
  initial: ctx.open ? "open" : "closed",
  context: {
    "isOpenControlled": false,
    "isOpenControlled": false,
    "isOpenControlled": false,
    "isOpenControlled": false
  },
  entry: ["computeSize"],
  exit: ["clearAnimationStyles"],
  activities: ["trackMountAnimation"],
  on: {
    UPDATE_CONTEXT: {
      actions: "updateContext"
    }
  },
  states: {
    closed: {
      tags: ["closed"],
      entry: ["computeSize"],
      on: {
        "CONTROLLED.OPEN": "open",
        OPEN: [{
          cond: "isOpenControlled",
          actions: ["invokeOnOpen"]
        }, {
          target: "open",
          actions: ["invokeOnOpen"]
        }]
      }
    },
    closing: {
      tags: ["open"],
      activities: ["trackAnimationEvents"],
      on: {
        "CONTROLLED.CLOSE": "closed",
        "CONTROLLED.OPEN": "open",
        OPEN: [{
          cond: "isOpenControlled",
          actions: ["invokeOnOpen"]
        }, {
          target: "open",
          actions: ["invokeOnOpen"]
        }],
        CLOSE: [{
          cond: "isOpenControlled",
          actions: ["invokeOnClose"]
        }, {
          target: "closed",
          actions: ["computeSize"]
        }],
        "ANIMATION.END": "closed"
      }
    },
    open: {
      tags: ["open"],
      on: {
        "CONTROLLED.CLOSE": {
          target: "closing",
          actions: ["computeSize"]
        },
        CLOSE: [{
          cond: "isOpenControlled",
          actions: ["invokeOnClose"]
        }, {
          target: "closing",
          actions: ["computeSize"]
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
    "isOpenControlled": ctx => ctx["isOpenControlled"]
  }
});