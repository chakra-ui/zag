import { createMachine } from "@zag-js/core"

interface NestedStatesSchema {
  state: "idle" | "open" | "open.viewing" | "open.editing"
  context: {}
  effect: "trackOpen"
  event: { type: "OPEN" } | { type: "EDIT" } | { type: "SAVE" } | { type: "CANCEL" } | { type: "CLOSE" }
}

export const nestedStatesMachine = createMachine<NestedStatesSchema>({
  initialState() {
    return "idle"
  },

  context() {
    return {}
  },

  states: {
    idle: {
      on: {
        OPEN: {
          target: "open",
        },
      },
    },

    open: {
      initial: "viewing",
      effects: ["trackOpen"],
      states: {
        viewing: {
          on: {
            EDIT: {
              target: "editing",
            },
          },
        },
        editing: {
          on: {
            SAVE: {
              target: "viewing",
            },
            CANCEL: {
              target: "viewing",
            },
          },
        },
      },

      on: {
        CLOSE: {
          target: "idle",
        },
      },
    },
  },

  implementations: {
    effects: {
      trackOpen() {
        console.log("[nested-states] entered open state")
        return () => {
          console.log("[nested-states] cleanup: exited open state")
        }
      },
    },
  },
})
