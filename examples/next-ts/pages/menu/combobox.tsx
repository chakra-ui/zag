import * as combobox from "@zag-js/combobox"
import { createFilter } from "@zag-js/i18n-utils"
import * as menu from "@zag-js/menu"
import { Portal, normalizeProps, useMachine } from "@zag-js/react"
import { comboboxData } from "@zag-js/shared"
import { useId, useMemo, useState } from "react"

const { contains } = createFilter({ sensitivity: "base" })

function Combobox(props: Omit<combobox.Props, "id" | "collection">) {
  const [inputValue, setInputValue] = useState("")

  const items = useMemo(() => {
    return comboboxData.filter((item) => contains(item.label, inputValue) || contains(item.code, inputValue))
  }, [inputValue])

  const collection = useMemo(
    () =>
      combobox.collection({
        items,
        itemToValue: (item) => item.code,
        itemToString: (item) => item.label,
      }),
    [items],
  )

  const comboService = useMachine(combobox.machine, {
    id: useId(),
    disableLayer: true,
    open: true,
    placeholder: "Search items...",
    inputBehavior: "autohighlight",
    selectionBehavior: "clear",
    onInputValueChange(details) {
      setInputValue(details.inputValue)
    },
    collection,
    ...props,
  })

  const comboApi = combobox.connect(comboService, normalizeProps)

  return (
    <div {...comboApi.getRootProps()} style={{ width: "100%" }}>
      <input {...comboApi.getInputProps()} style={{ marginBottom: "12px" }} />
      <div {...comboApi.getContentProps()} style={{ minHeight: "120px" }}>
        <div {...comboApi.getListProps()}>
          {items.length === 0 && <div>No results found</div>}
          {items.map((item) => (
            <div key={item.label} {...comboApi.getItemProps({ item, persistFocus: true })}>
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Page() {
  const menuService = useMachine(menu.machine, {
    id: useId(),
    composite: false,
  })

  const menuApi = menu.connect(menuService, normalizeProps)

  const onValueChange = ({ items }: combobox.ValueChangeDetails) => {
    console.log(JSON.stringify(items[0].label))
    menuApi.setOpen(false)
  }

  return (
    <main>
      <div>
        <button {...menuApi.getTriggerProps()}>Actions ▾</button>
        {menuApi.open && (
          <Portal>
            <div {...menuApi.getPositionerProps()}>
              <ul {...menuApi.getContentProps()}>
                <Combobox onValueChange={onValueChange} />
              </ul>
            </div>
          </Portal>
        )}
      </div>
    </main>
  )
}
