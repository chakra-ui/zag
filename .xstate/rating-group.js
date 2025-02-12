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
      name: "rating",
      count: 5,
      dir: "ltr",
      value: -1,
      ...compact(props),
      translations: {
        ratingValueText: index => `${index} stars`,
        ...props.translations
      }
    };
  },
  initialState() {
    return "idle";
  },
  context({
    prop,
    bindable
  }) {
    return {
      value: bindable(() => ({
        defaultValue: prop("defaultValue"),
        value: prop("value"),
        onChange(value) {
          prop("onValueChange")?.({
            value
          });
        }
      })),
      hoveredValue: bindable(() => ({
        defaultValue: -1,
        onChange(value) {
          prop("onHoverChange")?.({
            hoveredValue: value
          });
        }
      })),
      fieldsetDisabled: bindable(() => ({
        defaultValue: false
      }))
    };
  },
  watch({
    track,
    action,
    prop
  }) {
    track([() => prop("allowHalf")], () => {
      action(["roundValueIfNeeded"]);
    });
  },
  effects: ["trackFormControlState"],
  on: {
    SET_VALUE: {
      actions: ["setValue"]
    },
    CLEAR_VALUE: {
      actions: ["clearValue"]
    },
    UPDATE_CONTEXT: {
      actions: "updateContext"
    }
  },
  states: {
    idle: {
      entry: ["clearHoveredValue"],
      on: {
        GROUP_POINTER_OVER: {
          target: "hover"
        },
        FOCUS: {
          target: "focus"
        },
        CLICK: {
          actions: ["setValue", "focusActiveRadio"]
        }
      }
    },
    focus: {
      on: {
        POINTER_OVER: {
          actions: ["setHoveredValue"]
        },
        GROUP_POINTER_LEAVE: {
          actions: ["clearHoveredValue"]
        },
        BLUR: {
          target: "idle"
        },
        SPACE: {
          cond: "isValueEmpty",
          actions: ["setValue"]
        },
        CLICK: {
          actions: ["setValue", "focusActiveRadio"]
        },
        ARROW_LEFT: {
          actions: ["setPrevValue", "focusActiveRadio"]
        },
        ARROW_RIGHT: {
          actions: ["setNextValue", "focusActiveRadio"]
        },
        HOME: {
          actions: ["setValueToMin", "focusActiveRadio"]
        },
        END: {
          actions: ["setValueToMax", "focusActiveRadio"]
        }
      }
    },
    hover: {
      on: {
        POINTER_OVER: {
          actions: ["setHoveredValue"]
        },
        GROUP_POINTER_LEAVE: [{
          cond: "isRadioFocused",
          target: "focus",
          actions: ["clearHoveredValue"]
        }, {
          target: "idle",
          actions: ["clearHoveredValue"]
        }],
        CLICK: {
          actions: ["setValue", "focusActiveRadio"]
        }
      }
    }
  },
  implementations: {
    guards: {
      isInteractive: ({
        prop
      }) => !(prop("disabled") || prop("readOnly")),
      isHoveredValueEmpty: ({
        context: {
          "isValueEmpty": false,
          "isRadioFocused": false
        }
      }) => context.get("hoveredValue") === -1,
      isValueEmpty: ({
        context
      }) => context.get("value") <= 0,
      isRadioFocused: ({
        scope
      }) => !!dom.getControlEl(scope)?.contains(scope.getActiveElement())
    },
    effects: {
      trackFormControlState({
        context,
        scope
      }) {
        return trackFormControl(dom.getHiddenInputEl(scope), {
          onFieldsetDisabledChange(disabled) {
            context.set("fieldsetDisabled", disabled);
          },
          onFormReset() {
            context.set("value", context.initial("value"));
          }
        });
      }
    },
    actions: {
      clearHoveredValue({
        context
      }) {
        context.set("hoveredValue", -1);
      },
      focusActiveRadio({
        scope,
        context
      }) {
        raf(() => dom.getRadioEl(scope, context.get("value"))?.focus());
      },
      setPrevValue({
        context,
        prop
      }) {
        const factor = prop("allowHalf") ? 0.5 : 1;
        context.set("value", Math.max(0, context.get("value") - factor));
      },
      setNextValue({
        context,
        prop
      }) {
        const factor = prop("allowHalf") ? 0.5 : 1;
        const value = context.get("value") === -1 ? 0 : context.get("value");
        context.set("value", Math.min(prop("count"), value + factor));
      },
      setValueToMin({
        context
      }) {
        context.set("value", 1);
      },
      setValueToMax({
        context,
        prop
      }) {
        context.set("value", prop("count"));
      },
      setValue({
        context,
        event
      }) {
        const hoveredValue = context.get("hoveredValue");
        const value = hoveredValue === -1 ? event.value : hoveredValue;
        context.set("value", value);
      },
      clearValue({
        context
      }) {
        context.set("value", -1);
      },
      setHoveredValue({
        context,
        prop,
        event
      }) {
        const half = prop("allowHalf") && event.isMidway;
        const factor = half ? 0.5 : 0;
        context.set("hoveredValue", event.index - factor);
      },
      roundValueIfNeeded({
        context,
        prop
      }) {
        if (prop("allowHalf")) return;
        context.set("value", Math.round(context.get("value")));
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
    "isValueEmpty": ctx => ctx["isValueEmpty"],
    "isRadioFocused": ctx => ctx["isRadioFocused"]
  }
});