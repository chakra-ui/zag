import * as clipboard from "@zag-js/clipboard"
import { normalizeProps, useMachine } from "@zag-js/preact"
import { ClipboardCheck, ClipboardCopyIcon } from "lucide-preact"
import { useId } from "preact/hooks"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import "@styles/clipboard.css"

export default function Page() {
  const service = useMachine(clipboard.machine, {
    id: useId(),
    value: "https://zagjs.com/components/react/clipboard",
    timeout: 1500,
    translations: {
      triggerLabel: (copied) => (copied ? "Link copied" : "Copy link"),
    },
  })

  const api = clipboard.connect(service, normalizeProps)

  return (
    <>
      <main>
        <div className="share-link">
          <div {...api.getRootProps()}>
            <p>Anyone with this link can view the Clipboard docs.</p>
            <button {...api.getTriggerProps()}>
              {api.copied ? <ClipboardCheck /> : <ClipboardCopyIcon />}
              <span>{api.copied ? "Link copied" : "Copy link"}</span>
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
