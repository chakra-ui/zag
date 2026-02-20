import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import { cascadeSelectControls, cascadeSelectData } from "@zag-js/shared"
import * as cascadeSelect from "@zag-js/cascade-select"
import { ChevronRightIcon, XIcon } from "lucide-react"
import serialize from "form-serialize"
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
  value?: string[]
  api: cascadeSelect.Api
}

const TreeNode = (props: TreeNodeProps): JSX.Element => {
  const { node, indexPath = [], value = [], api } = props

  const nodeProps = { indexPath, value, item: node }
  const nodeState = api.getItemState(nodeProps)
  const children = collection.getNodeChildren(node)

  return (
    <>
      <ul {...api.getListProps(nodeProps)}>
        {children.map((item, index) => {
          const itemProps = {
            indexPath: [...indexPath, index],
            value: [...value, collection.getNodeValue(item)],
            item,
          }

          const itemState = api.getItemState(itemProps)

          return (
            <li key={item.label} {...api.getItemProps(itemProps)}>
              <span {...api.getItemTextProps(itemProps)}>{item.label}</span>
              <span {...api.getItemIndicatorProps(itemProps)}>✓</span>
              {itemState.hasChildren && (
                <span>
                  <ChevronRightIcon size={16} />
                </span>
              )}
            </li>
          )
        })}
      </ul>
      {nodeState.highlightedChild && collection.isBranchNode(nodeState.highlightedChild) && (
        <TreeNode
          node={nodeState.highlightedChild}
          api={api}
          indexPath={[...indexPath, nodeState.highlightedIndex]}
          value={[...value, collection.getNodeValue(nodeState.highlightedChild)]}
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
    name: "location",
    // value: [["asia", "india", "haryana:HR"]],
    // highlightedValue: ["asia", "india", "haryana:HR"],
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

          {/* control */}
          <div {...api.getControlProps()}>
            <button {...api.getTriggerProps()}>
              <span {...api.getValueTextProps()}>{api.valueAsString || "Select a location"}</span>
              <span {...api.getIndicatorProps()}>▼</span>
            </button>
            <button {...api.getClearTriggerProps()}>
              <XIcon size={16} />
            </button>
          </div>

          <form
            onChange={(e) => {
              const formData = serialize(e.currentTarget, { hash: true })
              console.log(formData)
            }}
          >
            {/* Hidden input */}
            <input {...api.getHiddenInputProps()} />
          </form>

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
          <h3>Highlighted Value:</h3>
          <pre>{JSON.stringify(api.highlightedValue, null, 2)}</pre>
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
