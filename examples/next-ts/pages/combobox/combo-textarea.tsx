import styles from "../../../../shared/src/css/combobox.module.css"
import * as combobox from "@zag-js/combobox"
import { raf } from "@zag-js/dom-query"
import { createFilter } from "@zag-js/i18n-utils"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/react"
import { comboboxData } from "@zag-js/shared"
import { useEffect, useId, useMemo, useRef, useState } from "react"
import getCaretCoordinates from "textarea-caret"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"

const { contains } = createFilter({ sensitivity: "base" })

export default function Page() {
  const [options, setOptions] = useState(comboboxData)

  const [searchValue, setSearchValue] = useState("")
  const searchValueRef = useRef("")

  const collection = useMemo(
    () =>
      combobox.collection({
        items: options,
        itemToValue: (item) => item.code,
        itemToString: (item) => item.label,
      }),
    [options],
  )

  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const result = comboboxData.filter((item) => contains(item.label, searchValue))
    setOptions(result)
  }, [searchValue])

  const service = useMachine(combobox.machine, {
    id: useId(),
    collection,
    onOpenChange() {
      setOptions(comboboxData)
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
    onValueChange({ value }) {
      const valueAsString = collection.stringifyMany(value)
      const offset = getTriggerOffset(ref.current)
      const inputValue = replaceValue(offset, searchValueRef.current, valueAsString)(ref.current.value)
      raf(() => {
        api.setInputValue(inputValue)
      })
    },
  })

  const api = combobox.connect(service, normalizeProps)

  const textareaProps = api.getInputProps() as unknown as React.ComponentProps<"textarea">

  return (
    <>
      <main className="combobox">
        <div {...api.getRootProps()} className={styles.Root}>
          <span>Search value: {searchValue || "-"}</span>
          <label {...api.getLabelProps()} className={styles.Label}>Select country</label>
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
                searchValueRef.current = searchValue
              },
            })}
          />
        </div>

        <div {...api.getPositionerProps()}>
          <ul {...api.getContentProps()} className={styles.Content}>
            {options.map((item) => (
              <li key={item.code} {...api.getItemProps({ item })} className={styles.Item}>
                {item.label}
              </li>
            ))}
          </ul>
        </div>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} omit={["collection", "nextEvents"]} />
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
