import * as combobox from "@zag-js/combobox"
import { comboboxData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { For, createMemo, createUniqueId } from "solid-js"

export default function Page() {
  const collection = combobox.collection({
    items: comboboxData,
    itemToValue: (item) => item.code,
    itemToString: (item) => item.label,
  })

  const service = useMachine(combobox.machine, {
    id: createUniqueId(),
    collection,
    open: true,
    disableLayer: true,
    defaultHighlightedValue: comboboxData[0].code,
  })

  const api = createMemo(() => combobox.connect(service, normalizeProps))

  return (
    <>
      <style>{`html, body, .page, .page main { height: auto !important; overflow: visible !important; }`}</style>
      <main class="combobox">
        <div data-testid="spacer" style={{ height: "150vh" }} />
        <div {...api().getRootProps()}>
          <div {...api().getControlProps()}>
            <input data-testid="input" {...api().getInputProps()} />
          </div>
          <ul
            data-testid="combobox-content"
            {...api().getContentProps()}
            style={{ "max-height": "12rem", overflow: "auto" }}
          >
            <For each={comboboxData}>
              {(item) => (
                <li data-testid={item.code} {...api().getItemProps({ item })}>
                  <span>{item.label}</span>
                </li>
              )}
            </For>
          </ul>
        </div>
      </main>
    </>
  )
}
