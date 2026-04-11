import * as gridlist from "@zag-js/gridlist"
import { normalizeProps, useMachine } from "@zag-js/react"
import { gridListControls, gridListData } from "@zag-js/shared"
import { CheckIcon } from "lucide-react"
import { useId, useState } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import { useControls } from "../../hooks/use-controls"

interface Mailbox {
  id: string
  name: string
  description: string
  badge: string
}

export default function Page() {
  const controls = useControls(gridListControls)
  const [lastAction, setLastAction] = useState<string | null>(null)

  const collection = gridlist.collection<Mailbox>({
    items: gridListData,
    itemToValue: (item) => item.id,
    itemToString: (item) => item.name,
  })

  const service = useMachine(gridlist.machine as gridlist.Machine<Mailbox>, {
    id: useId(),
    collection,
    onAction({ value }) {
      const item = gridListData.find((d) => d.id === value)
      setLastAction(item ? `Opened ${item.name}` : null)
    },
    ...controls.context,
  })

  const api = gridlist.connect(service, normalizeProps)

  return (
    <>
      <main>
        <div className="gridlist">
          <div {...api.getRootProps()}>
            <label {...api.getLabelProps()}>Mailboxes</label>
            <div {...api.getContentProps()}>
              {gridListData.map((item) => (
                <div key={item.id} {...api.getItemProps({ item, focusOnHover: true })}>
                  <div {...api.getCellProps()}>
                    {api.hasCheckbox && (
                      <button {...api.getItemCheckboxProps({ item })}>
                        <CheckIcon {...api.getItemIndicatorProps({ item })} />
                      </button>
                    )}
                    <div className="gridlist-item-body">
                      <span {...api.getItemTextProps({ item })} className="gridlist-item-title">
                        {item.name}
                      </span>
                      <span className="gridlist-item-description">{item.description}</span>
                    </div>
                    <span className="gridlist-item-badge">{item.badge}</span>
                    <div className="gridlist-actions">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setLastAction(`Edit ${item.name}`)
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setLastAction(`Delete ${item.name}`)
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <div {...api.getEmptyProps()}>No mailboxes</div>
            </div>
          </div>

          <p style={{ marginTop: "12px", fontSize: "13px", color: "#52525b" }}>
            Selected: <strong>{api.valueAsString || "none"}</strong>
            {lastAction ? ` · ${lastAction}` : null}
          </p>
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} context={["focusedValue", "value"]} />
      </Toolbar>
    </>
  )
}
