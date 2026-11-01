import { normalizeProps, useMachine } from "@zag-js/solid"
import * as tree from "@zag-js/tree-view"
import { ChevronRightIcon, FileIcon, FolderIcon, LoaderCircleIcon } from "lucide-solid"
import { Accessor, createMemo, createSignal, createUniqueId, Index, JSX, Show } from "solid-js"
import "@styles/tree-view.css"

interface Node {
  id: string
  name: string
  children?: Node[]
  childrenCount?: number
}

const apiResult: Record<string, Node[]> = {
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
  api: Accessor<tree.Api>
}

const TreeNode = (props: TreeNodeProps): JSX.Element => {
  const nodeProps = () => ({ indexPath: props.indexPath, node: props.node })
  const nodeState = createMemo(() => props.api().getNodeState(nodeProps()))

  return (
    <div {...props.api().getNodeGroupProps(nodeProps())}>
      <div {...props.api().getNodeProps(nodeProps())}>
        <div {...props.api().getNodeCellProps(nodeProps())}>
          <Show when={nodeState().isBranch} fallback={<FileIcon />}>
            <FolderIcon />
          </Show>
          <span {...props.api().getNodeTextProps(nodeProps())}>{props.node.name}</span>
          <Show when={nodeState().loading}>
            <LoaderCircleIcon class="tree-view-spinner" aria-hidden />
          </Show>
          <Show when={nodeState().isBranch}>
            <span {...props.api().getNodeIndicatorProps({ ...nodeProps(), type: "expanded" })}>
              <ChevronRightIcon />
            </span>
          </Show>
        </div>
      </div>
      <Show when={nodeState().isBranch}>
        <div {...props.api().getNodeGroupContentProps(nodeProps())}>
          <div {...props.api().getIndentGuideProps(nodeProps())} />
          <Index each={props.node.children}>
            {(childNode, index) => (
              <TreeNode node={childNode()} indexPath={[...props.indexPath, index]} api={props.api} />
            )}
          </Index>
        </div>
      </Show>
    </div>
  )
}

export default function Page() {
  const [collection, setCollection] = createSignal(initCollection)

  const id = createUniqueId()
  const service = useMachine(tree.machine, () => ({
    id,
    collection: collection(),
    loadChildren,
    onLoadChildrenComplete({ collection }) {
      setCollection(collection)
    },
  }))

  const api = createMemo(() => tree.connect(service, normalizeProps))

  return (
    <main class="tree-view">
      <div {...api().getRootProps()}>
        <h3 {...api().getLabelProps()}>My Documents</h3>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={() => api().collapse()}>Collapse All</button>
          <button onClick={() => api().expand()}>Expand All</button>
          <button onClick={() => api().expand(["node_modules"])}>Expand node_modules</button>
          <button onClick={() => api().collapse(["node_modules"])}>Collapse node_modules</button>
        </div>
        <div {...api().getTreeProps()}>
          <Index each={collection().rootNode.children}>
            {(node, index) => <TreeNode node={node()} indexPath={[index]} api={api} />}
          </Index>
        </div>
      </div>
    </main>
  )
}
