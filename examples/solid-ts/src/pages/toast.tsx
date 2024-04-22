import { toastControls } from "@zag-js/shared"
import { normalizeProps, useActor, useMachine } from "@zag-js/solid"
import * as toast from "@zag-js/toast"
import { XIcon } from "lucide-solid"
import { For, createMemo, createSignal, createUniqueId } from "solid-js"
import { LoaderBar } from "../components/loader"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

function ToastItem(props: { actor: toast.Service }) {
  const [state, send] = useActor(props.actor)
  const api = createMemo(() => toast.connect(state, send, normalizeProps))

  return (
    <div {...api().rootProps}>
      <span {...api().ghostBeforeProps} />
      <div data-scope="toast" data-part="progressbar" />
      <p {...api().titleProps}>
        {api().type === "loading" && <LoaderBar />}
        {api().title}
      </p>
      <button {...api().closeTriggerProps}>
        <XIcon />
      </button>
      <span {...api().ghostAfterProps} />
    </div>
  )
}

export default function Page() {
  const controls = useControls(toastControls)

  const [state, send] = useMachine(
    toast.group.machine({
      id: createUniqueId(),
      placement: "bottom-end",
      overlap: true,
      removeDelay: 200,
    }),
    {
      context: controls.context,
    },
  )

  const api = createMemo(() => toast.group.connect(state, send, normalizeProps))
  const [id, setId] = createSignal<string>()

  return (
    <>
      <main>
        <div style={{ display: "flex", gap: "16px" }}>
          <button
            onClick={() => {
              api().create({
                title: "Fetching data...",
                type: "loading",
              })
            }}
          >
            Notify (Loading)
          </button>
          <button
            onClick={() => {
              const id = api().create({
                title: "Ooops! Something was wrong",
                type: "error",
              })
              setId(id)
            }}
          >
            Notify (Error)
          </button>
          <button
            onClick={() => {
              const idValue = id()
              if (!idValue) return
              api().update(idValue, {
                title: "Testing",
                type: "loading",
              })
            }}
          >
            Update Latest
          </button>
          <button onClick={() => api().dismiss()}>Close all</button>
          <button onClick={() => api().pause()}>Pause all</button>
          <button onClick={() => api().resume()}>Resume all</button>
        </div>
        <For each={api().getPlacements()}>
          {(placement) => (
            <div {...api().getGroupProps({ placement })}>
              <For each={api().getToastsByPlacement(placement)}>{(toast) => <ToastItem actor={toast} />}</For>
            </div>
          )}
        </For>
      </main>

      <Toolbar controls={controls.ui} viz>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
