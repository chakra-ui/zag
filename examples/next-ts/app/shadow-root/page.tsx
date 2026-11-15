"use client"

import * as combobox from "@zag-js/combobox"
import * as dialog from "@zag-js/dialog"
import * as menu from "@zag-js/menu"
import * as select from "@zag-js/select"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import { comboboxData, selectData } from "@zag-js/shared"
import { createContext, useContext, useEffect, useId, useMemo, useState } from "react"
import { createPortal } from "react-dom"

const RootContext = createContext<ShadowRoot | null>(null)

function useRoot() {
  const root = useContext(RootContext)!
  return { getRootNode: () => root, container: { current: root as unknown as HTMLElement } }
}

function Dialog() {
  const { getRootNode, container } = useRoot()
  const service = useMachine(dialog.machine, { id: useId(), getRootNode })
  const api = dialog.connect(service, normalizeProps)
  return (
    <>
      <button {...api.getTriggerProps()}>Open dialog</button>
      {api.open && (
        <Portal container={container} getRootNode={getRootNode}>
          <div {...api.getBackdropProps()} />
          <div {...api.getPositionerProps()}>
            <div {...api.getContentProps()}>
              <h2 {...api.getTitleProps()}>Edit profile</h2>
              <input placeholder="Name" />
              <button {...api.getCloseTriggerProps()}>Close</button>
            </div>
          </div>
        </Portal>
      )}
    </>
  )
}

function Menu() {
  const { getRootNode, container } = useRoot()
  const service = useMachine(menu.machine, { id: useId(), getRootNode })
  const api = menu.connect(service, normalizeProps)
  return (
    <>
      <button {...api.getTriggerProps()}>Actions</button>
      <Portal container={container} getRootNode={getRootNode}>
        <div {...api.getPositionerProps()}>
          <ul {...api.getContentProps()}>
            {["Edit", "Duplicate", "Delete"].map((value) => (
              <li key={value} {...api.getItemProps({ value })}>
                {value}
              </li>
            ))}
          </ul>
        </div>
      </Portal>
    </>
  )
}

function Select() {
  const { getRootNode, container } = useRoot()
  const collection = useMemo(() => select.collection({ items: selectData.slice(0, 8) }), [])
  const service = useMachine(select.machine, { id: useId(), getRootNode, collection, name: "country" })
  const api = select.connect(service, normalizeProps)
  return (
    <div {...api.getRootProps()}>
      <label {...api.getLabelProps()}>Country</label>
      <button {...api.getTriggerProps()}>{api.valueAsString || "Select"}</button>
      <select {...api.getHiddenSelectProps()}>
        {collection.items.map((item) => (
          <option key={item.value} value={item.value} />
        ))}
      </select>
      <Portal container={container} getRootNode={getRootNode}>
        <div {...api.getPositionerProps()}>
          <div {...api.getContentProps()}>
            <ul {...api.getListProps()}>
              {collection.items.map((item) => (
                <li key={item.value} {...api.getItemProps({ item })}>
                  {item.label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Portal>
    </div>
  )
}

function Combobox() {
  const { getRootNode, container } = useRoot()
  const [items, setItems] = useState(comboboxData)
  const collection = useMemo(
    () => combobox.collection({ items, itemToValue: (i) => i.code, itemToString: (i) => i.label }),
    [items],
  )
  const service = useMachine(combobox.machine, {
    id: useId(),
    getRootNode,
    collection,
    onInputValueChange({ inputValue }) {
      setItems(comboboxData.filter((i) => i.label.toLowerCase().includes(inputValue.toLowerCase())))
    },
  })
  const api = combobox.connect(service, normalizeProps)
  return (
    <div {...api.getRootProps()}>
      <label {...api.getLabelProps()}>Fruit</label>
      <div {...api.getControlProps()}>
        <input {...api.getInputProps()} />
        <button {...api.getTriggerProps()}>▼</button>
      </div>
      <Portal container={container} getRootNode={getRootNode}>
        <div {...api.getPositionerProps()}>
          <div {...api.getContentProps()}>
            <ul {...api.getListProps()}>
              {items.map((item) => (
                <li key={item.code} {...api.getItemProps({ item })}>
                  {item.label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Portal>
    </div>
  )
}

const styles = `
  :host { display: block; padding: 16px; border: 1px dashed gray; }
  .row { display: flex; gap: 24px; align-items: flex-start; }
  [hidden] { display: none !important; }
  [data-highlighted] { background: lightblue; }
  [data-dialog-backdrop] { position: fixed; inset: 0; background: rgb(0 0 0 / 0.3); }
  [data-dialog-positioner] { position: fixed; inset: 0; display: grid; place-items: center; }
  [data-dialog-content] { background: white; padding: 16px; }
  [data-menu-content], [data-select-content], [data-combobox-content] { background: white; border: 1px solid gray; list-style: none; padding: 4px; margin: 0; }
  ul { list-style: none; margin: 0; padding: 0; }
`

function ShadowHost({ children }: { children: React.ReactNode }) {
  const [host, setHost] = useState<HTMLDivElement | null>(null)
  const [root, setRoot] = useState<ShadowRoot | null>(null)
  useEffect(() => {
    if (host && !root) setRoot(host.shadowRoot ?? host.attachShadow({ mode: "open" }))
  }, [host, root])
  return (
    <div ref={setHost} data-testid="shadow-host">
      {root &&
        createPortal(
          <RootContext.Provider value={root}>
            <style>{styles}</style>
            {children}
          </RootContext.Provider>,
          root,
        )}
    </div>
  )
}

export default function Page() {
  return (
    <main>
      <p>Outside the shadow root</p>
      <button>Outside button</button>
      <ShadowHost>
        <p data-testid="shadow-sibling">Inside the shadow root</p>
        <button>Shadow button</button>
        <div className="row">
          <Dialog />
          <Menu />
          <Select />
          <Combobox />
        </div>
      </ShadowHost>
    </main>
  )
}
