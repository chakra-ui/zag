import { useMachine } from "@ui-machines/react"
import { splitView } from "@ui-machines/web"
import { StateVisualizer } from "components/state-visualizer"
import { useMount } from "hooks/use-mount"

export default function Page() {
  const [state, send] = useMachine(splitView.machine.withContext({ min: 0 }))
  const ref = useMount<HTMLDivElement>(send)

  const { rootProps, splitterProps, primaryPaneProps, secondaryPaneProps, labelProps } = splitView.connect(state, send)

  return (
    <>
      <div className="root">
        <div ref={ref} {...rootProps}>
          <div className="pane" {...primaryPaneProps}>
            <div>
              <small {...labelProps}>Table of Contents</small>
              <p>Primary Pane</p>
            </div>
          </div>
          <div className="splitter" {...splitterProps}>
            <div className="splitter-bar" />
          </div>
          <div className="pane" {...secondaryPaneProps}>
            Secondary Pane
          </div>
        </div>
      </div>
      <StateVisualizer state={state} />

      <style jsx>{`
        .root {
          height: 300px;
        }

        .pane {
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid lightgray;
          overflow: auto;
        }

        .splitter {
          width: 8px;
          background: #ebebeb;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s ease-in-out;
          outline: 0;
        }

        .splitter[data-focus] {
          background: #b0baf1;
        }

        .splitter:active {
          background: #3f51b5;
          color: white;
        }

        .splitter-bar {
          width: 2px;
          height: 40px;
          background-color: currentColor;
        }
      `}</style>
    </>
  )
}
