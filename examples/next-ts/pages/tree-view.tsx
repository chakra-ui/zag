import { normalizeProps, useMachine } from "@zag-js/react"
import { treeviewControls } from "@zag-js/shared"
import * as tree from "@zag-js/tree-view"
import { useId } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(treeviewControls)

  const [state, send] = useMachine(tree.machine({ id: useId() }), {
    context: controls.context,
  })

  const api = tree.connect(state, send, normalizeProps)

  return (
    <>
      <main className="tree-view">
        <div {...api.rootProps}>
          <h3 {...api.labelProps}>My Documents</h3>
          <div>
            <button onClick={() => api.collapseAll()}>Collapse All</button>
            <button onClick={() => api.expandAll()}>Expand All</button>
            <span> - </span>
            <button onClick={() => api.selectAll()}>Select All</button>
            <button onClick={() => api.deselectAll()}>Deselect All</button>
          </div>

          <ul {...api.treeProps}>
            <li {...api.getBranchProps({ id: "node_modules", depth: 1 })}>
              <div {...api.getBranchControlProps({ id: "node_modules", depth: 1 })}>
                <span {...api.getBranchTextProps({ id: "node_modules", depth: 1 })}> 📂 node_modules</span>
              </div>

              <ul {...api.getBranchContentProps({ id: "node_modules", depth: 1 })}>
                <li {...api.getItemProps({ id: "node_modules/zag-js", depth: 2 })}>📄 zag-js</li>
                <li {...api.getItemProps({ id: "node_modules/pandacss", depth: 2 })}>📄 panda</li>

                <li {...api.getBranchProps({ id: "node_modules/@types", depth: 2 })}>
                  <div {...api.getBranchControlProps({ id: "node_modules/@types", depth: 2 })}>
                    <span {...api.getBranchTextProps({ id: "node_modules/@types", depth: 2 })}> 📂 @types</span>
                  </div>

                  <ul {...api.getBranchContentProps({ id: "node_modules/@types", depth: 2 })}>
                    <li {...api.getItemProps({ id: "node_modules/@types/react", depth: 3 })}>📄 react</li>
                    <li {...api.getItemProps({ id: "node_modules/@types/react-dom", depth: 3 })}>📄 react-dom</li>
                  </ul>
                </li>
              </ul>
            </li>

            <li {...api.getBranchProps({ id: "src", depth: 1 })}>
              <div {...api.getBranchControlProps({ id: "src", depth: 1 })}>
                <span {...api.getBranchTextProps({ id: "src", depth: 1 })}> 📂 src</span>
              </div>

              <ul {...api.getBranchContentProps({ id: "src", depth: 1 })}>
                <li {...api.getItemProps({ id: "src/app.tsx", depth: 2 })}>📄 app.tsx</li>
                <li {...api.getItemProps({ id: "src/index.ts", depth: 2 })}>📄 index.ts</li>
              </ul>
            </li>

            <li {...api.getItemProps({ id: "panda.config", depth: 1 })}>📄 panda.config.ts</li>
            <li {...api.getItemProps({ id: "package.json", depth: 1 })}>📄 package.json</li>
            <li {...api.getItemProps({ id: "renovate.json", depth: 1 })}>📄 renovate.json</li>
            <li {...api.getItemProps({ id: "readme.md", depth: 1 })}>📄 README.md</li>
          </ul>
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
