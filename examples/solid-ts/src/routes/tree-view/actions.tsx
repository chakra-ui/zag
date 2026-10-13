import * as menu from "@zag-js/menu"
import { normalizeProps, useMachine } from "@zag-js/solid"
import * as tree from "@zag-js/tree-view"
import { ChevronRightIcon, FileIcon, FolderIcon, MoreVerticalIcon } from "lucide-solid"
import { Accessor, createMemo, createUniqueId, Index, JSX, Show } from "solid-js"
import { Portal } from "solid-js/web"
import { Presence } from "~/components/presence"
import "@styles/tree-view.css"
import "@styles/menu.css"

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
  treeApi: Accessor<tree.Api>
  menuApi: Accessor<menu.Api>
}

const TreeNode = (props: TreeNodeProps): JSX.Element => {
  const { node, indexPath, treeApi, menuApi } = props

  const nodeProps = { indexPath, node }
  const nodeState = createMemo(() => treeApi().getNodeState(nodeProps))

  return (
    <div {...treeApi().getNodeGroupProps(nodeProps)}>
      <div {...treeApi().getNodeProps(nodeProps)}>
        <div {...treeApi().getNodeCellProps(nodeProps)}>
          <Show when={nodeState().isBranch} fallback={<FileIcon />}>
            <FolderIcon />
          </Show>
          <span {...treeApi().getNodeTextProps(nodeProps)}>{node.name}</span>
          <Show when={nodeState().isBranch}>
            <span {...treeApi().getNodeIndicatorProps({ ...nodeProps, type: "expanded" })}>
              <ChevronRightIcon />
            </span>
          </Show>
        </div>
        <div {...treeApi().getNodeCellProps(nodeProps)}>
          <button
            {...menuApi().getTriggerProps({ value: nodeState().value })}
            style={{ background: "none", border: "none", cursor: "pointer", padding: "2px" }}
          >
            <MoreVerticalIcon size={14} />
          </button>
        </div>
      </div>
      <Show when={nodeState().isBranch}>
        <div {...treeApi().getNodeGroupContentProps(nodeProps)}>
          <div {...treeApi().getIndentGuideProps(nodeProps)} />
          <Index each={node.children}>
            {(childNode, index) => (
              <TreeNode node={childNode()} indexPath={[...indexPath, index]} treeApi={treeApi} menuApi={menuApi} />
            )}
          </Index>
        </div>
      </Show>
    </div>
  )
}

export default function Page() {
  const treeService = useMachine(tree.machine, {
    id: createUniqueId(),
    collection,
  })
  const treeApi = createMemo(() => tree.connect(treeService, normalizeProps))

  const menuService = useMachine(menu.machine, {
    id: createUniqueId(),
  })
  const menuApi = createMemo(() => menu.connect(menuService, normalizeProps))

  return (
    <main class="tree-view">
      <div {...treeApi().getRootProps()}>
        <h3 {...treeApi().getLabelProps()}>My Documents</h3>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={() => treeApi().collapse()}>Collapse All</button>
          <button onClick={() => treeApi().expand()}>Expand All</button>
        </div>
        <div {...treeApi().getTreeProps()}>
          <Index each={collection.rootNode.children}>
            {(node, index) => <TreeNode node={node()} indexPath={[index]} treeApi={treeApi} menuApi={menuApi} />}
          </Index>
        </div>
      </div>

      <Portal>
        <div {...menuApi().getPositionerProps()}>
          <Presence {...menuApi().getContentProps()}>
            <div {...menuApi().getItemProps({ value: "rename" })}>Rename "{menuApi().triggerValue}"</div>
            <div {...menuApi().getItemProps({ value: "duplicate" })}>Duplicate</div>
            <div {...menuApi().getItemProps({ value: "delete" })}>Delete</div>
          </Presence>
        </div>
      </Portal>
    </main>
  )
}
