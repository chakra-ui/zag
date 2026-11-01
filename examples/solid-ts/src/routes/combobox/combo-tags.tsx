import * as combobox from "@zag-js/combobox"
import { contains } from "@zag-js/dom-query"
import { createFilter } from "@zag-js/i18n-utils"
import { comboboxData } from "@zag-js/shared"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/solid"
import * as tagsInput from "@zag-js/tags-input"
import { For, Index, Show, createMemo, createSignal, createUniqueId } from "solid-js"
import "@styles/combobox.css"
import "@styles/tags-input.css"

const { contains: matchContains } = createFilter({ sensitivity: "base" })

export default function Page() {
  // id composition for tags input and combobox
  const ids = {
    root: createUniqueId(),
    input: createUniqueId(),
    control: createUniqueId(),
  }

  let contentRef: HTMLDivElement | undefined

  const [options, setOptions] = createSignal(comboboxData)
  const [value, setValue] = createSignal<string[]>([])

  const collection = createMemo(() =>
    combobox.collection({
      items: options(),
      itemToValue: (item) => item.code,
      itemToString: (item) => item.label,
    }),
  )

  const comboboxId = createUniqueId()

  const service = useMachine(combobox.machine, (): combobox.Props => ({
    id: comboboxId,
    collection: collection(),
    ids,
    allowCustomValue: true,
    multiple: true,
    selectionBehavior: "clear",
    value: value(),
    onOpenChange() {
      setOptions(comboboxData.filter((item) => !value().includes(item.code)))
    },
    onInputValueChange({ inputValue }) {
      const result = comboboxData.filter((item) => matchContains(item.label, inputValue))
      setOptions(result)
    },
    onValueChange(details) {
      // sync tags input value and options
      queueMicrotask(() => {
        setValue(details.value)
        setOptions((curr) => curr.filter((item) => !details.value.includes(item.code)))
        contentRef?.scrollTo(0, 0)
      })
    },
  }))

  const comboboxApi = createMemo(() => combobox.connect(service, normalizeProps))

  const tagsId = createUniqueId()

  const tagService = useMachine(tagsInput.machine, (): tagsInput.Props => ({
    id: tagsId,
    ids,
    editable: false,
    addOnPaste: false,
    onInteractOutside(event) {
      const { target } = event.detail.originalEvent
      if (contains(contentRef, target)) {
        event.preventDefault()
      }
    },
    inputValue: comboboxApi().inputValue,
    value: value(),
    onValueChange(details) {
      setValue(details.value)
    },
    onInputValueChange({ inputValue }) {
      comboboxApi().setInputValue(inputValue)
    },
  }))

  const tagApi = createMemo(() => tagsInput.connect(tagService, normalizeProps))

  return (
    <main class="combobox">
      <div
        {...mergeProps(
          () => comboboxApi().getRootProps(),
          () => tagApi().getRootProps(),
        )}
      >
        <label {...comboboxApi().getLabelProps()}>Select country</label>

        <div
          {...mergeProps(
            () => comboboxApi().getControlProps(),
            () => tagApi().getControlProps(),
          )}
        >
          <For each={tagApi().value}>
            {(value, index) => (
              <span {...tagApi().getItemProps({ index: index(), value })}>
                <div {...tagApi().getItemPreviewProps({ index: index(), value })}>
                  <span {...tagApi().getItemTextProps({ index: index(), value })}>{value} </span>
                  <button {...tagApi().getItemDeleteTriggerProps({ index: index(), value })}>&#x2715;</button>
                </div>
                <input {...tagApi().getItemInputProps({ index: index(), value })} />
              </span>
            )}
          </For>

          <input
            data-testid="input"
            placeholder="add tag"
            {...mergeProps(
              () => comboboxApi().getInputProps(),
              () => tagApi().getInputProps(),
              {
                onKeyDown(event: KeyboardEvent) {
                  // extra logic to add tag on Enter key
                  if (event.key === "Enter" && options().length === 0) {
                    tagApi().addValue(comboboxApi().inputValue)
                  }
                },
              },
            )}
          />
        </div>
      </div>

      <div {...comboboxApi().getPositionerProps()}>
        <div data-testid="combobox-content" {...comboboxApi().getContentProps()}>
          <Show when={options().length > 0}>
            <div {...comboboxApi().getListProps()} ref={contentRef}>
              <Index each={options()}>
                {(item) => (
                  <div data-testid={item().code} {...comboboxApi().getItemProps({ item: item() })}>
                    {item().label}
                  </div>
                )}
              </Index>
            </div>
          </Show>
        </div>
      </div>
    </main>
  )
}
