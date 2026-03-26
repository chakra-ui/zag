import styles from "../../../../../shared/src/css/signature-pad.module.css"
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

  const service = useMachine(
    signaturePad.machine,
    controls.mergeProps<signaturePad.Props>({
      id: createUniqueId(),
      onDrawEnd(details) {
        details.getDataUrl("image/png").then(setUrl)
      },
    }),
  )

  const api = createMemo(() => signaturePad.connect(service, normalizeProps))

  return (
    <>
      <main class="signature-pad">
        <div {...api().getRootProps()} class={styles.Root}>
          <label {...api().getLabelProps()} class={styles.Label}>Signature Pad</label>

          <div {...api().getControlProps()} class={styles.Control}>
            <svg {...api().getSegmentProps()}>
              <For each={api().paths}>{(path) => <path {...api().getSegmentPathProps({ path })} />}</For>
              <Show when={api().currentPath}>
                {(path) => <path {...api().getSegmentPathProps({ path: path() })} />}
              </Show>
            </svg>
            <div {...api().getGuideProps()} class={styles.Guide} />
          </div>

          <button {...api().getClearTriggerProps()} class={styles.ClearTrigger}>
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

      <Toolbar controls={controls}>
        <StateVisualizer state={service} omit={["currentPoints", "currentPath", "paths"]} />
      </Toolbar>
    </>
  )
}
