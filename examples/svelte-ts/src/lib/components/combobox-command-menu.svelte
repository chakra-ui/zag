<script lang="ts">
  import Highlight from "#lib/components/highlight.svelte"
  import type { PageListCollection } from "@zag-js/collection"
  import * as combobox from "@zag-js/combobox"
  import { createFuzzySearch } from "@zag-js/fuzzy"
  import type { commandData } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { untrack } from "svelte"

  type Item = commandData.PageItem

  interface Props {
    pages: PageListCollection<Item>
    query: string
    onNavigate: (pages: PageListCollection<Item>, query: string) => void
    onQueryChange: (query: string) => void
    onAction: (item: Item) => void
  }

  const props: Props = $props()

  const fuzzy = createFuzzySearch<Item>({ itemToString: (item) => item.label, itemToKeywords: (item) => item.keywords })

  // search the open page and everything nested in it
  const collection = $derived(
    props.pages.setItems(
      fuzzy.search(props.query ? props.pages.getDescendants() : props.pages.getChildren(), props.query),
    ),
  )

  const id = $props.id()
  const service = useMachine(combobox.machine as combobox.Machine<Item>, () => ({
    id,
    inline: true,
    collection,
    inputValue: props.query,
    placeholder: props.pages.pageItem ? `Search ${props.pages.pageItem.label}...` : "Type a command or search...",
    loopFocus: false,
    inputBehavior: "autohighlight" as const,
    selectionBehavior: "clear" as const,
    onInputValueChange: ({ inputValue }: combobox.InputValueChangeDetails) => props.onQueryChange(inputValue),
    onSelect: ({ itemValue }: combobox.SelectionDetails) => {
      const item = props.pages.getItem(itemValue)
      if (!item) return
      if (props.pages.isPage(item)) props.onNavigate(props.pages.setPage(itemValue, props.query), "")
      else props.onAction(item)
    },
  }))

  const api = $derived(combobox.connect(service, normalizeProps))
  const inputProps = $derived(api.getInputProps())

  // highlight the item we came back from once its page is showing
  $effect(() => {
    const { highlightedValue } = props.pages.restore
    untrack(() => {
      if (highlightedValue && collection.has(highlightedValue)) api.setHighlightedValue(highlightedValue)
    })
  })

  const onkeydown = (event: KeyboardEvent & { currentTarget: EventTarget & HTMLInputElement }) => {
    if (event.key === "Backspace" && !props.query && props.pages.page) {
      event.preventDefault()
      // keep the input empty so Backspace keeps going up
      props.onNavigate(props.pages.up(props.query), "")
      return
    }
    inputProps.onkeydown?.(event)
  }
</script>

<div {...api.getRootProps()}>
  {#if props.pages.page}
    <div data-part="breadcrumbs">
      {#each props.pages.getPath() as page (page.value)}
        <span>{page.label}</span>
      {/each}
    </div>
  {/if}
  <input {...inputProps} {onkeydown} />
  <div {...api.getContentProps()}>
    <div {...api.getEmptyProps()}>{collection.size === 0 ? "No results found" : ""}</div>
    <div {...api.getListProps()}>
      {#each collection.group() as [group, items] (group)}
        <div {...api.getItemGroupProps({ id: group })}>
          <div {...api.getItemGroupLabelProps({ htmlFor: group })}>{group}</div>
          {#each items as item (item.value)}
            <div {...api.getItemProps({ item, persistFocus: true })}>
              <Highlight text={item.label} query={props.query} fuzzy />
              {#if props.query && props.pages.getAncestors(item).length > 0}
                <span data-part="item-path">
                  {props.pages
                    .getAncestors(item)
                    .map((page) => page.label)
                    .join(" › ")}
                </span>
              {/if}
              {#if props.pages.isPage(item)}
                <span data-part="item-indicator">›</span>
              {/if}
            </div>
          {/each}
        </div>
      {/each}
    </div>
  </div>
</div>
