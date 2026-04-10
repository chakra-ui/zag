import { normalizeProps, useMachine } from "@zag-js/react"
import * as tree from "@zag-js/tree-view"
import { LuFile, LuFolder, LuChevronRight } from "react-icons/lu"
import { JSX, useId } from "react"
import styles from "../styles/machines/tree-view.module.css"

interface TreeViewProps extends Omit<tree.Props, "id" | "collection"> {}

export function TreeView(props: TreeViewProps) {
  const service = useMachine(tree.machine as tree.Machine<Node>, {
    id: useId(),
    collection,
    ...props,
  })

  const api = tree.connect(service, normalizeProps)

  return (
    <div {...api.getRootProps()}>
      <h3 className={styles.Label} {...api.getLabelProps()}>
        My Documents
      </h3>
      <div style={{ display: "flex", gap: "10px" }}>
        <button className={styles.Trigger} onClick={() => api.collapse()}>
          Collapse All
        </button>
        <button className={styles.Trigger} onClick={() => api.expand()}>
          Expand All
        </button>
      </div>
      <div className={styles.Tree} {...api.getTreeProps()}>
        {collection.rootNode.children?.map((node, index) => (
          <TreeNode key={node.id} node={node} indexPath={[index]} api={api} />
        ))}
      </div>
    </div>
  )
}

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
  api: tree.Api
}

const TreeNode = (props: TreeNodeProps): JSX.Element => {
  const { node, indexPath, api } = props

  const nodeProps = { indexPath, node }
  const nodeState = api.getNodeState(nodeProps)

  return (
    <div {...api.getNodeGroupProps(nodeProps)}>
      <div className={styles.Node} {...api.getNodeProps(nodeProps)}>
        <div className={styles.Cell} {...api.getCellProps(nodeProps)}>
          {nodeState.isBranch ? <LuFolder /> : <LuFile />}
          <span
            className={styles.NodeText}
            {...api.getNodeTextProps(nodeProps)}
          >
            {node.name}
          </span>
          {nodeState.isBranch && (
            <span
              className={styles.NodeIndicator}
              {...api.getNodeIndicatorProps({ ...nodeProps, type: "expanded" })}
            >
              <LuChevronRight />
            </span>
          )}
        </div>
      </div>
      {nodeState.isBranch && (
        <div
          className={styles.NodeGroupContent}
          {...api.getNodeGroupContentProps(nodeProps)}
        >
          <div
            className={styles.IndentGuide}
            {...api.getIndentGuideProps(nodeProps)}
          />
          {node.children?.map((childNode, index) => (
            <TreeNode
              key={childNode.id}
              node={childNode}
              indexPath={[...indexPath, index]}
              api={api}
            />
          ))}
        </div>
      )}
    </div>
  )
}
