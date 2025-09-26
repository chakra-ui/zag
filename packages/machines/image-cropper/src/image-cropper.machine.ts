import { createMachine } from "@zag-js/core"
import type { ImageCropperSchema } from "./image-cropper.types"

export const machine = createMachine<ImageCropperSchema>({
  props({ props }) {
    return {
      ...props,
    }
  },

  context() {
    return {}
  },

  initialState() {
    return "idle"
  },

  states: {
    idle: {},
  },

  implementations: {
    guards: {},

    actions: {},

    effects: {},
  },
})
