import { Portal, normalizeProps, useActor, useMachine } from "@zag-js/react"
import { toastControls } from "@zag-js/shared"
import * as toast from "@zag-js/toast"
import { XIcon } from "lucide-react"
import { useId, useRef } from "react"
import { Dialog } from "../components/dialog"
import { LoaderBar } from "../components/loader"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

function ToastItem({ actor }: { actor: toast.Service }) {
  const [state, send] = useActor(actor)
  const api = toast.connect(state, send, normalizeProps)

  return (
    <div {...api.getRootProps()}>
      <span {...api.getGhostBeforeProps()} />
      <div data-scope="toast" data-part="progressbar" />
      <p {...api.getTitleProps()}>
        {api.type === "loading" && <LoaderBar />}
        {api.title}
      </p>
      <p {...api.getDescriptionProps()}>{api.description}</p>
      <button {...api.getCloseTriggerProps()}>
        <XIcon />
      </button>
      <span {...api.getGhostAfterProps()} />
    </div>
  )
}

export default function Page() {
  const controls = useControls(toastControls)

  const [state, send] = useMachine(
    toast.group.machine({
      id: useId(),
      placement: "bottom",
      removeDelay: 200,
    }),
    {
      context: controls.context,
    },
  )

  const api = toast.group.connect(state, send, normalizeProps)
  const id = useRef<string>()

  return (
    <>
      <main>
        <Dialog />
        <div style={{ display: "flex", gap: "16px" }}>
          <button
            onClick={() => {
              api.create({
                title: "Fetching data...",
                type: "loading",
              })
            }}
          >
            Notify (Loading)
          </button>
          <button
            onClick={() => {
              id.current = api.create({
                title: "Ooops! Something was wrong",
                type: "error",
              })
            }}
          >
            Notify (Error)
          </button>
          <button
            onClick={() => {
              if (!id.current) return
              api.update(id.current, {
                title: "Testing",
                type: "loading",
              })
            }}
          >
            Update Latest
          </button>
          <button onClick={() => api.dismiss()}>Close all</button>
          <button onClick={() => api.pause()}>Pause all</button>
          <button onClick={() => api.resume()}>Resume all</button>
        </div>

        <Portal>
          {api.getPlacements().map((placement) => (
            <div key={placement} {...api.getGroupProps({ placement })}>
              {api.getToastsByPlacement(placement).map((toast) => (
                <ToastItem key={toast.id} actor={toast} />
              ))}
            </div>
          ))}
        </Portal>
      </main>
      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
