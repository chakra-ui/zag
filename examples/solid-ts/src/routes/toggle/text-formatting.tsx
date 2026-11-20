import { normalizeProps, useMachine } from "@zag-js/solid"
import * as toggle from "@zag-js/toggle"
import { BoldIcon, ItalicIcon, UnderlineIcon } from "lucide-solid"
import { createMemo, createUniqueId, For } from "solid-js"
import { Dynamic } from "@solidjs/web"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import "@styles/toggle.css"

function useFormat() {
  const service = useMachine(toggle.machine, { id: createUniqueId() })
  return { service, api: createMemo(() => toggle.connect(service, normalizeProps)) }
}

export default function Page() {
  const bold = useFormat()
  const italic = useFormat()
  const underline = useFormat()

  const formats = [
    { label: "Bold", Icon: BoldIcon, api: bold.api },
    { label: "Italic", Icon: ItalicIcon, api: italic.api },
    { label: "Underline", Icon: UnderlineIcon, api: underline.api },
  ]

  return (
    <>
      <main>
        <div class="toggle-text-formatting">
          <div class="group">
            <For each={formats}>
              {(format) => (
                <button aria-label={format.label} {...format.api().getRootProps()}>
                  <span {...format.api().getIndicatorProps()}>
                    <Dynamic component={format.Icon} class="icon" />
                  </span>
                </button>
              )}
            </For>
          </div>
          <p
            class="preview"
            data-bold={bold.api().pressed ? "" : undefined}
            data-italic={italic.api().pressed ? "" : undefined}
            data-underline={underline.api().pressed ? "" : undefined}
          >
            The quick brown fox jumps over the lazy dog.
          </p>
        </div>
      </main>

      <Toolbar viz>
        <StateVisualizer state={bold.service} />
      </Toolbar>
    </>
  )
}
