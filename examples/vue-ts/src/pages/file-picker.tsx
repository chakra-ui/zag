import * as filePicker from "@zag-js/file-picker"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { computed, defineComponent, h, Fragment } from "vue"
import { filePickerControls, formatFileSize } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default defineComponent({
  name: "filePicker",
  setup() {
    const controls = useControls(filePickerControls)

    const [state, send] = useMachine(filePicker.machine({ id: "1" }), {
      context: controls.context,
    })

    const apiRef = computed(() => filePicker.connect(state.value, send, normalizeProps))

    return () => {
      const api = apiRef.value

      return (
        <>
          <main class="file-picker">
            <div {...api.rootProps}>
              <div {...api.dropzoneProps}>
                <input {...api.hiddenInputProps} />
                Drag your files here
              </div>

              <button {...api.triggerProps}>Choose Files...</button>

              <ul>
                {api.files.map((file) => {
                  return (
                    <li class="file" key={file.name}>
                      <div>
                        <b>{file.name}</b>
                      </div>
                      <div>{formatFileSize(file.size)}</div>
                      <div>{file.type}</div>
                      <button {...api.getDeleteTriggerProps({ file })}>X</button>
                    </li>
                  )
                })}
              </ul>
            </div>
          </main>

          <Toolbar controls={controls.ui}>
            <StateVisualizer state={state} />
          </Toolbar>
        </>
      )
    }
  },
})
