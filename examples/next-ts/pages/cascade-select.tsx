import { normalizeProps, useMachine } from "@zag-js/react"
import { cascadeSelectControls, cascadeSelectData } from "@zag-js/shared"
import * as cascadeSelect from "@zag-js/cascade-select"
import { ChevronDownIcon, ChevronRightIcon, XIcon } from "lucide-react"
import { useId } from "react"
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
  const separator = service.prop("separator")

  const renderLevel = (level: number) => {
    const levelValues = api.getLevelValues(level)
    if (levelValues.length === 0) return null

    return (
      <div key={level} {...api.getLevelProps({ level })}>
        {levelValues.map((value) => {
          const node = collection.findNode(value)
          if (!node) return null

          const itemState = api.getItemState({ item: node })

          return (
            <div key={value} {...api.getItemProps({ item: node })}>
              <span {...api.getItemTextProps({ item: node })}>{node.label}</span>
              {itemState.hasChildren && (
                <span {...api.getItemIndicatorProps({ item: node })}>
                  <ChevronRightIcon size={16} />
                </span>
              )}
            </div>
          )
        })}
      </div>
    )
  }

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

          <select {...api.getHiddenSelectProps()}>
            {api.value.map((path, index) => (
              <option key={index} value={path.join(separator)}>
                {path.map((value) => collection.findNode(value)?.label || value).join(separator)}
              </option>
            ))}
          </select>

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
