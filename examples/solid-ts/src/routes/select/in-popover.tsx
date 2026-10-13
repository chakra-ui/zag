import * as popover from "@zag-js/popover"
import * as select from "@zag-js/select"
import { selectData } from "@zag-js/shared"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/solid"
import { ChevronsUpDownIcon, XIcon } from "lucide-solid"
import { createMemo, createUniqueId, For, Show } from "solid-js"
import { Portal } from "solid-js/web"
import "@styles/select.css"
import "@styles/popover.css"

function Select() {
  const service = useMachine(select.machine, {
    collection: select.collection({ items: selectData }),
    id: createUniqueId(),
    name: "country",
  })

  const api = createMemo(() => select.connect(service, normalizeProps))

  return (
    <div {...api().getRootProps()}>
      <label {...api().getLabelProps()}>Label</label>
      <div {...api().getControlProps()}>
        <button
          {...mergeProps(api().getTriggerProps(), {
            "aria-controls": !api().open ? null : undefined,
          })}
        >
          <span>{api().valueAsString || "Select option"}</span>
        </button>
        <div class="select-indicator-group">
          <button {...api().getClearTriggerProps()}>
            <XIcon />
          </button>
          <span {...api().getIndicatorProps()}>
            <ChevronsUpDownIcon />
          </span>
        </div>
      </div>
      <Show when={api().open}>
        <Portal>
          <div {...api().getPositionerProps()}>
            <div {...api().getContentProps()}>
              <div {...api().getListProps()}>
                <For each={selectData}>
                  {(item) => (
                    <div {...api().getItemProps({ item })}>
                      <span {...api().getItemTextProps({ item })}>{item.label}</span>
                      <span {...api().getItemIndicatorProps({ item })}>✓</span>
                    </div>
                  )}
                </For>
              </div>
            </div>
          </div>
        </Portal>
      </Show>
    </div>
  )
}

export default function Page() {
  const service = useMachine(popover.machine, {
    id: createUniqueId(),
    modal: false,
  })
  const api = createMemo(() => popover.connect(service, normalizeProps))

  return (
    <div style={{ padding: "20px" }}>
      <button {...api().getTriggerProps()}>Open Popover</button>
      <Show when={api().open}>
        <Portal>
          <div {...api().getPositionerProps()}>
            <div {...api().getContentProps()}>
              <div {...api().getTitleProps()}>Select in Popover</div>
              <div>
                <Select />
              </div>
              <button {...api().getCloseTriggerProps()}>
                <XIcon />
              </button>
            </div>
          </div>
        </Portal>
      </Show>
    </div>
  )
}
