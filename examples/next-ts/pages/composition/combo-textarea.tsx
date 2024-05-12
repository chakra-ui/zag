/**
 * Credits to Ariakit for the inspiration
 * https://ariakit.org/examples/combobox-textarea
 */

import * as combobox from "@zag-js/combobox"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/react"
import { comboboxData } from "@zag-js/shared"
import { matchSorter } from "match-sorter"
import { useEffect, useId, useRef, useState } from "react"
import getCaretCoordinates from "textarea-caret"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"

export default function Page() {
  const [options, setOptions] = useState(comboboxData)
  const [value, setValue] = useState<any[]>([])
  const [searchValue, setSearchValue] = useState("")

  const collection = combobox.collection({
    items: options,
    itemToValue: (item) => item.code,
    itemToString: (item) => item.label,
  })

  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const result = matchSorter(comboboxData, searchValue, {
      keys: ["label"],
      baseSort: (a, b) => (a.index < b.index ? -1 : 1),
    })
    setOptions(result)
  }, [searchValue])

  const [state, send] = useMachine(
    combobox.machine({
      id: useId(),
      collection,
      onOpenChange({ open }) {
        setOptions(comboboxData)
        if (open) return

        // clear search value and selected items
        queueMicrotask(() => {
          setSearchValue("")
          setValue([])
        })
      },
      inputBehavior: "autohighlight",
      openOnKeyPress: false,
      openOnChange: false,
      allowCustomValue: true,
      positioning: {
        sameWidth: false,
        placement: "bottom-start",
        gutter: 16,
        getAnchorRect() {
          return getAnchorRect(ref.current)
        },
      },
    }),
    {
      context: {
        collection,
        value,
        onValueChange({ value }) {
          setValue(value)
        },
        getSelectionValue({ inputValue, valueAsString }) {
          if (!valueAsString) return inputValue
          const offset = getTriggerOffset(ref.current)
          return replaceValue(offset, searchValue, valueAsString)(inputValue)
        },
      },
    },
  )

  const api = combobox.connect(state, send, normalizeProps)

  const textareaProps = api.inputProps as unknown as React.ComponentProps<"textarea">

  return (
    <>
      <main className="combobox">
        <div {...api.rootProps}>
          <span>Search value: {searchValue || "-"}</span>
          <label {...api.labelProps}>Select country</label>
          <textarea
            ref={ref}
            {...mergeProps(textareaProps, {
              rows: 5,
              placeholder: "Type @ to see completion",
              style: { width: 400, padding: 4 },
              onScroll() {
                api.reposition()
              },
              onPointerDown() {
                api.setOpen(false)
              },
              onKeyDown(event) {
                if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
                  api.setOpen(false)
                }
              },
              onChange(event) {
                const trigger = getTrigger(event.currentTarget)
                const searchValue = getSearchValue(event.currentTarget)

                if (trigger) {
                  api.setOpen(true)
                } else if (!searchValue) {
                  api.setOpen(false)
                }

                setSearchValue(searchValue)
              },
            })}
          />
        </div>

        <div {...api.positionerProps}>
          <ul {...api.contentProps}>
            {options.map((item) => (
              <li key={item.code} {...api.getItemProps({ item })}>
                {item.label}
              </li>
            ))}
          </ul>
        </div>
      </main>

      <Toolbar viz>
        <StateVisualizer state={state} omit={["collection", "nextEvents"]} />
      </Toolbar>
    </>
  )
}

const defaultTriggers = ["@", "#"]

function getTriggerOffset(element: HTMLTextAreaElement | null, triggers = defaultTriggers) {
  if (!element) return -1

  const { value, selectionStart } = element
  for (let i = selectionStart; i >= 0; i--) {
    const char = value[i]
    if (char && triggers.includes(char)) {
      return i
    }
  }

  return -1
}

function getTrigger(element: HTMLTextAreaElement, triggers = defaultTriggers) {
  const { value, selectionStart } = element
  const previousChar = value[selectionStart - 1]
  if (!previousChar) return null
  const secondPreviousChar = value[selectionStart - 2]
  const isIsolated = !secondPreviousChar || /\s/.test(secondPreviousChar)
  if (!isIsolated) return null
  if (triggers.includes(previousChar)) return previousChar
  return null
}

function getSearchValue(element: HTMLTextAreaElement, triggers = defaultTriggers) {
  const offset = getTriggerOffset(element, triggers)
  if (offset === -1) return ""
  return element.value.slice(offset + 1, element.selectionStart)
}

function getAnchorRect(element: HTMLTextAreaElement | null, triggers = defaultTriggers) {
  if (!element) return null
  const offset = getTriggerOffset(element, triggers)
  const { left, top, height } = getCaretCoordinates(element, offset + 1)
  const { x, y } = element.getBoundingClientRect()
  return {
    x: left + x - element.scrollLeft,
    y: top + y - element.scrollTop,
    height: Number.isNaN(height) ? 0 : height,
  }
}

function replaceValue(offset: number, searchValue: string, displayValue: string) {
  return (inputValue: string) => {
    return `${inputValue.slice(0, offset) + displayValue} ${inputValue.slice(offset + searchValue.length + 1)}`
  }
}
