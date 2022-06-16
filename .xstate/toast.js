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
  entry: "invokeOnOpen",
  initial: type === "loading" ? "persist" : "active",
  context: {
    "hasTypeChanged && isChangingToLoading": false,
    "hasDurationChanged || hasTypeChanged": false,
    "!isLoadingType": false
  },
  on: {
    UPDATE: [{
      cond: "hasTypeChanged && isChangingToLoading",
      target: "persist",
      actions: ["setContext", "invokeOnUpdate"]
    }, {
      cond: "hasDurationChanged || hasTypeChanged",
      target: "active:temp",
      actions: ["setContext", "invokeOnUpdate"]
    }, {
      actions: ["setContext", "invokeOnUpdate"]
    }]
  },
  on: {
    UPDATE_CONTEXT: {
      actions: "updateContext"
    }
  },
  states: {
    "active:temp": {
      tags: ["visible", "updating"],
      after: {
        0: "active"
      }
    },
    persist: {
      tags: ["visible", "paused"],
      activities: "trackDocumentVisibility",
      on: {
        RESUME: {
          cond: "!isLoadingType",
          target: "active",
          actions: ["setCreatedAt"]
        },
        DISMISS: "dismissing"
      }
    },
    active: {
      tags: ["visible"],
      activities: "trackDocumentVisibility",
      after: {
        VISIBLE_DURATION: "dismissing"
      },
      on: {
        DISMISS: "dismissing",
        PAUSE: {
          target: "persist",
          actions: "setRemainingDuration"
        }
      }
    },
    dismissing: {
      entry: "invokeOnClosing",
      after: {
        REMOVE_DELAY: {
          target: "inactive",
          actions: "notifyParentToRemove"
        }
      }
    },
    inactive: {
      entry: "invokeOnClose",
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