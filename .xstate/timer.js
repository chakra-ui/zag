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
  id: "timer",
  initial: ctx.autostart ? "running" : "idle",
  context: {
    "isCountdownComplete": false
  },
  on: {
    RESTART: {
      target: "running",
      actions: "resetTime"
    }
  },
  on: {
    UPDATE_CONTEXT: {
      actions: "updateContext"
    }
  },
  states: {
    idle: {
      on: {
        START: "running",
        RESET: {
          actions: "resetTime"
        }
      }
    },
    running: {
      invoke: {
        src: "interval",
        id: "interval"
      },
      on: {
        PAUSE: "paused",
        TICK: [{
          target: "completed",
          cond: "isCountdownComplete",
          actions: ["invokeOnComplete"]
        }, {
          actions: ["updateTime", "invokeOnTick"]
        }],
        RESET: {
          actions: "resetTime"
        }
      }
    },
    paused: {
      on: {
        RESUME: "running",
        RESET: {
          target: "idle",
          actions: "resetTime"
        }
      }
    },
    completed: {
      on: {
        RESET: {
          target: "idle",
          actions: "resetTime"
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
    "isCountdownComplete": ctx => ctx["isCountdownComplete"]
  }
});