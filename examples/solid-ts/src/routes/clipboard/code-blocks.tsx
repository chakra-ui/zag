import * as clipboard from "@zag-js/clipboard"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { ClipboardCheck, ClipboardCopyIcon } from "lucide-solid"
import { For, Show, createMemo, createSignal, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import "@styles/clipboard.css"

const snippets = [
  { id: "install", title: "Install", code: "pnpm add @zag-js/clipboard" },
  {
    id: "import",
    title: "Import",
    code: 'import * as clipboard from "@zag-js/clipboard"',
  },
  {
    id: "usage",
    title: "Usage",
    code: "const service = useMachine(clipboard.machine, { id: useId() })\nconst api = clipboard.connect(service, normalizeProps)",
  },
]

export default function Page() {
  const [activeId, setActiveId] = createSignal<string | null>(null)

  const service = useMachine(clipboard.machine, {
    id: createUniqueId(),
    timeout: 1000,
  })

  const api = createMemo(() => clipboard.connect(service, normalizeProps))

  return (
    <>
      <main>
        <div class="code-blocks">
          <div {...api().getRootProps()}>
            <For each={snippets}>
              {(snippet) => {
                const copied = () => api().copied && activeId() === snippet.id
                return (
                  <div class="block">
                    <div class="block-header">
                      <strong>{snippet.title}</strong>
                      <button
                        type="button"
                        data-copied={copied() ? "" : undefined}
                        aria-label={`${copied() ? "Copied!" : "Copy"} ${snippet.title} snippet`}
                        onClick={() => {
                          setActiveId(snippet.id)
                          api().setValue(snippet.code)
                          api().copy()
                        }}
                      >
                        <Show when={copied()} fallback={<ClipboardCopyIcon />}>
                          <ClipboardCheck />
                        </Show>
                        <span>{copied() ? "Copied!" : "Copy"}</span>
                      </button>
                    </div>
                    <pre>{snippet.code}</pre>
                  </div>
                )
              }}
            </For>
          </div>
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
