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
        "CONTROLLED.OPEN": {
          target: "open",
          actions: ["computeSize"]
        },
        OPEN: [{
          cond: "isOpenControlled",
          actions: ["invokeOnOpen"]
        }, {
          target: "open",
          actions: ["allowAnimation", "invokeOnOpen"]
        }]
      }
    },
    closing: {
      tags: ["open"],
      activities: ["trackAnimationEvents"],
      on: {
        "CONTROLLED.CLOSE": {
          target: "closed",
          actions: ["invokeOnExitComplete"]
        },
        "CONTROLLED.OPEN": "open",
        OPEN: [{
          cond: "isOpenControlled",
          actions: ["invokeOnOpen"]
        }, {
          target: "open",
          actions: ["allowAnimation", "invokeOnOpen"]
        }],
        CLOSE: [{
          cond: "isOpenControlled",
          actions: ["invokeOnClose"]
        }, {
          target: "closed",
          actions: ["allowAnimation", "computeSize", "invokeOnExitComplete"]
        }],
        "ANIMATION.END": {
          target: "closed",
          actions: ["invokeOnExitComplete"]
        }
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
          actions: ["allowAnimation", "computeSize"]
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