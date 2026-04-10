import { normalizeProps, useMachine } from "@zag-js/react"
import { treeviewControls } from "@zag-js/shared"
import * as tree from "@zag-js/tree-view"
import { ChevronRightIcon, FileIcon, FolderIcon } from "lucide-react"
import { JSX, useId } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import { useControls } from "../../hooks/use-controls"

interface Node {
  id: string
  name: string
  children?: Node[]
  disabled?: boolean
}

const collection = tree.collection<Node>({
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
          {nodeState.isBranch ? <FolderIcon /> : <FileIcon />}
          <span {...api.getNodeTextProps(nodeProps)}>{node.name}</span>
          {nodeState.isBranch && (
            <span {...api.getNodeIndicatorProps({ ...nodeProps, type: "expanded" })}>
              <ChevronRightIcon />
            </span>
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
  const controls = useControls(treeviewControls)

  const service = useMachine(tree.machine, {
    id: useId(),
    collection,
    ...controls.context,
  })
  const api = tree.connect(service, normalizeProps)

  return (
    <>
      <main className="tree-view">
        <div {...api.getRootProps()}>
          <h3 {...api.getLabelProps()}>My Documents</h3>
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={() => api.collapse()}>Collapse All</button>
            <button onClick={() => api.expand()}>Expand All</button>
            {controls.context.selectionMode === "multiple" && (
              <>
                <button onClick={() => api.select()}>Select All</button>
                <button onClick={() => api.deselect()}>Deselect All</button>
              </>
            )}
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
