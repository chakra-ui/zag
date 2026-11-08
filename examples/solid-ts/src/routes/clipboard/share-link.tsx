import * as clipboard from "@zag-js/clipboard"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { ClipboardCheck, ClipboardCopyIcon } from "lucide-solid"
import { Show, createMemo, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import "@styles/clipboard.css"

export default function Page() {
  const service = useMachine(clipboard.machine, {
    id: createUniqueId(),
    value: "https://zagjs.com/components/react/clipboard",
    timeout: 1500,
    translations: {
      triggerLabel: (copied) => (copied ? "Link copied" : "Copy link"),
    },
  })

  const api = createMemo(() => clipboard.connect(service, normalizeProps))

  return (
    <>
      <main>
        <div class="share-link">
          <div {...api().getRootProps()}>
            <p>Anyone with this link can view the Clipboard docs.</p>
            <button {...api().getTriggerProps()}>
              <Show when={api().copied} fallback={<ClipboardCopyIcon />}>
                <ClipboardCheck />
              </Show>
              <span>{api().copied ? "Link copied" : "Copy link"}</span>
            </button>
          </div>
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
