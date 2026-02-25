import { createMachine } from "@zag-js/core"

export const nestedStatesMachine = createMachine({
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
              target: "open.editing",
            },
          },
        },
        editing: {
          on: {
            SAVE: {
              target: "open.viewing",
            },
            CANCEL: {
              target: "open.viewing",
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
