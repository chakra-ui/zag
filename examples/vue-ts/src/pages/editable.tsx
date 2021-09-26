import { defineComponent, h, Fragment, ref, computed, onMounted } from "vue"
import { editable } from "@ui-machines/web"
import { useMachine, normalizeProps } from "@ui-machines/vue"
import { StateVisualizer } from "../components/state-visualizer"
import { useMount } from "../hooks/use-mount"

const count = ref(0)

export default defineComponent({
  name: "Editable",
  setup(props, { slots }) {
    const [state, send] = useMachine(
      editable.machine.withContext({
        placeholder: "Edit me...",
        isPreviewFocusable: true,
      }),
    )

    const inputRef = useMount(send)

    const machineState = computed(() => {
      const machine = editable.connect(state.value, send, normalizeProps)
      console.log(machine)
      return machine
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
          <input ref={inputRef} style={{ width: "auto", background: "transparent" }} {...inputProps} />
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
