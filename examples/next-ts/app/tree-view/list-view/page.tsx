"use client"

import { normalizeProps, useMachine } from "@zag-js/react"
import * as tree from "@zag-js/tree-view"
import { ChevronRightIcon, FileIcon, FolderIcon, ListIcon, ListTreeIcon } from "lucide-react"
import { JSX, useId, useState } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import "@styles/tree-view.css"

interface Node {
  id: string
  name: string
  children?: Node[]
}

const rootNode: Node = {
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
    { id: "readme.md", name: "README.md" },
  ],
}

const options = { nodeToValue: (node: Node) => node.id, nodeToString: (node: Node) => node.name }
const treeCollection = tree.collection<Node>({ ...options, rootNode })

// Every file as one row, named by its full path. Ids match the tree, so selection carries over.
const files = treeCollection.getDescendantNodes([]).map((node) => ({
  id: node.id,
  name: [...treeCollection.getParentNodes(node.id), node].map((n) => n.name).join("/"),
}))

const listCollection = tree.collection<Node>({ ...options, rootNode: { ...rootNode, children: files } })

type View = "tree" | "list"

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
        <div {...api.getNodeCellProps(nodeProps)}>
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
  const [view, setView] = useState<View>("tree")
  const collection = view === "tree" ? treeCollection : listCollection

  const service = useMachine(tree.machine, {
    id: useId(),
    collection,
  })
  const api = tree.connect(service, normalizeProps)

  return (
    <>
      <main className="tree-view">
        <div {...api.getRootProps()}>
          <h3 {...api.getLabelProps()}>My Documents</h3>
          <div style={{ display: "flex", gap: "10px" }}>
            <button aria-pressed={view === "tree"} onClick={() => setView("tree")}>
              <ListTreeIcon /> Tree
            </button>
            <button aria-pressed={view === "list"} onClick={() => setView("list")}>
              <ListIcon /> List
            </button>
          </div>
          <div {...api.getTreeProps()}>
            {collection.rootNode.children?.map((node, index) => (
              <TreeNode key={node.id} node={node} indexPath={[index]} api={api} />
            ))}
          </div>
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
