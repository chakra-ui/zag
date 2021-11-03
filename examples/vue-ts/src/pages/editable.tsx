import { editable } from "@ui-machines/web"
import { useMachine, normalizeProps } from "@ui-machines/vue"

import { defineComponent, h, Fragment, computed } from "vue"

import { StateVisualizer } from "../components/state-visualizer"
import { useMount } from "../hooks/use-mount"
import { useControls } from "../hooks/use-controls"

export default defineComponent({
  name: "Editable",
  setup(props, { slots }) {
    const { context, ui: PropertyControls } = useControls({
      placeholder: { type: "string", defaultValue: "Type something...", label: "placeholder" },
      submitMode: {
        type: "select",
        label: "submit mode?",
        options: ["enter", "blur", "both", "none"] as const,
        defaultValue: "both",
      },
      activationMode: {
        type: "select",
        options: ["focus", "dblclick", "none"] as const,
        label: "activation mode",
        defaultValue: "focus",
      },
    })

    const [state, send] = useMachine(editable.machine, {
      context: context.value,
    })

    const ref = useMount(send)

    const machineState = computed(() => {
      return editable.connect(state.value, send, normalizeProps)
    })

    return () => {
      const {
        isEditing,
        isValueEmpty,
        inputProps,
        previewProps,
        cancelButtonProps,
        submitButtonProps,
        editButtonProps,
      } = machineState.value

      return (
        <div>
          <PropertyControls />
          <input ref={ref} style={{ width: "auto", background: "transparent" }} {...inputProps} />
          <span style={{ opacity: isValueEmpty ? 0.7 : 1 }} {...previewProps} />
          {!isEditing && <button {...editButtonProps}>Edit</button>}
          {isEditing && (
            <>
              <button {...submitButtonProps}>Save</button>
              <button {...cancelButtonProps}>Cancel</button>
            </>
          )}

          <StateVisualizer state={state.value} />
        </div>
      )
    }
  },
})
