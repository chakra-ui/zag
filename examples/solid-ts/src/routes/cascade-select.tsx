import * as cascadeSelect from "@zag-js/cascade-select"
import { cascadeSelectControls, cascadeSelectData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { Index, createMemo, createUniqueId, type JSX } from "solid-js"
import { Portal } from "solid-js/web"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"

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

function TreeNode(props: TreeNodeProps): JSX.Element {
  const indexPath = () => props.indexPath ?? []
  const value = () => props.value ?? []

  const nodeProps = () => ({ indexPath: indexPath(), value: value(), item: props.node })
  const nodeState = () => props.api.getItemState(nodeProps())
  const children = () => collection.getNodeChildren(props.node)

  return (
    <>
      <ul {...props.api.getListProps(nodeProps())}>
        <Index each={children()}>
          {(item, index) => {
            const itemProps = () => ({
              indexPath: [...indexPath(), index],
              value: [...value(), collection.getNodeValue(item())],
              item: item(),
            })

            const itemState = () => props.api.getItemState(itemProps())

            return (
              <li {...props.api.getItemProps(itemProps())}>
                <span {...props.api.getItemTextProps(itemProps())}>{item().label}</span>
                <span {...props.api.getItemIndicatorProps(itemProps())}>✓</span>
                {itemState().hasChildren && <span>{">"}</span>}
              </li>
            )
          }}
        </Index>
      </ul>
      {nodeState().highlightedChild && collection.isBranchNode(nodeState().highlightedChild!) && (
        <TreeNode
          node={nodeState().highlightedChild!}
          api={props.api}
          indexPath={[...indexPath(), nodeState().highlightedIndex]}
          value={[...value(), collection.getNodeValue(nodeState().highlightedChild!)]}
        />
      )}
    </>
  )
}

export default function Page() {
  const controls = useControls(cascadeSelectControls)

  const service = useMachine(
    cascadeSelect.machine,
    controls.mergeProps<cascadeSelect.Props>(() => ({
      id: createUniqueId(),
      collection,
      name: "location",
    })),
  )

  const api = createMemo(() => cascadeSelect.connect(service, normalizeProps))

  return (
    <>
      <main class="cascade-select">
        <div {...api().getRootProps()}>
          <label {...api().getLabelProps()}>Select a location</label>

          {/* control */}
          <div {...api().getControlProps()}>
            <button {...api().getTriggerProps()}>
              <span>{api().valueAsString || "Select a location"}</span>
              <span {...api().getIndicatorProps()}>▼</span>
            </button>
            <button {...api().getClearTriggerProps()}>X</button>
          </div>

          {/* Hidden input */}
          <input {...api().getHiddenInputProps()} />

          {/* UI select */}
          <Portal>
            <div {...api().getPositionerProps()}>
              <div {...api().getContentProps()}>
                <TreeNode node={collection.rootNode} api={api()} />
              </div>
            </div>
          </Portal>
        </div>

        <div style={{ "margin-top": "350px" }}>
          <h3>Highlighted Value:</h3>
          <pre>{JSON.stringify(api().highlightedValue, null, 2)}</pre>
        </div>
        <div style={{ "margin-top": "20px" }}>
          <h3>Selected Value:</h3>
          <pre>{JSON.stringify(api().value, null, 2)}</pre>
        </div>
      </main>

      <Toolbar controls={controls}>
        <StateVisualizer state={service} omit={["collection"]} />
      </Toolbar>
    </>
  )
}
