import { normalizeProps, useMachine } from "@zag-js/solid"
import * as tree from "@zag-js/tree-view"
import { ChevronRightIcon, FileIcon, FolderIcon } from "lucide-solid"
import { Accessor, createMemo, createSignal, createUniqueId, Index, JSX, Show } from "solid-js"
import "@styles/tree-view.css"

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
  const [collection, setCollection] = createSignal(initialCollection)

  const id = createUniqueId()
  const service = useMachine(tree.machine, () => ({
    id,
    collection: collection(),
  }))

  const api = createMemo(() => tree.connect(service, normalizeProps))

  return (
    <main class="tree-view">
      <div {...api().getRootProps()}>
        <input
          type="text"
          class="tree-view-search"
          placeholder="Search files…"
          onInput={(e) => {
            const value = e.currentTarget.value
            if (value.length === 0) {
              setCollection(initialCollection)
            } else {
              const filtered = initialCollection.filter((node) => node.name.includes(value))
              setCollection(filtered)
              api().setExpandedValue(filtered.getBranchValues())
            }
          }}
        />
        <h3 {...api().getLabelProps()}>My Documents</h3>
        <div {...api().getTreeProps()}>
          <Index each={collection().rootNode.children}>
            {(node, index) => <TreeNode node={node()} indexPath={[index]} api={api} />}
          </Index>
        </div>
      </div>
    </main>
  )
}
