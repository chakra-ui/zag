"use client"

import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import { cascadeSelectData } from "@zag-js/shared"
import * as cascadeSelect from "@zag-js/cascade-select"
import { ChevronRightIcon, ChevronsUpDownIcon } from "lucide-react"
import { JSX, useId, useState } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import "@styles/cascade-select.css"

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
  const [value, setValue] = useState<string[][]>([])
  const [submitted, setSubmitted] = useState(false)
  const [output, setOutput] = useState("")

  const invalid = submitted && value.length === 0

  const service = useMachine(cascadeSelect.machine, {
    id: useId(),
    collection,
    name: "region",
    required: true,
    invalid,
    onValueChange: (details) => setValue(details.value),
  })
  const api = cascadeSelect.connect(service, normalizeProps)

  return (
    <>
      <main>
        <div className="cascade-select-form">
          <p className="hint">Pick a delivery region down to the state, then save. The form gets the full path.</p>
          <form
            noValidate
            onSubmit={(event) => {
              event.preventDefault()
              setSubmitted(true)
              if (value.length === 0) return
              const data = new FormData(event.currentTarget)
              setOutput([...data.entries()].map(([key, entry]) => `${key}=${entry}`).join("\n"))
            }}
            onReset={() => {
              api.clearValue()
              setSubmitted(false)
              setOutput("")
            }}
          >
            <div {...api.getRootProps()}>
              <label {...api.getLabelProps()}>Delivery region</label>
              <div {...api.getControlProps()}>
                <button {...api.getTriggerProps()}>
                  <span {...api.getValueTextProps()}>{api.valueAsString || "Select a region"}</span>
                </button>
                <span {...api.getIndicatorProps()}>
                  <ChevronsUpDownIcon />
                </span>
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
            {invalid && <p className="error">Choose a delivery region</p>}
            <div className="actions">
              <button type="submit">Save address</button>
              <button type="reset">Clear form</button>
            </div>
          </form>
          {output && <pre data-testid="form-output">{output}</pre>}
        </div>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} omit={["collection"]} />
      </Toolbar>
    </>
  )
}
