import * as combobox from "@zag-js/combobox"
import { getCaretPosition, raf } from "@zag-js/dom-query"
import { createFilter } from "@zag-js/i18n-utils"
import { comboboxData } from "@zag-js/shared"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/solid"
import { Index, createEffect, createMemo, createSignal, createUniqueId, on } from "solid-js"
import type { JSX } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import "@styles/combobox.css"

const { contains } = createFilter({ sensitivity: "base" })

export default function Page() {
  const [options, setOptions] = createSignal(comboboxData)

  const [searchValue, setSearchValue] = createSignal("")

  const collection = createMemo(() =>
    combobox.collection({
      items: options(),
      itemToValue: (item) => item.code,
      itemToString: (item) => item.label,
    }),
  )

  let ref: HTMLTextAreaElement | undefined

  createEffect(
    on(searchValue, (searchValue) => {
      setOptions(comboboxData.filter((item) => contains(item.label, searchValue)))
    }),
  )

  const id = createUniqueId()

  const service = useMachine(combobox.machine, (): combobox.Props => ({
    id,
    collection: collection(),
    onOpenChange() {
      setOptions(comboboxData)
    },
    inputBehavior: "autohighlight",
    selectionBehavior: "preserve",
    openOnKeyPress: false,
    openOnChange: false,
    allowCustomValue: true,
    positioning: {
      sameWidth: false,
      placement: "bottom-start",
      gutter: 16,
      getAnchorRect() {
        return getAnchorRect(ref ?? null)
      },
    },
    onValueChange({ value }) {
      const textarea = ref
      if (!textarea) return
      const valueAsString = collection().stringifyMany(value)
      const offset = getTriggerOffset(textarea)
      const inputValue = replaceValue(offset, searchValue(), valueAsString)(textarea.value)
      raf(() => {
        api().setInputValue(inputValue)
      })
    },
  }))

  const api = createMemo(() => combobox.connect(service, normalizeProps))

  const textareaProps = () => api().getInputProps() as unknown as JSX.TextareaHTMLAttributes<HTMLTextAreaElement>

  return (
    <>
      <main class="combobox">
        <div {...api().getRootProps()}>
          <span>Search value: {searchValue() || "-"}</span>
          <label {...api().getLabelProps()}>Select country</label>
          <textarea
            ref={ref}
            {...mergeProps(textareaProps, {
              rows: 5,
              placeholder: "Type @ to see completion",
              style: { width: "400px", padding: "4px" },
              onScroll() {
                api().reposition()
              },
              onPointerDown() {
                api().setOpen(false)
              },
              onKeyDown(event: KeyboardEvent) {
                if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
                  api().setOpen(false)
                }
              },
              onInput(event: InputEvent & { currentTarget: HTMLTextAreaElement }) {
                const trigger = getTrigger(event.currentTarget)
                const searchValue = getSearchValue(event.currentTarget)

                if (trigger) {
                  api().setOpen(true)
                } else if (!searchValue) {
                  api().setOpen(false)
                }

                setSearchValue(searchValue)
              },
            })}
          />
        </div>

        <div {...api().getPositionerProps()}>
          <div {...api().getContentProps()}>
            <div {...api().getListProps()}>
              <Index each={options()}>
                {(item) => <div {...api().getItemProps({ item: item() })}>{item().label}</div>}
              </Index>
            </div>
          </div>
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
  const { left, top, height } = getCaretPosition(element, { position: offset + 1 })
  const { x, y } = element.getBoundingClientRect()
  return { x: x + left, y: y + top, height }
}

function replaceValue(offset: number, searchValue: string, displayValue: string) {
  return (inputValue: string) => {
    return `${inputValue.slice(0, offset) + displayValue} ${inputValue.slice(offset + searchValue.length + 1)}`
  }
}
