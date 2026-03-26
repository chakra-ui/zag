import styles from "../../../../shared/src/css/tree-view.module.css"
import { normalizeProps, useMachine } from "@zag-js/react"
import * as tree from "@zag-js/tree-view"
import { CheckSquare, ChevronRightIcon, MinusSquare, Square } from "lucide-react"
import { JSX, useId } from "react"

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
  api: tree.Api
}

const iconMap = {
  true: CheckSquare,
  false: Square,
  indeterminate: MinusSquare,
}

function TreeNodeCheckbox(props: TreeNodeProps) {
  const { api, ...nodeProps } = props
  const nodeState = api.getNodeState(nodeProps)

  const checkboxProps = api.getNodeCheckboxProps(nodeProps)
  const Icon = iconMap[nodeState.checked.toString()]

  return <Icon {...checkboxProps} />
}

const TreeNode = (props: TreeNodeProps): JSX.Element => {
  const { node, indexPath, api } = props

  const nodeProps = { indexPath, node }
  const nodeState = api.getNodeState(nodeProps)

  if (nodeState.isBranch) {
    return (
      <div {...api.getBranchProps(nodeProps)}>
        <div {...api.getBranchControlProps(nodeProps)} className={styles.BranchControl}>
          <TreeNodeCheckbox {...props} />
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
      <TreeNodeCheckbox {...props} /> {node.name}
    </div>
  )
}

export default function Page() {
  const service = useMachine(tree.machine as tree.Machine<Node>, {
    id: useId(),
    collection: initialCollection,
    defaultCheckedValue: [],
  })

  const api = tree.connect(service, normalizeProps)

  return (
    <main className="tree-view">
      <div {...api.getRootProps()}>
        <h3 {...api.getLabelProps()}>My Documents</h3>
        <div {...api.getTreeProps()} className={styles.Tree}>
          {api.collection.rootNode.children?.map((node, index) => (
            <TreeNode key={node.id} node={node} indexPath={[index]} api={api} />
          ))}
        </div>
      </div>
      <pre>{JSON.stringify(api.checkedValue, null, 2)}</pre>
    </main>
  )
}
