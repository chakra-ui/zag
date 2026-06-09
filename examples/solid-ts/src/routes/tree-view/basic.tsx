import { treeviewControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import * as tree from "@zag-js/tree-view"
import { ChevronRightIcon, FileIcon, FolderIcon } from "lucide-solid"
import { Accessor, createMemo, createUniqueId, Index, JSX, Show } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"
import "@styles/tree-view.css"

interface Node {
  id: string
  name: string
  children?: Node[]
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
          <Index each={node.children}>
            {(childNode, index) => <TreeNode node={childNode()} indexPath={[...indexPath, index]} api={api} />}
          </Index>
        </div>
      </Show>
    </div>
  )
}

export default function Page() {
  const controls = useControls(treeviewControls)

  const service = useMachine(tree.machine, {
    id: createUniqueId(),
    collection,
  })

  const api = createMemo(() => tree.connect(service, normalizeProps))

  return (
    <>
      <main class="tree-view">
        <div {...api().getRootProps()}>
          <h3 {...api().getLabelProps()}>My Documents</h3>
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={() => api().collapse()}>Collapse All</button>
            <button onClick={() => api().expand()}>Expand All</button>
            <Show when={controls.state().selectionMode === "multiple"}>
              <button onClick={() => api().select()}>Select All</button>
              <button onClick={() => api().deselect()}>Deselect All</button>
            </Show>
          </div>
          <div {...api().getTreeProps()}>
            <Index each={collection.rootNode.children}>
              {(node, index) => <TreeNode node={node()} indexPath={[index]} api={api} />}
            </Index>
          </div>
        </div>
      </main>

      <Toolbar controls={controls}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
