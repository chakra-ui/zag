import * as dialog from "@zag-js/dialog"
import * as select from "@zag-js/select"
import { selectData } from "@zag-js/shared"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/solid"
import { ChevronsUpDownIcon, XIcon } from "lucide-solid"
import { createMemo, createUniqueId, For, Show } from "solid-js"
import { Portal } from "solid-js/web"
import "@styles/select.css"
import "@styles/dialog.css"

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
  const service = useMachine(dialog.machine, { id: createUniqueId() })
  const api = createMemo(() => dialog.connect(service, normalizeProps))
  return (
    <div style={{ padding: "20px" }}>
      <button {...api().getTriggerProps()} data-testid="trigger-1">
        Open Dialog
      </button>
      <Show when={api().open}>
        <Portal>
          <div {...api().getBackdropProps()} />
          <div data-testid="positioner-1" {...api().getPositionerProps()}>
            <div {...api().getContentProps()}>
              <h2 {...api().getTitleProps()}>Edit profile</h2>
              <p {...api().getDescriptionProps()}>Make changes to your profile here. Click save when you are done.</p>
              <Select />
            </div>
          </div>
        </Portal>
      </Show>
    </div>
  )
}
