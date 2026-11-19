import { normalizeProps, useMachine } from "@zag-js/preact"
import * as toggle from "@zag-js/toggle"
import { BoldIcon, ItalicIcon, UnderlineIcon } from "lucide-preact"
import { useId } from "preact/hooks"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import "@styles/toggle.css"

function useFormat() {
  const service = useMachine(toggle.machine, { id: useId() })
  return { service, api: toggle.connect(service, normalizeProps) }
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
        <div className="toggle-text-formatting">
          <p className="hint">Press a format to apply it to the preview.</p>
          <div className="group">
            {formats.map(({ label, Icon, api }) => (
              <button key={label} aria-label={label} {...api.getRootProps()}>
                <span {...api.getIndicatorProps()}>
                  <Icon className="icon" />
                </span>
              </button>
            ))}
          </div>
          <p
            className="preview"
            data-testid="preview"
            data-bold={bold.api.pressed || undefined}
            data-italic={italic.api.pressed || undefined}
            data-underline={underline.api.pressed || undefined}
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
