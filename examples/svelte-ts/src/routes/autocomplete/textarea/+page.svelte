<script lang="ts" module>
  import { getCaretPosition } from "@zag-js/dom-query"

  interface Item {
    code: string
    label: string
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
</script>

<script lang="ts">
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import * as autocomplete from "@zag-js/autocomplete"
  import { raf } from "@zag-js/dom-query"
  import { createFilter } from "@zag-js/utils/search"
  import { comboboxData } from "@zag-js/shared"
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/autocomplete.css"

  const { contains } = createFilter({ sensitivity: "base" })

  let value = $state("")
  let searchValue = $state("")

  const items = $derived(comboboxData.filter((item) => contains(item.label, searchValue)))

  const collection = $derived(
    autocomplete.collection<Item>({
      items,
      itemToValue: (item) => item.code,
      itemToString: (item) => item.label,
    }),
  )

  let ref: HTMLTextAreaElement | null = null

  const id = $props.id()
  const service = useMachine(autocomplete.machine as autocomplete.Machine<Item>, (): autocomplete.Props<Item> => ({
    id,
    collection,
    value,
    onValueChange(details) {
      value = details.value
    },
    autoHighlight: true,
    openOnKeyPress: false,
    openOnChange: false,
    positioning: {
      sameWidth: false,
      placement: "bottom-start",
      gutter: 16,
      getAnchorRect() {
        return getAnchorRect(ref)
      },
    },
    onSelect(details) {
      const textarea = ref
      if (!textarea) return
      const offset = getTriggerOffset(textarea)
      const nextValue = replaceValue(offset, getSearchValue(textarea), details.value)(textarea.value)
      // selecting writes the label into the value; swap in the full text after
      raf(() => {
        api.setValue(nextValue)
        searchValue = ""
      })
    },
  }))

  const api = $derived(autocomplete.connect(service, normalizeProps))
</script>

<main class="autocomplete">
  <div {...api.getRootProps()}>
    <span>Search value: {searchValue || "-"}</span>
    <!-- svelte-ignore a11y_label_has_associated_control -->
    <label {...api.getLabelProps()}>Select country</label>
    <textarea
      bind:this={ref}
      {...mergeProps(api.getInputProps(), {
        rows: 5,
        placeholder: "Type @ to see completion",
        style: "width: 400px; padding: 4px; border: 1px solid var(--z-border)",
        onscroll() {
          api.reposition()
        },
        onpointerdown() {
          api.setOpen(false)
        },
        onkeydown(event: KeyboardEvent) {
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            api.setOpen(false)
          }
        },
        oninput(event: Event) {
          const target = event.currentTarget as HTMLTextAreaElement
          const trigger = getTrigger(target)
          const nextSearchValue = getSearchValue(target)

          if (trigger) {
            api.setOpen(true)
          } else if (!nextSearchValue) {
            api.setOpen(false)
          }

          searchValue = nextSearchValue
        },
      })}></textarea>
  </div>

  <div {...api.getPositionerProps()}>
    <div {...api.getContentProps()}>
      <ul {...api.getListProps()}>
        {#each items as item (item.code)}
          <li {...api.getItemProps({ item })}>
            <span {...api.getItemTextProps({ item })}>{item.label}</span>
          </li>
        {/each}
      </ul>
    </div>
  </div>
</main>

<Toolbar viz>
  <StateVisualizer state={service} omit={["collection"]} />
</Toolbar>
