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
        <div {...api.getRootProps()}>
          <h3 {...api.getLabelProps()}>My Documents</h3>
          <div>
            <button onClick={() => api.collapse()}>Collapse All</button>
            <button onClick={() => api.expand()}>Expand All</button>
            <span> - </span>
            <button onClick={() => api.select()}>Select All</button>
            <button onClick={() => api.deselect()}>Deselect All</button>
          </div>

          <ul {...api.getTreeProps()}>
            <li {...api.getBranchProps({ value: "node_modules", depth: 1 })}>
              <div {...api.getBranchControlProps({ value: "node_modules", depth: 1 })}>
                <span {...api.getBranchTextProps({ value: "node_modules", depth: 1 })}> 📂 node_modules</span>
              </div>

              <ul {...api.getBranchContentProps({ value: "node_modules", depth: 1 })}>
                <li {...api.getItemProps({ value: "node_modules/zag-js", depth: 2 })}>📄 zag-js</li>
                <li {...api.getItemProps({ value: "node_modules/pandacss", depth: 2 })}>📄 panda</li>

                <li {...api.getBranchProps({ value: "node_modules/@types", depth: 2 })}>
                  <div {...api.getBranchControlProps({ value: "node_modules/@types", depth: 2 })}>
                    <span {...api.getBranchTextProps({ value: "node_modules/@types", depth: 2 })}> 📂 @types</span>
                  </div>

                  <ul {...api.getBranchContentProps({ value: "node_modules/@types", depth: 2 })}>
                    <li {...api.getItemProps({ value: "node_modules/@types/react", depth: 3 })}>📄 react</li>
                    <li {...api.getItemProps({ value: "node_modules/@types/react-dom", depth: 3 })}>📄 react-dom</li>
                  </ul>
                </li>
              </ul>
            </li>

            <li {...api.getBranchProps({ value: "src", depth: 1 })}>
              <div {...api.getBranchControlProps({ value: "src", depth: 1 })}>
                <span {...api.getBranchTextProps({ value: "src", depth: 1 })}> 📂 src</span>
              </div>

              <ul {...api.getBranchContentProps({ value: "src", depth: 1 })}>
                <li {...api.getItemProps({ value: "src/app.tsx", depth: 2 })}>📄 app.tsx</li>
                <li {...api.getItemProps({ value: "src/index.ts", depth: 2 })}>📄 index.ts</li>
              </ul>
            </li>

            <li {...api.getItemProps({ value: "panda.config", depth: 1 })}>📄 panda.config.ts</li>
            <li {...api.getItemProps({ value: "package.json", depth: 1 })}>📄 package.json</li>
            <li {...api.getItemProps({ value: "renovate.json", depth: 1 })}>📄 renovate.json</li>
            <li {...api.getItemProps({ value: "readme.md", depth: 1 })}>📄 README.md</li>
          </ul>
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
