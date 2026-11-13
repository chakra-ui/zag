import * as combobox from "@zag-js/combobox"
import { normalizeProps, useMachine } from "@zag-js/preact"
import { comboboxData } from "@zag-js/shared"
import { useId } from "react"
import "@styles/combobox.css"

export default function Page() {
  const collection = combobox.collection({
    items: comboboxData,
    itemToValue: (item) => item.code,
    itemToString: (item) => item.label,
  })

  const service = useMachine(combobox.machine, {
    id: useId(),
    collection,
    inline: true,
    defaultHighlightedValue: comboboxData[0]?.code,
  })

  const api = combobox.connect(service, normalizeProps)

  return (
    <>
      <style>{`
        html, body, .page, .page main {
          height: auto !important;
          overflow: visible !important;
        }
      `}</style>
      <main className="combobox">
        <div data-testid="spacer" style={{ height: "150vh" }} />
        <div {...api.getRootProps()}>
          <div {...api.getControlProps()}>
            <input data-testid="input" {...api.getInputProps()} />
          </div>
          <div data-testid="combobox-content" {...api.getContentProps()}>
            <ul {...api.getListProps()} style={{ maxHeight: "12rem", overflow: "auto" }}>
              {comboboxData.map((item) => (
                <li data-testid={item.code} key={item.code} {...api.getItemProps({ item })}>
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </>
  )
}
