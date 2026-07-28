import * as signaturePad from "@zag-js/signature-pad"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { RotateCcw } from "lucide-solid"
import { For, Show, createMemo, createSignal, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"

export default function Page() {
  const [paths, setPaths] = createSignal<string[]>([])
  const [url, setUrl] = createSignal("")
  const id = createUniqueId()

  const service = useMachine(signaturePad.machine, () => ({
    id,
    paths: paths(),
    onDraw(details) {
      setPaths(details.paths)
    },
    onDrawEnd(details) {
      details.getDataUrl("image/png").then(setUrl)
    },
    drawing: {
      fill: "red",
      size: 4,
      simulatePressure: true,
    },
  }))

  const api = createMemo(() => signaturePad.connect(service, normalizeProps))

  return (
    <>
      <main class="signature-pad">
        <div {...api().getRootProps()}>
          <label {...api().getLabelProps()}>Controlled Signature Pad</label>

          <div {...api().getControlProps()}>
            <svg {...api().getSegmentProps()}>
              <For each={api().paths}>{(path) => <path {...api().getSegmentPathProps({ path })} />}</For>
              <Show when={api().currentPath}>
                {(path) => <path {...api().getSegmentPathProps({ path: path() })} />}
              </Show>
            </svg>
            <div {...api().getGuideProps()} />
          </div>

          <button {...api().getClearTriggerProps()}>
            <RotateCcw />
          </button>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", "margin-top": "0.5rem" }}>
          <button data-testid="clear-paths" type="button" onClick={() => setPaths([])}>
            Clear (controlled)
          </button>
          <button
            type="button"
            onClick={() => {
              api().getDataUrl("image/png").then(setUrl)
            }}
          >
            Show Image
          </button>
        </div>

        <div
          data-testid="controlled-status"
          style={{ "margin-top": "1rem", padding: "0.5rem", background: "#f5f5f5", "border-radius": "4px" }}
        >
          <div>
            <strong>Paths:</strong> {paths().length}
          </div>
          <div>
            <strong>Drawing:</strong> {api().drawing ? "yes" : "no"}
          </div>
          <div>
            <strong>Current path:</strong> {api().currentPath ? "active" : "none"}
          </div>
        </div>

        <Show when={url()}>
          <img data-part="preview" alt="signature" src={url()} />
        </Show>
      </main>

      <Toolbar>
        <StateVisualizer state={service} context={["paths", "currentPath"]} omit={["currentPoints"]} />
      </Toolbar>
    </>
  )
}
