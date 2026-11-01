import * as dialog from "@zag-js/dialog"
import * as select from "@zag-js/select"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { ChevronsUpDownIcon } from "lucide-solid"
import { For, Show, createMemo, createUniqueId } from "solid-js"
import { Portal } from "solid-js/web"
import { Presence } from "~/components/presence"
import "@styles/select.css"
import "@styles/dialog.css"

const items = ["Apple", "Banana", "Cherry"]

function Select() {
  const service = useMachine(select.machine, {
    id: createUniqueId(),
    collection: select.collection({ items }),
  })
  const api = createMemo(() => select.connect(service, normalizeProps))

  return (
    <div {...api().getRootProps()}>
      <label {...api().getLabelProps()}>Fruit</label>
      <button {...api().getTriggerProps()} data-testid="select-trigger">
        <span>{api().valueAsString || "Select fruit"}</span>
        <span {...api().getIndicatorProps()}>
          <ChevronsUpDownIcon />
        </span>
      </button>
      <Portal>
        <Presence
          {...api().getPositionerProps()}
          hidden={!api().open}
          lazyMount
          unmountOnExit
          data-testid="select-positioner"
        >
          <div {...api().getContentProps()} hidden={false} data-testid="select-content">
            <div {...api().getListProps()} data-testid="select-list">
              <For each={items}>
                {(item) => (
                  <div {...api().getItemProps({ item })}>
                    <span {...api().getItemTextProps({ item })}>{item}</span>
                  </div>
                )}
              </For>
            </div>
          </div>
        </Presence>
      </Portal>
    </div>
  )
}

export default function Page() {
  const parentService = useMachine(dialog.machine, { id: createUniqueId() })
  const parent = createMemo(() => dialog.connect(parentService, normalizeProps))
  const childService = useMachine(dialog.machine, { id: createUniqueId() })
  const child = createMemo(() => dialog.connect(childService, normalizeProps))

  return (
    <main>
      <h1>Select in nested dialogs</h1>
      <button {...parent().getTriggerProps()} data-testid="parent-trigger">
        Open parent dialog
      </button>
      <Show when={parent().open}>
        <Portal>
          <div {...parent().getBackdropProps()} />
          <div {...parent().getPositionerProps()}>
            <div {...parent().getContentProps()} data-testid="parent-content">
              <h2 {...parent().getTitleProps()}>Parent dialog</h2>
              <p {...parent().getDescriptionProps()}>Open another dialog to choose a fruit.</p>
              <button {...child().getTriggerProps()} data-testid="child-trigger">
                Open child dialog
              </button>
              <Show when={child().open}>
                <Portal>
                  <div {...child().getBackdropProps()} />
                  <div {...child().getPositionerProps()}>
                    <div {...child().getContentProps()} data-testid="child-content">
                      <h2 {...child().getTitleProps()}>Child dialog</h2>
                      <p {...child().getDescriptionProps()}>The fruit list should appear above this dialog.</p>
                      <Select />
                    </div>
                  </div>
                </Portal>
              </Show>
            </div>
          </div>
        </Portal>
      </Show>
      <style>{`
        [data-dialog-content][data-testid="child-content"] {
          background: #fff4ce;
          min-height: 300px;
        }
        [data-testid="select-positioner"][data-state="closed"] {
          animation: nestedSelectExit 0.3s ease-out;
        }
        @keyframes nestedSelectExit {
          to {
            opacity: 0;
          }
        }
      `}</style>
    </main>
  )
}
