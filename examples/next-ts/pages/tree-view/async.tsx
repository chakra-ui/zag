import styles from "../../../../shared/src/css/tree-view.module.css"
import { normalizeProps, useMachine } from "@zag-js/react"
import * as tree from "@zag-js/tree-view"
import { ChevronRightIcon, FileIcon, FolderIcon } from "lucide-react"
import { JSX, useId, useState } from "react"

interface Node {
  id: string
  name: string
  children?: Node[]
  childrenCount?: number
}

const apiResult = {
  node_modules: [
    { id: "zag-js", name: "zag-js" },
    { id: "pandacss", name: "panda" },
    { id: "@types", name: "@types", childrenCount: 2 },
  ],
  "node_modules/@types": [
    { id: "@types/react", name: "react" },
    { id: "@types/react-dom", name: "react-dom" },
  ],
  src: [
    { id: "src/app.tsx", name: "app.tsx" },
    { id: "src/index.ts", name: "index.ts" },
  ],
}

function loadChildren(details: tree.LoadChildrenDetails<Node>): Promise<Node[]> {
  const value = details.valuePath.join("/")
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(apiResult[value] ?? [])
    }, 1200)
  })
}

const initCollection = tree.collection<Node>({
  nodeToValue: (node) => node.id,
  nodeToString: (node) => node.name,
  rootNode: {
    id: "ROOT",
    name: "",
    children: [
      { id: "node_modules", name: "node_modules", childrenCount: 3 },
      { id: "src", name: "src", childrenCount: 2 },
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

  if (nodeState.isBranch) {
    return (
      <div {...api.getBranchProps(nodeProps)}>
        <div {...api.getBranchControlProps(nodeProps)} className={styles.BranchControl}>
          {nodeState.loading ? "..." : <FolderIcon />}
          <span {...api.getBranchTextProps(nodeProps)} className={styles.BranchText}>{node.name}</span>
          <span {...api.getBranchIndicatorProps(nodeProps)} className={styles.BranchIndicator}>
            <ChevronRightIcon />
          </span>
        </div>
        <div {...api.getBranchContentProps(nodeProps)} className={styles.BranchContent}>
          <div {...api.getBranchIndentGuideProps(nodeProps)} className={styles.BranchIndentGuide} />
          {node.children?.map((childNode, index) => (
            <TreeNode key={childNode.id} node={childNode} indexPath={[...indexPath, index]} api={api} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div {...api.getItemProps(nodeProps)} className={styles.Item}>
      <FileIcon /> {node.name}
    </div>
  )
}

export default function Page() {
  const [collection, setCollection] = useState(initCollection)

  const service = useMachine(tree.machine, {
    id: useId(),
    collection,
    loadChildren,
    onLoadChildrenComplete({ collection }) {
      setCollection(collection)
    },
  })

  const api = tree.connect(service, normalizeProps)

  return (
    <main className="tree-view">
      <div {...api.getRootProps()}>
        <h3 {...api.getLabelProps()}>My Documents</h3>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={() => api.collapse()}>Collapse All</button>
          <button onClick={() => api.expand()}>Expand All</button>
          <button onClick={() => api.expand(["node_modules"])}>Expand node_modules</button>
          <button onClick={() => api.collapse(["node_modules"])}>Collapse node_modules</button>
        </div>
        <div {...api.getTreeProps()} className={styles.Tree}>
          {collection.rootNode.children?.map((node, index) => (
            <TreeNode key={node.id} node={node} indexPath={[index]} api={api} />
          ))}
        </div>
      </div>
    </main>
  )
}
