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
  id,
  context: {
    "hasTypeChanged && isChangingToLoading": false,
    "hasDurationChanged || hasTypeChanged": false,
    "!isLoadingType": false
  },
  initial: type === "loading" ? "visible:persist" : "visible",
  on: {
    UPDATE: [{
      cond: "hasTypeChanged && isChangingToLoading",
      target: "visible:persist",
      actions: ["setContext"]
    }, {
      cond: "hasDurationChanged || hasTypeChanged",
      target: "visible:updating",
      actions: ["setContext"]
    }, {
      actions: ["setContext"]
    }],
    MEASURE: {
      actions: ["measureHeight"]
    }
  },
  entry: ["invokeOnVisible"],
  activities: ["trackHeight"],
  on: {
    UPDATE_CONTEXT: {
      actions: "updateContext"
    }
  },
  states: {
    "visible:updating": {
      tags: ["visible", "updating"],
      after: {
        0: "visible"
      }
    },
    "visible:persist": {
      tags: ["visible", "paused"],
      on: {
        RESUME: {
          cond: "!isLoadingType",
          target: "visible",
          actions: ["setCreatedAt"]
        },
        DISMISS: "dismissing"
      }
    },
    visible: {
      tags: ["visible"],
      after: {
        VISIBLE_DURATION: "dismissing"
      },
      on: {
        DISMISS: "dismissing",
        PAUSE: {
          target: "visible:persist",
          actions: "setRemainingDuration"
        }
      }
    },
    dismissing: {
      entry: "invokeOnDismiss",
      after: {
        REMOVE_DELAY: {
          target: "unmounted",
          actions: "notifyParentToRemove"
        }
      }
    },
    unmounted: {
      entry: "invokeOnUnmount",
      type: "final"
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
    "hasTypeChanged && isChangingToLoading": ctx => ctx["hasTypeChanged && isChangingToLoading"],
    "hasDurationChanged || hasTypeChanged": ctx => ctx["hasDurationChanged || hasTypeChanged"],
    "!isLoadingType": ctx => ctx["!isLoadingType"]
  }
});