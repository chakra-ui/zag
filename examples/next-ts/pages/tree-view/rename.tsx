import { normalizeProps, useMachine } from "@zag-js/react"
import * as tree from "@zag-js/tree-view"
import { ChevronRightIcon, FileIcon, FolderIcon } from "lucide-react"
import { JSX, useId, useState } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import { useControls } from "../../hooks/use-controls"

interface Node {
  id: string
  name: string
  children?: Node[]
}

const initialCollection = tree.collection<Node>({
  nodeToValue: (node) => node.id,
  nodeToString: (node) => node.name,
  rootNode: {
    id: "ROOT",
    name: "",
    children: [
      {
        id: "node_modules",
        name: "node_modules",
        children: [
          { id: "node_modules/zag-js", name: "zag-js" },
          { id: "node_modules/pandacss", name: "panda" },
          {
            id: "node_modules/@types",
            name: "@types",
            children: [
              { id: "node_modules/@types/react", name: "react" },
              { id: "node_modules/@types/react-dom", name: "react-dom" },
            ],
          },
        ],
      },
      {
        id: "src",
        name: "src",
        children: [
          { id: "src/app.tsx", name: "app.tsx" },
          { id: "src/index.ts", name: "index.ts" },
        ],
      },
      { id: "panda.config", name: "panda.config.ts" },
      { id: "package.json", name: "package.json" },
      { id: "renovate.json", name: "renovate.json" },
      { id: "readme.md", name: "README.md" },
    ],
  },
})

interface TreeNodeProps {
  node: Node
  indexPath: number[]
  api: tree.Api
}

const TreeNode = (props: TreeNodeProps): JSX.Element => {
  const { node, indexPath, api } = props

  const nodeProps = { indexPath, node }
  const nodeState = api.getNodeState(nodeProps)

  return (
    <div {...api.getNodeGroupProps(nodeProps)}>
      <div {...api.getNodeProps(nodeProps)}>
        <div {...api.getCellProps(nodeProps)}>
          {nodeState.renaming ? (
            <input {...api.getNodeRenameInputProps(nodeProps)} />
          ) : (
            <>
              {nodeState.isBranch ? <FolderIcon /> : <FileIcon />}
              <span {...api.getNodeTextProps(nodeProps)} style={{ display: nodeState.renaming ? "none" : "inline" }}>
                {node.name}
              </span>
              {nodeState.isBranch && (
                <span {...api.getNodeIndicatorProps({ ...nodeProps, type: "expanded" })}>
                  <ChevronRightIcon />
                </span>
              )}
            </>
          )}
        </div>
      </div>
      {nodeState.isBranch && (
        <div {...api.getNodeGroupContentProps(nodeProps)}>
          <div {...api.getIndentGuideProps(nodeProps)} />
          {node.children?.map((childNode, index) => (
            <TreeNode key={childNode.id} node={childNode} indexPath={[...indexPath, index]} api={api} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function Page() {
  const controls = useControls({})
  const [collection, setCollection] = useState(initialCollection)

  const service = useMachine(tree.machine, {
    id: useId(),
    collection,
    canRename: (node) => {
      // Only allow renaming leaf nodes (files), not branches (folders)
      return !node.children
    },
    onRenameComplete: (details) => {
      console.log("Rename complete:", details)
      const node = collection.at(details.indexPath)
      const updatedCollection = collection.replace(details.indexPath, {
        ...node,
        name: details.label,
      })
      setCollection(updatedCollection)
    },
    ...controls.context,
  })
  const api = tree.connect(service, normalizeProps)

  return (
    <>
      <main className="tree-view">
        <div {...api.getRootProps()}>
          <h3 {...api.getLabelProps()}>My Documents (Renameable)</h3>
          <p style={{ fontSize: "14px", color: "#666", marginBottom: "10px" }}>
            Press F2 on any <strong>file</strong> to rename it (folders cannot be renamed). Empty names and duplicates
            are prevented.
          </p>
          <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
            <button onClick={() => api.collapse()}>Collapse All</button>
            <button onClick={() => api.expand()}>Expand All</button>
          </div>
          <div {...api.getTreeProps()}>
            {collection.rootNode.children?.map((node, index) => (
              <TreeNode key={node.id} node={node} indexPath={[index]} api={api} />
            ))}
          </div>
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
