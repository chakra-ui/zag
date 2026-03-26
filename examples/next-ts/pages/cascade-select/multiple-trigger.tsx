import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import { cascadeSelectData } from "@zag-js/shared"
import * as cascadeSelect from "@zag-js/cascade-select"
import { ChevronRightIcon } from "lucide-react"
import { JSX, useId } from "react"

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

const triggers = [
  { value: "location-1", label: "Select Location 1" },
  { value: "location-2", label: "Select Location 2" },
  { value: "location-3", label: "Select Location 3" },
]

export default function Page() {
  const service = useMachine(cascadeSelect.machine, {
    id: useId(),
    collection,
    name: "location",
    onTriggerValueChange(details) {
      console.log("onTriggerValueChange", details)
    },
    onValueChange(details) {
      console.log("onChange", details)
    },
    onOpenChange(details) {
      console.log("onOpenChange", details)
    },
  })

  const api = cascadeSelect.connect(service, normalizeProps)

  return (
    <main className="cascade-select">
      <div {...api.getRootProps()}>
        <label {...api.getLabelProps()}>Select a location</label>

        <div style={{ display: "flex", gap: "16px", marginTop: "12px" }}>
          {triggers.map((trigger) => (
            <button key={trigger.value} {...api.getTriggerProps({ value: trigger.value })}>
              <span>{trigger.label}</span>
              <span>▼</span>
            </button>
          ))}
        </div>

        <input {...api.getHiddenInputProps()} />

        <Portal>
          <div {...api.getPositionerProps()}>
            <div {...api.getContentProps()}>
              <TreeNode node={collection.rootNode} api={api} />
            </div>
          </div>
        </Portal>
      </div>

      <div style={{ marginTop: "350px" }}>
        <h3>Trigger Value:</h3>
        <pre>{JSON.stringify(api.triggerValue, null, 2)}</pre>
      </div>
      <div style={{ marginTop: "20px" }}>
        <h3>Selected Value:</h3>
        <pre>{JSON.stringify(api.value, null, 2)}</pre>
      </div>
    </main>
  )
}
