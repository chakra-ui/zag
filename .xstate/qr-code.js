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
      defaultValue: "",
      pixelSize: 10,
      ...props
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
        value: prop("value"),
        defaultValue: prop("defaultValue"),
        onChange(value) {
          prop("onValueChange")?.({
            value
          });
        }
      }))
    };
  },
  on: {
    UPDATE_CONTEXT: {
      actions: "updateContext"
    }
  },
  states: {
    idle: {
      on: {
        "VALUE.SET": {
          actions: ["setValue"]
        },
        "DOWNLOAD_TRIGGER.CLICK": {
          actions: ["downloadQrCode"]
        }
      }
    }
  },
  implementations: {
    actions: {
      setValue({
        context: {},
        event
      }) {
        context.set("value", event.value);
      },
      downloadQrCode({
        event,
        scope
      }) {
        const {
          mimeType,
          quality,
          fileName
        } = event;
        const svgEl = dom.getFrameEl(scope);
        const doc = scope.getDoc();
        getDataUrl(svgEl, {
          type: mimeType,
          quality
        }).then(dataUri => {
          const a = doc.createElement("a");
          a.href = dataUri;
          a.rel = "noopener";
          a.download = fileName;
          a.click();
          setTimeout(() => {
            a.remove();
          }, 0);
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