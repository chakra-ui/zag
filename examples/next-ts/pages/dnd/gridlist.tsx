import { mergeProps, normalizeProps, useMachine } from "@zag-js/react"
import * as gridlist from "@zag-js/gridlist"
import * as dnd from "@zag-js/dnd"
import { gridListData } from "@zag-js/shared"
import { GripVerticalIcon } from "lucide-react"
import { useId, useMemo, useState } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"

interface Mailbox {
  id: string
  name: string
  description: string
  badge: string
}

export default function Page() {
  const [items, setItems] = useState<Mailbox[]>(gridListData)
  const itemMap = useMemo(() => new Map(items.map((i) => [i.id, i])), [items])

  const collection = gridlist.collection<Mailbox>({
    items,
    itemToValue: (item) => item.id,
    itemToString: (item) => item.name,
  })

  const gridService = useMachine(gridlist.machine as gridlist.Machine<Mailbox>, {
    id: useId(),
    collection,
    selectionMode: "multiple",
    selectionBehavior: "toggle",
  })
  const gridApi = gridlist.connect(gridService, normalizeProps)

  const dndService = useMachine(dnd.machine, {
    id: useId(),
    orientation: "vertical",
    getValueText: (value) => itemMap.get(value)?.name ?? value,
    onDrop(details) {
      setItems((prev) => dnd.reorder(prev, { ...details, itemToValue: (i) => i.id }))
    },
  })
  const dndApi = dnd.connect(dndService, normalizeProps)

  return (
    <>
      <main>
        <div className="gridlist">
          <div {...gridApi.getRootProps()}>
            <label {...gridApi.getLabelProps()}>Sortable Mailboxes</label>
            <div {...mergeProps(gridApi.getContentProps(), dndApi.getRootProps())}>
              {items.map((item) => (
                <div
                  key={item.id}
                  {...mergeProps(gridApi.getItemProps({ item }), dndApi.getDropTargetProps({ value: item.id }))}
                  style={{ position: "relative" }}
                >
                  <div {...dndApi.getDropIndicatorProps({ value: item.id, placement: "before" })} />

                  <div {...gridApi.getCellProps()}>
                    <span {...dndApi.getDragHandleProps({ value: item.id })}>
                      <GripVerticalIcon size={14} />
                    </span>
                    <div className="gridlist-item-body">
                      <span {...gridApi.getItemTextProps({ item })} className="gridlist-item-title">
                        {item.name}
                      </span>
                      <span className="gridlist-item-description">{item.description}</span>
                    </div>
                    <span className="gridlist-item-badge">{item.badge}</span>
                  </div>

                  <div {...dndApi.getDropIndicatorProps({ value: item.id, placement: "after" })} />
                </div>
              ))}
              <div {...gridApi.getEmptyProps()}>No items</div>
            </div>
          </div>

          <p style={{ marginTop: "12px", fontSize: "13px", color: "#52525b" }}>
            Selected: <strong>{gridApi.valueAsString || "none"}</strong>
          </p>
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={dndService} />
      </Toolbar>
    </>
  )
}
