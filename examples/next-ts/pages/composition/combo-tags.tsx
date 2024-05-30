import * as combobox from "@zag-js/combobox"
import { contains } from "@zag-js/dom-query"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/react"
import { comboboxData } from "@zag-js/shared"
import * as tagsInput from "@zag-js/tags-input"
import { matchSorter } from "match-sorter"
import { useId, useRef, useState } from "react"

export default function Page() {
  // id composition for tags input and combobox
  const ids = {
    root: useId(),
    input: useId(),
    control: useId(),
  }

  const contentRef = useRef<HTMLDivElement>(null)

  /* -----------------------------------------------------------------------------
   * Combobox
   * -----------------------------------------------------------------------------*/

  const [options, setOptions] = useState(comboboxData)
  const [value, setValue] = useState([])

  const collection = combobox.collection({
    items: options,
    itemToValue: (item) => item.code,
    itemToString: (item) => item.label,
  })

  const [state, send] = useMachine(
    combobox.machine({
      id: useId(),
      collection,
      ids: ids,
      allowCustomValue: true,
      multiple: true,
      selectionBehavior: "clear",
    }),
    {
      context: {
        collection,
        value,
        onOpenChange() {
          setOptions(comboboxData.filter((item) => !value.includes(item.code)))
        },
        onInputValueChange({ inputValue }) {
          const result = matchSorter(comboboxData, inputValue, {
            keys: ["label"],
            baseSort: (a, b) => (a.index < b.index ? -1 : 1),
          })
          setOptions(result)
        },
        onValueChange(details) {
          // sync tags input value and options
          queueMicrotask(() => {
            setValue(details.value)
            setOptions((curr) => curr.filter((item) => !details.value.includes(item.code)))
            contentRef.current?.scrollTo(0, 0)
          })
        },
      },
    },
  )

  const api = combobox.connect(state, send, normalizeProps)

  /* -----------------------------------------------------------------------------
   * Tags Input
   * -----------------------------------------------------------------------------*/

  const [tagState, tagSend] = useMachine(
    tagsInput.machine({
      id: useId(),
      ids: ids,
      editable: false,
      addOnPaste: false,
      onInteractOutside(event) {
        const { target } = event.detail.originalEvent
        if (contains(contentRef.current, target)) {
          event.preventDefault()
        }
      },
    }),
    {
      context: {
        inputValue: state.context.inputValue,
        value: value,
        onValueChange(details) {
          setValue(details.value)
        },
        onInputValueChange({ inputValue }) {
          api.setInputValue(inputValue)
        },
      },
    },
  )

  const tagApi = tagsInput.connect(tagState, tagSend, normalizeProps)

  /* -----------------------------------------------------------------------------
   * Render
   * -----------------------------------------------------------------------------*/

  return (
    <main className="combobox">
      <div {...mergeProps(api.getRootProps(), tagApi.rootProps)}>
        <label {...api.getLabelProps()}>Select country {tagState.event.type}</label>

        <div {...mergeProps(api.getControlProps(), tagApi.controlProps)}>
          {tagApi.value.map((value, index) => (
            <span key={value} {...tagApi.getItemProps({ index, value })}>
              <div {...tagApi.getItemPreviewProps({ index, value })}>
                <span {...tagApi.getItemTextProps({ index, value })}>{value} </span>
                <button {...tagApi.getItemDeleteTriggerProps({ index, value })}>&#x2715;</button>
              </div>
              <input {...tagApi.getItemInputProps({ index, value })} />
            </span>
          ))}

          <input
            data-testid="input"
            placeholder="add tag"
            {...mergeProps(api.getInputProps(), tagApi.inputProps, {
              onKeyDown(event) {
                // extra logic to add tag on Enter key
                if (event.key === "Enter" && options.length === 0) {
                  tagApi.addValue(api.inputValue)
                }
              },
            })}
          />
        </div>
      </div>

      <div {...api.getPositionerProps()}>
        {options.length > 0 && (
          <div data-testid="combobox-content" {...api.getContentProps()} ref={contentRef}>
            {options.map((item) => (
              <div data-testid={item.code} key={item.code} {...api.getItemProps({ item })}>
                {item.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
