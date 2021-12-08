import * as Editable from "@ui-machines/editable"
import { normalizeProps, useMachine, VuePropTypes } from "@ui-machines/vue"
import { computed, defineComponent, h } from "vue"
import { StateVisualizer } from "../components/state-visualizer"
import { useControls } from "../hooks/use-controls"
import { useMount } from "../hooks/use-mount"

export default defineComponent({
  name: "Editable",
  setup() {
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

    const [state, send] = useMachine(Editable.machine, {
      context: context.value,
    })

    const ref = useMount(send)

    const editableRef = computed(() => Editable.connect<VuePropTypes>(state.value, send, normalizeProps))

    return () => {
      const {
        isEditing,
        isValueEmpty,
        inputProps,
        previewProps,
        cancelButtonProps,
        submitButtonProps,
        editButtonProps,
      } = editableRef.value

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
