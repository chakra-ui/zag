import { tagsInputControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import * as tagsInput from "@zag-js/tags-input"
import { XIcon } from "lucide-solid"
import { For, createMemo, createSignal, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"
import "@styles/tags-input.css"

function toDashCase(str: string) {
  return str.replace(/\s+/g, "-").toLowerCase()
}

export default function Page() {
  const controls = useControls(tagsInputControls)

  const [submitCount, setSubmitCount] = createSignal(0)
  const [lastSubmit, setLastSubmit] = createSignal<string | null>(null)

  const service = useMachine(
    tagsInput.machine,
    controls.mergeProps<tagsInput.Props>({
      id: createUniqueId(),
      name: "tags",
      defaultValue: ["React", "Vue"],
    }),
  )

  const api = createMemo(() => tagsInput.connect(service, normalizeProps))

  return (
    <>
      <main class="tags-input">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const data = new FormData(e.currentTarget)
            const value = String(data.get("tags") ?? "")
            setSubmitCount((c) => c + 1)
            setLastSubmit(value)
          }}
        >
          <div {...api().getRootProps()}>
            <label {...api().getLabelProps()}>Enter frameworks:</label>
            <div {...api().getControlProps()}>
              <For each={api().value}>
                {(value, index) => (
                  <span {...api().getItemProps({ index: index(), value })}>
                    <div
                      data-testid={`${toDashCase(value)}-tag`}
                      {...api().getItemPreviewProps({ index: index(), value })}
                    >
                      <span
                        data-testid={`${toDashCase(value)}-valuetext`}
                        {...api().getItemTextProps({ index: index(), value })}
                      >
                        {value}{" "}
                      </span>
                      <button
                        data-testid={`${toDashCase(value)}-close-button`}
                        {...api().getItemDeleteTriggerProps({ index: index(), value })}
                      >
                        <XIcon />
                      </button>
                    </div>
                    <input
                      data-testid={`${toDashCase(value)}-input`}
                      {...api().getItemInputProps({ index: index(), value })}
                    />
                  </span>
                )}
              </For>
              <input data-testid="input" placeholder="add tag" {...api().getInputProps()} />
              <button type="button" {...api().getClearTriggerProps()}>
                <XIcon />
              </button>
            </div>
            <input {...api().getHiddenInputProps()} />
          </div>

          <div style={{ "margin-top": "16px" }}>
            <button type="submit">Submit</button>
          </div>
        </form>

        <section style={{ "margin-top": "16px" }}>
          <strong>submit count:</strong> <span data-testid="submit-count">{submitCount()}</span>
          <br />
          <strong>last submitted value:</strong> <span data-testid="last-submit">{lastSubmit() ?? "—"}</span>
        </section>
      </main>

      <Toolbar controls={controls}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
