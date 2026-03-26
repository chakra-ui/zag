import styles from "../../../../../shared/src/css/cascade-select.module.css"
import * as cascadeSelect from "@zag-js/cascade-select"
import { normalizeProps, useMachine } from "@zag-js/preact"
import { cascadeSelectControls, cascadeSelectData } from "@zag-js/shared"
import { JSX, useId } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import { useControls } from "../../hooks/use-controls"

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
      <ul {...api.getListProps(nodeProps)} className={styles.List}>
        {children.map((item, index) => {
          const itemProps = {
            indexPath: [...indexPath, index],
            value: [...value, collection.getNodeValue(item)],
            item,
          }

          const itemState = api.getItemState(itemProps)

          return (
            <li key={item.label} {...api.getItemProps(itemProps)} className={styles.Item}>
              <span {...api.getItemTextProps(itemProps)} className={styles.ItemText}>{item.label}</span>
              <span {...api.getItemIndicatorProps(itemProps)}>✓</span>
              {itemState.hasChildren && <span>{">"}</span>}
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
    ...controls.context,
  })

  const api = cascadeSelect.connect(service, normalizeProps)

  return (
    <>
      <main className="cascade-select">
        <div {...api.getRootProps()}>
          <label {...api.getLabelProps()} className={styles.Label}>Select a location</label>

          {/* control */}
          <div {...api.getControlProps()} className={styles.Control}>
            <button {...api.getTriggerProps()} className={styles.Trigger}>
              <span {...api.getValueTextProps()}>{api.valueAsString || "Select a location"}</span>
              <span {...api.getIndicatorProps()}>▼</span>
            </button>
            <button {...api.getClearTriggerProps()} className={styles.ClearTrigger}>X</button>
          </div>

          {/* Hidden input */}
          <input {...api.getHiddenInputProps()} />

          {/* UI select */}
          <div {...api.getPositionerProps()} className={styles.Positioner}>
            <div {...api.getContentProps()} className={styles.Content}>
              <TreeNode node={collection.rootNode} api={api} />
            </div>
          </div>
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
