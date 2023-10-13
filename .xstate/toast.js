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
  entry: ["invokeOnOpen", "checkAnimation"],
  exit: "notifyParentToRemove",
  initial: type === "loading" ? "persist" : "active",
  context: {
    "hasTypeChanged && isChangingToLoading": false,
    "hasDurationChanged || hasTypeChanged": false,
    "!isLoadingType": false,
    "hasAnimation": false,
    "hasAnimation": false,
    "hasAnimation": false
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
        DISMISS: [{
          cond: "hasAnimation",
          target: "dismissing"
        }, {
          target: "inactive",
          actions: "invokeOnClosing"
        }]
      }
    },
    active: {
      tags: ["visible"],
      activities: "trackDocumentVisibility",
      after: [{
        delay: "VISIBLE_DURATION",
        cond: "hasAnimation",
        target: "dismissing"
      }, {
        delay: "VISIBLE_DURATION",
        target: "inactive",
        actions: "invokeOnClosing"
      }],
      on: {
        DISMISS: [{
          cond: "hasAnimation",
          target: "dismissing"
        }, {
          target: "inactive",
          actions: "invokeOnClosing"
        }],
        PAUSE: {
          target: "persist",
          actions: "setRemainingDuration"
        }
      }
    },
    dismissing: {
      entry: "invokeOnClosing",
      activities: ["trackAnimationEvents"],
      on: {
        ANIMATION_END: {
          target: "inactive"
        }
      }
    },
    inactive: {
      entry: ["invokeOnClose"],
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
    "!isLoadingType": ctx => ctx["!isLoadingType"],
    "hasAnimation": ctx => ctx["hasAnimation"]
  }
});