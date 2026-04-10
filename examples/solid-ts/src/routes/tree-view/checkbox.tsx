import { normalizeProps, useMachine } from "@zag-js/solid"
import * as tree from "@zag-js/tree-view"
import { ChevronRightIcon, CheckSquareIcon, SquareIcon, MinusSquareIcon } from "lucide-solid"
import { Accessor, createMemo, createUniqueId, Index, JSX, Show } from "solid-js"

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
    ],
  },
})

const iconMap = {
  true: CheckSquareIcon,
  false: SquareIcon,
  indeterminate: MinusSquareIcon,
}

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
        <div {...api().getCellProps(nodeProps)}>
          {(() => {
            const Icon = iconMap[nodeState().checked.toString()]
            return (
              <span {...api().getNodeCheckboxProps(nodeProps)}>
                <Icon />
              </span>
            )
          })()}
        </div>
        <div {...api().getCellProps(nodeProps)}>
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
  const service = useMachine(tree.machine, {
    id: createUniqueId(),
    collection,
    defaultCheckedValue: [],
  })

  const api = createMemo(() => tree.connect(service, normalizeProps))

  return (
    <main class="tree-view">
      <div {...api().getRootProps()}>
        <h3 {...api().getLabelProps()}>My Documents</h3>
        <div {...api().getTreeProps()}>
          <Index each={collection.rootNode.children}>
            {(node, index) => <TreeNode node={node()} indexPath={[index]} api={api} />}
          </Index>
        </div>
      </div>
      <pre>{JSON.stringify(api().checkedValue, null, 2)}</pre>
    </main>
  )
}
