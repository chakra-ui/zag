import * as menu from "@zag-js/menu"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import * as tree from "@zag-js/tree-view"
import { ChevronRightIcon, FileIcon, FolderIcon, MoreVerticalIcon } from "lucide-react"
import { JSX, useId } from "react"
import { Presence } from "../../components/presence"

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
  treeApi: tree.Api
  menuApi: menu.Api
}

const TreeNode = (props: TreeNodeProps): JSX.Element => {
  const { node, indexPath, treeApi, menuApi } = props

  const nodeProps = { indexPath, node }
  const nodeState = treeApi.getNodeState(nodeProps)

  return (
    <div {...treeApi.getNodeGroupProps(nodeProps)}>
      <div {...treeApi.getNodeProps(nodeProps)}>
        <div {...treeApi.getCellProps(nodeProps)}>
          {nodeState.isBranch ? <FolderIcon /> : <FileIcon />}
          <span {...treeApi.getNodeTextProps(nodeProps)}>{node.name}</span>
          {nodeState.isBranch && (
            <span {...treeApi.getNodeIndicatorProps({ ...nodeProps, type: "expanded" })}>
              <ChevronRightIcon />
            </span>
          )}
        </div>
        <div {...treeApi.getCellProps(nodeProps)}>
          <button
            {...menuApi.getTriggerProps({ value: nodeState.value })}
            style={{ background: "none", border: "none", cursor: "pointer", padding: "2px" }}
          >
            <MoreVerticalIcon size={14} />
          </button>
        </div>
      </div>
      {nodeState.isBranch && (
        <div {...treeApi.getNodeGroupContentProps(nodeProps)}>
          <div {...treeApi.getIndentGuideProps(nodeProps)} />
          {node.children?.map((childNode, index) => (
            <TreeNode
              key={childNode.id}
              node={childNode}
              indexPath={[...indexPath, index]}
              treeApi={treeApi}
              menuApi={menuApi}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function Page() {
  const treeService = useMachine(tree.machine, {
    id: useId(),
    collection,
  })
  const treeApi = tree.connect(treeService, normalizeProps)

  const menuService = useMachine(menu.machine, {
    id: useId(),
  })
  const menuApi = menu.connect(menuService, normalizeProps)

  return (
    <main className="tree-view">
      <div {...treeApi.getRootProps()}>
        <h3 {...treeApi.getLabelProps()}>My Documents</h3>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={() => treeApi.collapse()}>Collapse All</button>
          <button onClick={() => treeApi.expand()}>Expand All</button>
        </div>
        <div {...treeApi.getTreeProps()}>
          {collection.rootNode.children?.map((node, index) => (
            <TreeNode key={node.id} node={node} indexPath={[index]} treeApi={treeApi} menuApi={menuApi} />
          ))}
        </div>
      </div>

      <Portal>
        <div {...menuApi.getPositionerProps()}>
          <Presence {...menuApi.getContentProps()}>
            <div {...menuApi.getItemProps({ value: "rename" })}>Rename "{menuApi.triggerValue}"</div>
            <div {...menuApi.getItemProps({ value: "duplicate" })}>Duplicate</div>
            <div {...menuApi.getItemProps({ value: "delete" })}>Delete</div>
          </Presence>
        </div>
      </Portal>
    </main>
  )
}
