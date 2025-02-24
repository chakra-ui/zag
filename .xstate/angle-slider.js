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
      step: 1,
      defaultValue: 0,
      ...props
    };
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
            value,
            valueAsDegree: `${value}deg`
          });
        }
      }))
    };
  },
  watch({
    track,
    context: {},
    action
  }) {
    track([() => context.get("value")], () => {
      action(["syncInputElement"]);
    });
  },
  initialState() {
    return "idle";
  },
  on: {
    "VALUE.SET": {
      actions: ["setValue"]
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
        "CONTROL.POINTER_DOWN": {
          target: "dragging",
          actions: ["setPointerValue", "focusThumb"]
        },
        "THUMB.FOCUS": {
          target: "focused"
        }
      }
    },
    focused: {
      on: {
        "CONTROL.POINTER_DOWN": {
          target: "dragging",
          actions: ["setPointerValue", "focusThumb"]
        },
        "THUMB.ARROW_DEC": {
          actions: ["decrementValue", "invokeOnChangeEnd"]
        },
        "THUMB.ARROW_INC": {
          actions: ["incrementValue", "invokeOnChangeEnd"]
        },
        "THUMB.HOME": {
          actions: ["setValueToMin", "invokeOnChangeEnd"]
        },
        "THUMB.END": {
          actions: ["setValueToMax", "invokeOnChangeEnd"]
        },
        "THUMB.BLUR": {
          target: "idle"
        }
      }
    },
    dragging: {
      entry: ["focusThumb"],
      effects: ["trackPointerMove"],
      on: {
        "DOC.POINTER_UP": {
          target: "focused",
          actions: ["invokeOnChangeEnd"]
        },
        "DOC.POINTER_MOVE": {
          actions: ["setPointerValue"]
        }
      }
    }
  },
  implementations: {
    effects: {
      trackPointerMove({
        scope,
        send
      }) {
        return trackPointerMove(scope.getDoc(), {
          onPointerMove(info) {
            send({
              type: "DOC.POINTER_MOVE",
              point: info.point
            });
          },
          onPointerUp() {
            send({
              type: "DOC.POINTER_UP"
            });
          }
        });
      }
    },
    actions: {
      syncInputElement({
        scope,
        context
      }) {
        const inputEl = dom.getHiddenInputEl(scope);
        setElementValue(inputEl, context.get("value").toString());
      },
      invokeOnChangeEnd({
        context,
        prop
      }) {
        prop("onValueChangeEnd")?.({
          value: context.get("value"),
          valueAsDegree: computed("valueAsDegree")
        });
      },
      setPointerValue({
        scope,
        event,
        context,
        prop
      }) {
        const controlEl = dom.getControlEl(scope);
        if (!controlEl) return;
        const deg = getAngle(controlEl, event.point);
        context.set("value", constrainAngle(deg, prop("step")));
      },
      setValueToMin({
        context
      }) {
        context.set("value", MIN_VALUE);
      },
      setValueToMax({
        context
      }) {
        context.set("value", MAX_VALUE);
      },
      setValue({
        context,
        event
      }) {
        context.set("value", clampAngle(event.value));
      },
      decrementValue({
        context,
        event,
        prop
      }) {
        const value = snapValueToStep(context.get("value") - event.step, MIN_VALUE, MAX_VALUE, event.step ?? prop("step"));
        context.set("value", value);
      },
      incrementValue({
        context,
        event,
        prop
      }) {
        const value = snapValueToStep(context.get("value") + event.step, MIN_VALUE, MAX_VALUE, event.step ?? prop("step"));
        context.set("value", value);
      },
      focusThumb({
        scope
      }) {
        raf(() => {
          dom.getThumbEl(scope)?.focus({
            preventScroll: true
          });
        });
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