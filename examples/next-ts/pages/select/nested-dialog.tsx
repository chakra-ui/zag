import * as dialog from "@zag-js/dialog"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import * as select from "@zag-js/select"
import { useId } from "react"
import { Presence } from "../../components/presence"

const items = ["Apple", "Banana", "Cherry"]

function Select() {
  const service = useMachine(select.machine, {
    id: useId(),
    collection: select.collection({ items }),
  })
  const api = select.connect(service, normalizeProps)

  return (
    <div {...api.getRootProps()}>
      <label {...api.getLabelProps()}>Fruit</label>
      <button {...api.getTriggerProps()} data-testid="select-trigger">
        {api.valueAsString || "Select fruit"}
      </button>
      <Portal>
        <Presence
          {...api.getPositionerProps()}
          hidden={!api.open}
          lazyMount
          unmountOnExit
          data-testid="select-positioner"
        >
          <div {...api.getContentProps()} hidden={false} data-testid="select-content">
            {items.map((item) => (
              <div key={item} {...api.getItemProps({ item })}>
                <span {...api.getItemTextProps({ item })}>{item}</span>
              </div>
            ))}
          </div>
        </Presence>
      </Portal>
    </div>
  )
}

export default function Page() {
  const parentService = useMachine(dialog.machine, { id: useId() })
  const parent = dialog.connect(parentService, normalizeProps)
  const childService = useMachine(dialog.machine, { id: useId() })
  const child = dialog.connect(childService, normalizeProps)

  return (
    <main>
      <h1>Select in nested dialogs</h1>
      <button {...parent.getTriggerProps()} data-testid="parent-trigger">
        Open parent dialog
      </button>
      {parent.open && (
        <Portal>
          <div {...parent.getBackdropProps()} />
          <div {...parent.getPositionerProps()}>
            <div {...parent.getContentProps()} data-testid="parent-content">
              <h2 {...parent.getTitleProps()}>Parent dialog</h2>
              <p {...parent.getDescriptionProps()}>Open another dialog to choose a fruit.</p>
              <button {...child.getTriggerProps()} data-testid="child-trigger">
                Open child dialog
              </button>
              {child.open && (
                <Portal>
                  <div {...child.getBackdropProps()} />
                  <div {...child.getPositionerProps()}>
                    <div {...child.getContentProps()} data-testid="child-content">
                      <h2 {...child.getTitleProps()}>Child dialog</h2>
                      <p {...child.getDescriptionProps()}>The fruit list should appear above this dialog.</p>
                      <Select />
                    </div>
                  </div>
                </Portal>
              )}
            </div>
          </div>
        </Portal>
      )}
      <style jsx global>{`
        [data-scope="dialog"][data-part="content"],
        [data-scope="dialog"][data-part="positioner"],
        [data-scope="dialog"][data-part="backdrop"],
        [data-scope="select"][data-part="content"] {
          z-index: calc(1300 + var(--layer-index, 0));
        }
        [data-scope="dialog"][data-testid="child-content"] {
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
