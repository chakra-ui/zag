import { normalizeProps, useMachine } from "@zag-js/preact"
import * as signaturePad from "@zag-js/signature-pad"
import { RotateCcw } from "lucide-preact"
import { useId, useState } from "preact/hooks"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import "@styles/signature-pad.css"

export default function Page() {
  const [paths, setPaths] = useState<string[]>([])
  const [undone, setUndone] = useState<string[]>([])

  const service = useMachine(signaturePad.machine, {
    id: useId(),
    paths,
    onDraw: (details) => setPaths(details.paths),
    onDrawEnd: () => setUndone([]),
  })
  const api = signaturePad.connect(service, normalizeProps)

  const undo = () => {
    setUndone((prev) => [...prev, paths[paths.length - 1]])
    setPaths(paths.slice(0, -1))
  }

  const redo = () => {
    setPaths([...paths, undone[undone.length - 1]])
    setUndone((prev) => prev.slice(0, -1))
  }

  return (
    <>
      <main>
        <div className="signature-pad-undo-redo">
          <p className="hint">Draw a few strokes, then step back and forward through them.</p>
          <div {...api.getRootProps()}>
            <label {...api.getLabelProps()}>Signature</label>
            <div {...api.getControlProps()}>
              <svg {...api.getSegmentProps()}>
                {api.paths.map((path, index) => (
                  <path key={index} {...api.getSegmentPathProps({ path })} />
                ))}
                {api.currentPath && <path {...api.getSegmentPathProps({ path: api.currentPath })} />}
              </svg>
              <div {...api.getGuideProps()} />
            </div>
            <button {...api.getClearTriggerProps()}>
              <RotateCcw />
            </button>
          </div>
          <div className="actions">
            <button type="button" disabled={paths.length === 0} onClick={undo}>
              Undo
            </button>
            <button type="button" disabled={undone.length === 0} onClick={redo}>
              Redo
            </button>
            <span data-testid="stroke-count">
              {paths.length} {paths.length === 1 ? "stroke" : "strokes"}
            </span>
          </div>
        </div>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} omit={["currentPoints", "currentPath", "paths"]} />
      </Toolbar>
    </>
  )
}
