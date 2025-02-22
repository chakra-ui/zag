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
      defaultStep: 0,
      count: 1,
      linear: false,
      orientation: "horizontal",
      ...props
    };
  },
  context({
    prop,
    bindable,
    getComputed
  }) {
    return {
      step: bindable < number > (() => ({
        defaultValue: prop("defaultStep"),
        value: prop("step"),
        onChange(value) {
          const computed = getComputed();
          prop("onStepChange")?.({
            step: value
          });
          if (computed("completed")) {
            prop("onStepComplete")?.();
          }
        }
      }))
    };
  },
  initialState() {
    return "idle";
  },
  entry: ["validateStep"],
  on: {
    UPDATE_CONTEXT: {
      actions: "updateContext"
    }
  },
  states: {
    idle: {
      on: {
        "STEP.SET": {
          actions: ["setStep"]
        },
        "STEP.NEXT": {
          actions: ["goToNextStep"]
        },
        "STEP.PREV": {
          actions: ["goToPrevStep"]
        },
        "STEP.RESET": {
          actions: ["resetStep"]
        }
      }
    }
  },
  implementations: {
    actions: {
      goToNextStep({
        context: {},
        prop
      }) {
        const value = Math.min(context.get("step") + 1, prop("count"));
        context.set("step", value);
      },
      goToPrevStep({
        context
      }) {
        const value = Math.max(context.get("step") - 1, 0);
        context.set("step", value);
      },
      resetStep({
        context
      }) {
        context.set("step", 0);
      },
      setStep({
        context,
        event
      }) {
        context.set("step", event.value);
      },
      validateStep({
        context,
        prop
      }) {
        validateStep(prop("count"), context.get("step"));
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
  guards: {}
});