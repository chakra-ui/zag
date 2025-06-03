import { normalizeProps, useMachine } from "@zag-js/react"
import { cascaderControls } from "@zag-js/shared"
import * as cascader from "@zag-js/cascader"
import { ChevronDownIcon, ChevronRightIcon, XIcon } from "lucide-react"
import { useId } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

interface Node {
  value: string
  label: string
  children?: Node[]
}

const collection = cascader.collection<Node>({
  nodeToValue: (node) => node.value,
  nodeToString: (node) => node.label,
  rootNode: {
    value: "ROOT",
    label: "",
    children: [
      {
        value: "fruits",
        label: "Fruits",
        children: [
          {
            value: "citrus",
            label: "Citrus",
            children: [
              { value: "orange", label: "Orange" },
              { value: "lemon", label: "Lemon" },
              { value: "lime", label: "Lime" },
            ],
          },
          {
            value: "berries",
            label: "Berries",
            children: [
              { value: "strawberry", label: "Strawberry" },
              { value: "blueberry", label: "Blueberry" },
              { value: "raspberry", label: "Raspberry" },
            ],
          },
          { value: "apple", label: "Apple" },
          { value: "banana", label: "Banana" },
        ],
      },
      {
        value: "vegetables",
        label: "Vegetables",
        children: [
          {
            value: "leafy",
            label: "Leafy Greens",
            children: [
              { value: "spinach", label: "Spinach" },
              { value: "lettuce", label: "Lettuce" },
              { value: "kale", label: "Kale" },
            ],
          },
          {
            value: "root",
            label: "Root Vegetables",
            children: [
              { value: "carrot", label: "Carrot" },
              { value: "potato", label: "Potato" },
              { value: "onion", label: "Onion" },
            ],
          },
          { value: "tomato", label: "Tomato" },
          { value: "cucumber", label: "Cucumber" },
        ],
      },
      {
        value: "grains",
        label: "Grains",
        children: [
          { value: "rice", label: "Rice" },
          { value: "wheat", label: "Wheat" },
          { value: "oats", label: "Oats" },
        ],
      },
    ],
  },
})

export default function Page() {
  const controls = useControls(cascaderControls)

  const service = useMachine(cascader.machine, {
    id: useId(),
    collection,
    placeholder: "Select food category",
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

  const api = cascader.connect(service, normalizeProps)

  const renderLevel = (level: number) => {
    const levelValues = api.getLevelValues(level)
    if (levelValues.length === 0) return null

    return (
      <div key={level} {...api.getLevelProps({ level })}>
        <div {...api.getLevelContentProps({ level })}>
          {levelValues.map((value) => {
            const itemState = api.getItemState({ value })
            const node = collection.findNode(value)

            return (
              <div key={value} {...api.getItemProps({ value })}>
                <span {...api.getItemTextProps({ value })}>{node?.label}</span>
                {itemState.hasChildren && (
                  <span {...api.getItemIndicatorProps({ value })}>
                    <ChevronRightIcon size={16} />
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <>
      <main className="cascader">
        <div {...api.getRootProps()}>
          <label {...api.getLabelProps()}>Food Categories</label>

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

          <div {...api.getPositionerProps()}>
            <div {...api.getContentProps()}>
              {Array.from({ length: api.getLevelDepth() }, (_, level) => renderLevel(level))}
            </div>
          </div>
        </div>

        <div style={{ marginTop: "20px" }}>
          <h3>Selected Value:</h3>
          <pre>{JSON.stringify(api.value, null, 2)}</pre>
        </div>

        <div style={{ marginTop: "20px" }}>
          <h3>Highlighted Path:</h3>
          <pre>{JSON.stringify(api.highlightedPath, null, 2)}</pre>
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} omit={["collection"]} />
      </Toolbar>
    </>
  )
}
