import * as combobox from "@zag-js/combobox"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/react"
import { comboboxData } from "@zag-js/shared"
import * as tagsInput from "@zag-js/tags-input"
import { matchSorter } from "match-sorter"
import { useId, useState } from "react"

export default function Page() {
  // id composition for tags input and combobox
  const ids = {
    root: useId(),
    input: useId(),
    control: useId(),
  }

  /* -----------------------------------------------------------------------------
   * Combobox
   * -----------------------------------------------------------------------------*/

  const [options, setOptions] = useState(comboboxData)

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
      onOpenChange() {
        setOptions(comboboxData)
      },
      onInputValueChange({ inputValue }) {
        const filtered = matchSorter(comboboxData, inputValue, { keys: ["label"] })
        setOptions(filtered.length > 0 ? filtered : comboboxData)
      },
    }),
    {
      context: {
        multiple: true,
        selectionBehavior: "clear",
        inputBehavior: "autohighlight",
        collection,
        openOnClick: true,
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
    }),
    {
      context: {
        inputValue: state.context.inputValue,
        value: api.value,
        onValueChange(details) {
          api.setValue(details.value)
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
      <div {...mergeProps(api.rootProps, tagApi.rootProps)}>
        <div>{api.value}</div>
        <label {...api.labelProps}>Select country</label>

        <div {...mergeProps(api.controlProps, tagApi.controlProps)}>
          {tagApi.value.map((value, index) => (
            <span key={value} {...tagApi.getItemProps({ index, value })}>
              <div {...tagApi.getItemPreviewProps({ index, value })}>
                <span {...tagApi.getItemTextProps({ index, value })}>{value} </span>
                <button {...tagApi.getItemDeleteTriggerProps({ index, value })}>&#x2715;</button>
              </div>
              <input {...tagApi.getItemInputProps({ index, value })} />
            </span>
          ))}

          <input data-testid="input" placeholder="add tag" {...mergeProps(api.inputProps, tagApi.inputProps)} />
        </div>
      </div>

      <div {...api.positionerProps}>
        {options.length > 0 && (
          <ul data-testid="combobox-content" {...api.contentProps}>
            {options.map((item) => (
              <li data-testid={item.code} key={item.code} {...api.getItemProps({ item })}>
                <span {...api.getItemIndicatorProps({ item })}>✅</span>
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}
