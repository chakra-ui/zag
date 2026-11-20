import * as signaturePad from "@zag-js/signature-pad"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { RotateCcw } from "lucide-solid"
import { createMemo, createSignal, createUniqueId, For, Show } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import "@styles/signature-pad.css"

export default function Page() {
  const id = createUniqueId()
  const [dataUrl, setDataUrl] = createSignal("")
  const [showError, setShowError] = createSignal(false)
  const [output, setOutput] = createSignal("")

  const service = useMachine(signaturePad.machine, () => ({
    id,
    name: "signature",
    required: true,
    onDrawEnd: (details) => {
      setShowError(false)
      details.getDataUrl("image/png").then(setDataUrl)
    },
  }))
  const api = createMemo(() => signaturePad.connect(service, normalizeProps))

  return (
    <>
      <main>
        <div class="signature-pad-sign-document">
          <p class="hint">Type your name and sign. The signature is submitted as a PNG data URL.</p>
          <form
            novalidate
            onSubmit={(event) => {
              event.preventDefault()
              if (api().empty) {
                setShowError(true)
                return
              }
              const data = new FormData(event.currentTarget)
              setOutput(
                [...data.entries()]
                  .map(([key, value]) => `${key}=${String(value).slice(0, key === "signature" ? 32 : undefined)}`)
                  .join("\n"),
              )
            }}
            onReset={() => {
              api().clear()
              setDataUrl("")
              setShowError(false)
              setOutput("")
            }}
          >
            <label class="field">
              <span>Full name</span>
              <input name="signer" autocomplete="name" />
            </label>

            <div {...api().getRootProps()}>
              <input {...api().getHiddenInputProps({ value: api().empty ? "" : dataUrl() })} />
              <label {...api().getLabelProps()}>Lease signature</label>
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
            <Show when={showError()}>
              <p class="error">Sign above to continue</p>
            </Show>

            <div class="actions">
              <button type="submit">Sign lease</button>
              <button type="reset">Start over</button>
            </div>
          </form>
          <Show when={output()}>
            <pre data-testid="form-output">{output()}</pre>
          </Show>
        </div>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} omit={["currentPoints", "currentPath", "paths"]} />
      </Toolbar>
    </>
  )
}
