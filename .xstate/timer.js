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
  props({
    props
  }) {
    return {
      interval: 250,
      ...props
    };
  },
  initialState({
    prop
  }) {
    return prop("autoStart") ? "running" : "idle";
  },
  context({
    prop,
    bindable
  }) {
    return {
      currentMs: bindable(() => ({
        defaultValue: prop("startMs") ?? 0
      }))
    };
  },
  watch({
    track,
    send,
    prop
  }) {
    track([() => prop("startMs")], () => {
      send({
        type: "RESTART"
      });
    });
  },
  on: {
    RESTART: {
      target: "running:temp",
      actions: ["resetTime"]
    },
    UPDATE_CONTEXT: {
      actions: "updateContext"
    }
  },
  states: {
    idle: {
      on: {
        START: {
          target: "running"
        },
        RESET: {
          actions: ["resetTime"]
        }
      }
    },
    "running:temp": {
      effects: ["waitForNextTick"],
      on: {
        CONTINUE: {
          target: "running"
        }
      }
    },
    running: {
      effects: ["keepTicking"],
      on: {
        PAUSE: {
          target: "paused"
        },
        TICK: [{
          target: "idle",
          cond: "hasReachedTarget",
          actions: ["invokeOnComplete"]
        }, {
          actions: ["updateTime", "invokeOnTick"]
        }],
        RESET: {
          actions: ["resetTime"]
        }
      }
    },
    paused: {
      on: {
        RESUME: {
          target: "running"
        },
        RESET: {
          target: "idle",
          actions: ["resetTime"]
        }
      }
    }
  },
  implementations: {
    effects: {
      keepTicking({
        prop,
        send
      }) {
        return setRafInterval(() => {
          send({
            type: "TICK"
          });
        }, prop("interval"));
      },
      waitForNextTick({
        send
      }) {
        return setRafTimeout(() => {
          send({
            type: "CONTINUE"
          });
        }, 0);
      }
    },
    actions: {
      updateTime({
        context: {
          "hasReachedTarget": false
        },
        prop
      }) {
        const sign = prop("countdown") ? -1 : 1;
        context.set("currentMs", prev => prev + sign * 1000);
      },
      sendTickEvent({
        send
      }) {
        send({
          type: "TICK"
        });
      },
      resetTime({
        context,
        prop
      }) {
        let targetMs = prop("targetMs");
        if (targetMs == null && prop("countdown")) targetMs = 0;
        context.set("currentMs", prop("startMs") ?? 0);
      },
      invokeOnTick({
        context,
        prop
      }) {
        prop("onTick")?.({
          value: context.get("currentMs"),
          time: computed("time"),
          formattedTime: computed("formattedTime")
        });
      },
      invokeOnComplete({
        prop
      }) {
        prop("onComplete")?.();
      }
    },
    guards: {
      hasReachedTarget: ({
        context,
        prop
      }) => {
        let targetMs = prop("targetMs");
        if (targetMs == null && prop("countdown")) targetMs = 0;
        if (targetMs == null) return false;
        return context.get("currentMs") === targetMs;
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
    "hasReachedTarget": ctx => ctx["hasReachedTarget"]
  }
});