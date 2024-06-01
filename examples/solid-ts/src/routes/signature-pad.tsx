import { signaturePadControls } from "@zag-js/shared"
import * as signaturePad from "@zag-js/signature-pad"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { RotateCcw } from "lucide-solid"
import { For, Show, createMemo, createSignal, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"

export default function Page() {
  const [url, setUrl] = createSignal("")

  const controls = useControls(signaturePadControls)

  const [state, send] = useMachine(
    signaturePad.machine({
      id: createUniqueId(),
      onDrawEnd(details) {
        details.getDataUrl("image/png").then(setUrl)
      },
    }),
    {
      context: controls.context,
    },
  )

  const api = createMemo(() => signaturePad.connect(state, send, normalizeProps))

  return (
    <>
      <main class="signature-pad">
        <div {...api().rootProps}>
          <label {...api().labelProps}>Signature Pad</label>

          <div {...api().controlProps}>
            <svg {...api().segmentProps}>
              <For each={api().paths}>{(path) => <path {...api().getSegmentPathProps({ path })} />}</For>
              <Show when={api().currentPath}>
                {(path) => <path {...api().getSegmentPathProps({ path: path() })} />}
              </Show>
            </svg>
            <div {...api().guideProps} />
          </div>

          <button {...api().clearTriggerProps}>
            <RotateCcw />
          </button>
        </div>

        <button
          onClick={() => {
            api().getDataUrl("image/png").then(setUrl)
          }}
        >
          Show Image
        </button>

        <Show when={url()}>
          <img data-part="preview" alt="signature" src={url()} />
        </Show>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
