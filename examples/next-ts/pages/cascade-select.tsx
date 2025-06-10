import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import { cascadeSelectControls, cascadeSelectData } from "@zag-js/shared"
import * as cascadeSelect from "@zag-js/cascade-select"
import { ChevronDownIcon, ChevronRightIcon, XIcon } from "lucide-react"
import { JSX, useId } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

interface Node {
  label: string
  value: string
  continents?: Node[]
  countries?: Node[]
  code?: string
  states?: Node[]
}

const collection = cascadeSelect.collection<Node>({
  nodeToValue: (node) => node.value,
  nodeToString: (node) => node.label,
  nodeToChildren: (node) => node.continents ?? node.countries ?? node.states,
  rootNode: cascadeSelectData,
})

interface TreeNodeProps {
  node: Node
  indexPath?: number[]
  valuePath?: string[]
  api: cascadeSelect.Api
}

const TreeNode = (props: TreeNodeProps): JSX.Element => {
  const { node, indexPath = [], valuePath = [], api } = props

  const nodeProps = { indexPath, valuePath, item: node }
  const nodeState = api.getItemState(nodeProps)
  const children = collection.getNodeChildren(node)
  //
  const highlightedIndex = api.highlightedIndexPath?.[nodeState.depth]
  const highlightedNode = children[highlightedIndex]

  return (
    <>
      <div {...api.getListProps(nodeProps)}>
        {children.map((item, index) => {
          const itemProps = {
            indexPath: [...indexPath, index],
            valuePath: [...valuePath, collection.getNodeValue(item)],
            item,
          }

          const itemState = api.getItemState(itemProps)

          return (
            <div key={item.label} {...api.getItemProps(itemProps)}>
              <span {...api.getItemTextProps(itemProps)}>{item.label}</span>
              {itemState.hasChildren && (
                <span {...api.getItemIndicatorProps(itemProps)}>
                  <ChevronRightIcon size={16} />
                </span>
              )}
            </div>
          )
        })}
      </div>
      {highlightedNode && collection.isBranchNode(highlightedNode) && (
        <TreeNode
          node={highlightedNode}
          api={api}
          indexPath={[...indexPath, highlightedIndex]}
          valuePath={[...valuePath, collection.getNodeValue(highlightedNode)]}
        />
      )}
    </>
  )
}

export default function Page() {
  const controls = useControls(cascadeSelectControls)

  const service = useMachine(cascadeSelect.machine, {
    id: useId(),
    collection,
    placeholder: "Select a location",
    onHighlightChange(details) {
      console.log("onHighlightChange", details)
    },
    onValueChange(details) {
      console.log("onChange", details)
    },
    onOpenChange(details) {
      console.log("onOpenChange", details)
    },
    ...controls.context,
  })

  const api = cascadeSelect.connect(service, normalizeProps)

  return (
    <>
      <main className="cascade-select">
        <div {...api.getRootProps()}>
          <label {...api.getLabelProps()}>Select a location</label>

          <div {...api.getControlProps()}>
            <button {...api.getTriggerProps()}>
              <span {...api.getValueTextProps()}>{api.valueText}</span>
              <span {...api.getIndicatorProps()}>
                <ChevronDownIcon size={16} />
              </span>
            </button>

            {api.value.length > 0 && (
              <button {...api.getClearTriggerProps()}>
                <XIcon size={16} />
              </button>
            )}
          </div>

          <input {...api.getHiddenInputProps()} />

          {/* UI select */}
          <Portal>
            <div {...api.getPositionerProps()}>
              <div {...api.getContentProps()}>
                <TreeNode node={collection.rootNode} api={api} />
              </div>
            </div>
          </Portal>
        </div>

        <div style={{ marginTop: "350px" }}>
          <h3>Highlighted Path:</h3>
          <pre>{JSON.stringify(api.highlightedIndexPath, null, 2)}</pre>
        </div>
        <div style={{ marginTop: "20px" }}>
          <h3>Selected Value:</h3>
          <pre>{JSON.stringify(api.value, null, 2)}</pre>
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} omit={["collection"]} />
      </Toolbar>
    </>
  )
}
