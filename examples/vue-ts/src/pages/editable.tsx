import {
  defineComponent,
  h,
  Fragment,
  ref,
  computed,
  onMounted,
  unref,
  watch,
  watchEffect,
} from "vue"
import { connectEditableMachine, editableMachine } from "@ui-machines/dom"
import { useMachine, normalizeProps } from "@ui-machines/vue"
import { StateVisualizer } from "../components/state-visualizer"

const count = ref(0)

export default defineComponent({
  setup(props, { slots }) {
    const inputRef = ref<any>(null)

    const [state, send] = useMachine(
      editableMachine.withContext({
        placeholder: "Edit me...",
        isPreviewFocusable: true,
      }),
    )

    const id = computed(() => `editable-${count.value++}`)

    onMounted(() => {
      send({ type: "MOUNT", doc: inputRef.value?.ownerDocument, id: id.value })
    })

    const machineState = computed(() =>
      connectEditableMachine(state.value, send, normalizeProps),
    )

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
          <input
            ref={inputRef}
            style={{ width: "auto", background: "transparent" }}
            {...inputProps}
          />
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
