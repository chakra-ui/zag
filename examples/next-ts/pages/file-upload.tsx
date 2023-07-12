import * as fileUpload from "@zag-js/file-upload"
import { useMachine, normalizeProps } from "@zag-js/react"
import { useId } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

export default function Page() {
  const [state, send] = useMachine(fileUpload.machine({ id: useId() }))
  const api = fileUpload.connect(state, send, normalizeProps)

  return (
    <>
      <main className="file-upload">
        <div {...api.rootProps}>
          <input {...api.inputProps} />
          Selected files to upload
          <button {...api.triggerProps}>Upload</button>
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
