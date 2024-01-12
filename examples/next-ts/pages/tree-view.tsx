import { normalizeProps, useMachine } from "@zag-js/react"
import * as tree from "@zag-js/tree-view"
import { useId } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

export default function Page() {
  const [state, send] = useMachine(tree.machine({ id: useId() }))
  const api = tree.connect(state, send, normalizeProps)

  return (
    <>
      <main className="tree-view">
        <div {...api.rootProps}>
          <h3 {...api.labelProps}>My Documents</h3>
          <div>
            <button onClick={() => api.collapseAll()}>Collapse All</button>
            <button onClick={() => api.expandAll()}>Expand All</button>
            <button onClick={() => api.selectAll()}>Select All</button>
          </div>

          <ul {...api.treeProps}>
            <li {...api.getItemProps({ id: "readme.md", depth: 0 })}>📄 README.md</li>

            <li {...api.getBranchProps({ id: "node_modules", depth: 0 })}>
              <div {...api.getBranchTriggerProps({ id: "node_modules", depth: 0 })}> 📂 node_modules</div>

              <ul {...api.getBranchContentProps({ id: "node_modules", depth: 0 })}>
                <li {...api.getItemProps({ id: "node_modules/zag-js", depth: 1 })}>📄 zag-js</li>
                <li {...api.getItemProps({ id: "node_modules/pandacss", depth: 1 })}>📄 panda</li>

                <li {...api.getBranchProps({ id: "@types", depth: 1 })}>
                  <div {...api.getBranchTriggerProps({ id: "@types", depth: 1 })}> 📂 @types</div>

                  <ul {...api.getBranchContentProps({ id: "@types", depth: 1 })}>
                    <li {...api.getItemProps({ id: "@types/react", depth: 2 })}>📄 react</li>
                    <li {...api.getItemProps({ id: "@types/react-dom", depth: 2 })}>📄 react-dom</li>
                  </ul>
                </li>
              </ul>
            </li>

            <li {...api.getBranchProps({ id: "src", depth: 0 })}>
              <div {...api.getBranchTriggerProps({ id: "src", depth: 0 })}> 📂 src</div>

              <ul {...api.getBranchContentProps({ id: "src", depth: 0 })}>
                <li {...api.getItemProps({ id: "src/app.tsx", depth: 1 })}>📄 app.tsx</li>
                <li {...api.getItemProps({ id: "src/index.ts", depth: 1 })}>📄 index.ts</li>
              </ul>
            </li>

            <li {...api.getItemProps({ id: "panda.config", depth: 0 })}>📄 panda.config.js</li>
          </ul>
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
