import * as cascadeSelect from "@zag-js/cascade-select"
import { cascadeSelectData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { For, createMemo, createSignal, createUniqueId, Show } from "solid-js"
import type { JSX } from "@solidjs/web"
import { Portal } from "@solidjs/web"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import "@styles/cascade-select.css"
import { ChevronsUpDownIcon } from "lucide-solid"

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
        <For keyed={false} each={children()}>
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
        </For>
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
  const id = createUniqueId()
  const [value, setValue] = createSignal<string[][]>([])
  const [submitted, setSubmitted] = createSignal(false)
  const [output, setOutput] = createSignal("")

  const invalid = () => submitted() && value().length === 0

  const service = useMachine(cascadeSelect.machine, () => ({
    id,
    collection,
    name: "region",
    required: true,
    invalid: invalid(),
    onValueChange: (details) => setValue(details.value),
  }))
  const api = createMemo(() => cascadeSelect.connect(service, normalizeProps))

  return (
    <>
      <main>
        <div class="cascade-select-form">
          <p class="hint">Pick a delivery region down to the state, then save. The form gets the full path.</p>
          <form
            novalidate
            onSubmit={(event) => {
              event.preventDefault()
              setSubmitted(true)
              if (value().length === 0) return
              const data = new FormData(event.currentTarget)
              setOutput([...data.entries()].map(([key, entry]) => `${key}=${entry}`).join("\n"))
            }}
            onReset={() => {
              api().clearValue()
              setSubmitted(false)
              setOutput("")
            }}
          >
            <div {...api().getRootProps()}>
              <label {...api().getLabelProps()}>Delivery region</label>
              <div {...api().getControlProps()}>
                <button {...api().getTriggerProps()}>
                  <span {...api().getValueTextProps()}>{api().valueAsString || "Select a region"}</span>
                </button>
                <span {...api().getIndicatorProps()}>
                  <ChevronsUpDownIcon />
                </span>
              </div>
              <input {...api().getHiddenInputProps()} />
              <Portal>
                <div {...api().getPositionerProps()}>
                  <div {...api().getContentProps()}>
                    <TreeNode node={collection.rootNode} api={api()} />
                  </div>
                </div>
              </Portal>
            </div>
            <Show when={invalid()}>
              <p class="error">Choose a delivery region</p>
            </Show>
            <div class="actions">
              <button type="submit">Save address</button>
              <button type="reset">Clear form</button>
            </div>
          </form>
          <Show when={output()}>
            <pre data-testid="form-output">{output()}</pre>
          </Show>
        </div>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} omit={["collection"]} />
      </Toolbar>
    </>
  )
}
