import { normalizeProps, useMachine } from "@zag-js/solid"
import * as tree from "@zag-js/tree-view"
import { ChevronRightIcon, FileIcon, FolderIcon, ListIcon, ListTreeIcon } from "lucide-solid"
import { Accessor, createMemo, createSignal, createUniqueId, For, Show } from "solid-js"
import type { JSX } from "@solidjs/web"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
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
  api: Accessor<tree.Api>
}

const TreeNode = (props: TreeNodeProps): JSX.Element => {
  const { node, indexPath, api } = props
  const nodeProps = { indexPath, node }
  const nodeState = createMemo(() => api().getNodeState(nodeProps))
  return (
    <div {...api().getNodeGroupProps(nodeProps)}>
      <div {...api().getNodeProps(nodeProps)}>
        <div {...api().getNodeCellProps(nodeProps)}>
          <Show when={nodeState().isBranch} fallback={<FileIcon />}>
            <FolderIcon />
          </Show>
          <span {...api().getNodeTextProps(nodeProps)}>{node.name}</span>
          <Show when={nodeState().isBranch}>
            <span {...api().getNodeIndicatorProps({ ...nodeProps, type: "expanded" })}>
              <ChevronRightIcon />
            </span>
          </Show>
        </div>
      </div>
      <Show when={nodeState().isBranch}>
        <div {...api().getNodeGroupContentProps(nodeProps)}>
          <div {...api().getIndentGuideProps(nodeProps)} />
          <For keyed={false} each={node.children}>
            {(childNode, index) => <TreeNode node={childNode()} indexPath={[...indexPath, index]} api={api} />}
          </For>
        </div>
      </Show>
    </div>
  )
}

export default function Page() {
  const [view, setView] = createSignal<View>("tree")
  const collection = () => (view() === "tree" ? treeCollection : listCollection)

  const id = createUniqueId()
  const service = useMachine(tree.machine, () => ({ id, collection: collection() }))
  const api = createMemo(() => tree.connect(service, normalizeProps))

  return (
    <>
      <main class="tree-view">
        <div {...api().getRootProps()}>
          <h3 {...api().getLabelProps()}>My Documents</h3>
          <div style={{ display: "flex", gap: "10px" }}>
            <button aria-pressed={String(view() === "tree")} onClick={() => setView("tree")}>
              <ListTreeIcon /> Tree
            </button>
            <button aria-pressed={String(view() === "list")} onClick={() => setView("list")}>
              <ListIcon /> List
            </button>
          </div>
          <div {...api().getTreeProps()}>
            <For each={collection().rootNode.children}>
              {(node, index) => <TreeNode node={node} indexPath={[index()]} api={api} />}
            </For>
          </div>
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
