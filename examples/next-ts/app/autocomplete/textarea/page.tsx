"use client"

import * as autocomplete from "@zag-js/autocomplete"
import { getCaretPosition, raf } from "@zag-js/dom-query"
import { createFilter } from "@zag-js/i18n-utils"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/react"
import { comboboxData } from "@zag-js/shared"
import { useId, useRef, useState } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import "@styles/autocomplete.css"

interface Item {
  code: string
  label: string
}

const { contains } = createFilter({ sensitivity: "base" })

export default function Page() {
  const [value, setValue] = useState("")
  const [searchValue, setSearchValue] = useState("")

  const ref = useRef<HTMLTextAreaElement>(null)

  const items = comboboxData.filter((item) => contains(item.label, searchValue))

  const collection = autocomplete.collection<Item>({
    items,
    itemToValue: (item) => item.code,
    itemToString: (item) => item.label,
  })

  const service = useMachine(autocomplete.machine as autocomplete.Machine<Item>, {
    id: useId(),
    collection,
    value,
    onValueChange: (details) => setValue(details.value),
    autoHighlight: true,
    openOnKeyPress: false,
    openOnChange: false,
    positioning: {
      sameWidth: false,
      placement: "bottom-start",
      gutter: 16,
      getAnchorRect() {
        return getAnchorRect(ref.current)
      },
    },
    onSelect(details) {
      const textarea = ref.current
      if (!textarea) return
      const offset = getTriggerOffset(textarea)
      const nextValue = replaceValue(offset, getSearchValue(textarea), details.value)(textarea.value)
      // selecting writes the label into the value; swap in the full text after
      raf(() => {
        api.setValue(nextValue)
        setSearchValue("")
      })
    },
  })

  const api = autocomplete.connect(service, normalizeProps)

  const textareaProps = api.getInputProps() as unknown as React.ComponentProps<"textarea">

  return (
    <>
      <main className="autocomplete">
        <div {...api.getRootProps()}>
          <span>Search value: {searchValue || "-"}</span>
          <label {...api.getLabelProps()}>Select country</label>
          <textarea
            ref={ref}
            {...mergeProps(textareaProps, {
              rows: 5,
              placeholder: "Type @ to see completion",
              style: { width: 400, padding: 4, border: "1px solid var(--z-border)" },
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

        <div {...api.getPositionerProps()}>
          <div {...api.getContentProps()}>
            <ul {...api.getListProps()}>
              {items.map((item) => (
                <li key={item.code} {...api.getItemProps({ item })}>
                  <span {...api.getItemTextProps({ item })}>{item.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} omit={["collection"]} />
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
  const { left, top, height } = getCaretPosition(element, { position: offset + 1 })
  const { x, y } = element.getBoundingClientRect()
  return { x: x + left, y: y + top, height }
}

function replaceValue(offset: number, searchValue: string, displayValue: string) {
  return (inputValue: string) => {
    return `${inputValue.slice(0, offset) + displayValue} ${inputValue.slice(offset + searchValue.length + 1)}`
  }
}
