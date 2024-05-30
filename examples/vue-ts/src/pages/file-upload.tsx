import * as fileUpload from "@zag-js/file-upload"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { computed, defineComponent, h, Fragment } from "vue"
import { fileUploadControls } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default defineComponent({
  name: "fileUpload",
  setup() {
    const controls = useControls(fileUploadControls)

    const [state, send] = useMachine(fileUpload.machine({ id: "1" }), {
      context: controls.context,
    })

    const apiRef = computed(() => fileUpload.connect(state.value, send, normalizeProps))

    return () => {
      const api = apiRef.value

      return (
        <>
          <main class="file-upload">
            <div {...api.getRootProps()}>
              <div {...api.getDropzoneProps()}>
                <input {...api.getHiddenInputProps()} />
                Drag your files here
              </div>

              <button {...api.getTriggerProps()}>Choose Files...</button>

              <ul {...api.getItemGroupProps()}>
                {api.acceptedFiles.map((file) => (
                  <li class="file" key={file.name} {...api.getItemProps({ file })}>
                    <div {...api.getItemNameProps({ file })}>
                      <b>{file.name}</b>
                    </div>
                    <div {...api.getItemSizeTextProps({ file })}>{api.getFileSize(file)}</div>
                    <div>{file.type}</div>
                    <button {...api.getItemDeleteTriggerProps({ file })}>X</button>
                  </li>
                ))}
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
