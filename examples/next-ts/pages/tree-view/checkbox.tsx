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
  const Icon = iconMap[nodeState.checked.toString()]

  return (
    <span {...api.getNodeCheckboxProps(nodeProps)}>
      <Icon />
    </span>
  )
}

const TreeNode = (props: TreeNodeProps): JSX.Element => {
  const { node, indexPath, api } = props

  const nodeProps = { indexPath, node }
  const nodeState = api.getNodeState(nodeProps)

  return (
    <div {...api.getNodeGroupProps(nodeProps)}>
      <div {...api.getNodeProps(nodeProps)}>
        <div {...api.getCellProps(nodeProps)}>
          <TreeNodeCheckbox {...props} />
        </div>
        <div {...api.getCellProps(nodeProps)}>
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
        <div {...api.getTreeProps()}>
          {api.collection.rootNode.children?.map((node, index) => (
            <TreeNode key={node.id} node={node} indexPath={[index]} api={api} />
          ))}
        </div>
      </div>
      <pre>{JSON.stringify(api.checkedValue, null, 2)}</pre>
    </main>
  )
}
