import * as combobox from "@zag-js/combobox"
import { createFilter } from "@zag-js/i18n-utils"
import * as menu from "@zag-js/menu"
import { comboboxData } from "@zag-js/shared"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/solid"
import { Index, Show, createMemo, createSignal, createUniqueId } from "solid-js"
import { Portal } from "solid-js/web"
import "@styles/menu.css"
import "@styles/combobox.css"

const { contains } = createFilter({ sensitivity: "base" })

function Combobox(props: Omit<combobox.Props, "id" | "collection">) {
  const [inputValue, setInputValue] = createSignal("")

  const items = createMemo(() =>
    comboboxData.filter((item) => contains(item.label, inputValue()) || contains(item.code, inputValue())),
  )

  const collection = createMemo(() =>
    combobox.collection({
      items: items(),
      itemToValue: (item) => item.code,
      itemToString: (item) => item.label,
    }),
  )

  const id = createUniqueId()

  const comboService = useMachine(combobox.machine, (): combobox.Props => ({
    id,
    disableLayer: true,
    open: true,
    placeholder: "Search items...",
    inputBehavior: "autohighlight",
    selectionBehavior: "clear",
    onInputValueChange(details) {
      setInputValue(details.inputValue)
    },
    collection: collection(),
    ...props,
  }))

  const comboApi = createMemo(() => combobox.connect(comboService, normalizeProps))

  return (
    <div {...mergeProps(() => comboApi().getRootProps(), { style: { width: "100%" } })}>
      <input {...mergeProps(() => comboApi().getInputProps(), { style: { "margin-bottom": "12px" } })} />
      <div {...mergeProps(() => comboApi().getContentProps(), { style: { "min-height": "120px" } })}>
        <div {...comboApi().getListProps()}>
          <Show when={items().length === 0}>
            <div>No results found</div>
          </Show>
          <Index each={items()}>
            {(item) => <div {...comboApi().getItemProps({ item: item(), persistFocus: true })}>{item().label}</div>}
          </Index>
        </div>
      </div>
    </div>
  )
}

export default function Page() {
  const menuService = useMachine(menu.machine, {
    id: createUniqueId(),
    popupType: "dialog",
  })

  const menuApi = createMemo(() => menu.connect(menuService, normalizeProps))

  const onValueChange = ({ items }: combobox.ValueChangeDetails) => {
    console.log(JSON.stringify(items[0].label))
    menuApi().setOpen(false)
  }

  return (
    <main>
      <div>
        <button {...menuApi().getTriggerProps()}>Actions ▾</button>
        <Show when={menuApi().open}>
          <Portal>
            <div {...menuApi().getPositionerProps()}>
              <ul {...menuApi().getContentProps()}>
                <Combobox onValueChange={onValueChange} />
              </ul>
            </div>
          </Portal>
        </Show>
      </div>
    </main>
  )
}
