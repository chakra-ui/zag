import { useMachine } from "@ui-machines/react"
import { splitView } from "@ui-machines/web"
import { StateVisualizer } from "components/state-visualizer"
import { useMount } from "hooks/use-mount"

function Page() {
  const [state, send] = useMachine(splitView.machine)
  const ref = useMount<HTMLDivElement>(send)

  const { rootProps, splitterProps, primaryPaneProps, secondaryPaneProps } = splitView.connect(state, send)

  return (
    <>
      <div className="root">
        <div ref={ref} {...rootProps}>
          <div className="pane" {...primaryPaneProps}>
            Primary Pane
          </div>
          <div className="splitter" {...splitterProps} />
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
        }

        .splitter {
          width: 10px;
          background: pink;
        }
      `}</style>
    </>
  )
}

export default Page
