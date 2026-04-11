import * as gridlist from "@zag-js/gridlist"
import { gridListControls, gridListData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { CheckIcon } from "lucide-solid"
import { createMemo, createSignal, createUniqueId, For, Show } from "solid-js"
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
  const [lastAction, setLastAction] = createSignal<string | null>(null)

  const collection = gridlist.collection<Mailbox>({
    items: gridListData,
    itemToValue: (item) => item.id,
    itemToString: (item) => item.name,
  })

  const service = useMachine(
    gridlist.machine as gridlist.Machine<Mailbox>,
    controls.mergeProps({
      id: createUniqueId(),
      collection,
      onAction({ value }: { value: string }) {
        const item = gridListData.find((d) => d.id === value)
        setLastAction(item ? `Opened ${item.name}` : null)
      },
    }),
  )

  const api = createMemo(() => gridlist.connect(service, normalizeProps))

  return (
    <>
      <main>
        <div class="gridlist">
          <div {...api().getRootProps()}>
            <label {...api().getLabelProps()}>Mailboxes</label>
            <div {...api().getContentProps()}>
              <For each={gridListData}>
                {(item) => (
                  <div {...api().getItemProps({ item, focusOnHover: true })}>
                    <div {...api().getCellProps()}>
                      <Show when={api().hasCheckbox}>
                        <button {...api().getItemCheckboxProps({ item })}>
                          <CheckIcon {...api().getItemIndicatorProps({ item })} />
                        </button>
                      </Show>
                      <div class="gridlist-item-body">
                        <span {...api().getItemTextProps({ item })} class="gridlist-item-title">
                          {item.name}
                        </span>
                        <span class="gridlist-item-description">{item.description}</span>
                      </div>
                      <span class="gridlist-item-badge">{item.badge}</span>
                    </div>
                  </div>
                )}
              </For>
              <div {...api().getEmptyProps()}>No mailboxes</div>
            </div>
          </div>

          <p style={{ "margin-top": "12px", "font-size": "13px", color: "#52525b" }}>
            Selected: <strong>{api().valueAsString || "none"}</strong>
            {lastAction() ? ` · ${lastAction()}` : null}
          </p>
        </div>
      </main>

      <Toolbar controls={controls}>
        <StateVisualizer state={service} context={["focusedValue", "value"]} />
      </Toolbar>
    </>
  )
}
