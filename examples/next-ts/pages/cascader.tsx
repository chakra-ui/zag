import * as cascader from "@zag-js/cascader"
import { useMachine, normalizeProps, Portal } from "@zag-js/react"
import { cascaderControls, cascaderData } from "@zag-js/shared"
import { useId } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

interface Node {
  label: string
  value: string
  children?: Node[]
}

const collection = cascader.collection<Node>({
  nodeToValue: (node) => node.value,
  nodeToString: (node) => node.label,
  rootNode: cascaderData,
})

interface TreeNodeProps {
  node: Node
  indexPath: number[]
  api: cascader.Api
}

const TreeNode = (props: TreeNodeProps): JSX.Element => {
  const { node, indexPath, api } = props

  const nodeProps = { indexPath, node }
  const nodeState = api.getNodeState(nodeProps)
  // TODO encapsulate
  const activeIndex = api.highlightedIndexPath[nodeState.depth] ?? -1
  const children = collection.getNodeChildren(node)
  const activeNode = activeIndex >= 0 ? children[activeIndex] : null
  const isBranchActiveNode = activeNode && collection.isBranchNode(activeNode)

  return (
    <>
      <ul {...api.getListProps(nodeProps)}>
        {node.children?.map((item, index) => {
          const itemProps = { indexPath: [...indexPath, index], node: item }
          const itemState = api.getNodeState(itemProps)
          return (
            <li key={item.label} {...api.getItemProps(itemProps)}>
              <span {...api.getItemTextProps(itemProps)}>{item.label}</span>

              {itemState.isBranch && <span>&nbsp; ⦔</span>}
            </li>
          )
        })}
      </ul>
      {isBranchActiveNode && <TreeNode node={activeNode} indexPath={[...indexPath, activeIndex]} api={api} />}
    </>
  )
}

export default function Page() {
  const controls = useControls(cascaderControls)

  const [state, send] = useMachine(cascader.machine({ id: useId(), collection }), {
    context: controls.context,
  })

  const api = cascader.connect(state, send, normalizeProps)

  return (
    <>
      <main className="cascader">
        <div {...api.getRootProps()}>
          <label {...api.getLabelProps()}>Label</label>
          {/* control */}
          <div {...api.getControlProps()}>
            <button {...api.getTriggerProps()}>
              <span>{api.selectedItems.map((i) => i.label).join(", ") || "Select option"}</span>
              {/* <span {...api.getIndicatorProps()}>▼</span> */}
            </button>
            {/* <button {...api.getClearTriggerProps()}>X</button> */}
          </div>

          {/* UI select */}
          <Portal>
            <div {...api.getPositionerProps()}>
              <ul {...api.getContentProps()}>
                <TreeNode node={collection.rootNode} api={api} indexPath={[]} />
              </ul>
            </div>
          </Portal>
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} omit={["collection"]} />
      </Toolbar>
    </>
  )
}
