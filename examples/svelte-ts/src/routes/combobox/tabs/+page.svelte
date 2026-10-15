<script lang="ts">
  import * as combobox from "@zag-js/combobox"
  import { createFilter } from "@zag-js/i18n-utils"
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte"
  import * as tabs from "@zag-js/tabs"
  import { flushSync } from "svelte"
  import "@styles/combobox.css"
  import "@styles/tabs.css"

  const pages = {
    Page: [
      { value: "docs", label: "Docs" },
      { value: "examples", label: "Examples" },
      { value: "blog", label: "Blog" },
      { value: "community", label: "Community" },
      { value: "support", label: "Support" },
      { value: "contact", label: "Contact" },
      { value: "about", label: "About" },
      { value: "pricing", label: "Pricing" },
      { value: "login", label: "Login" },
      { value: "signup", label: "Signup" },
    ],
    Component: [
      { value: "select-tabs", label: "Select Tabs" },
      { value: "select-combobox", label: "Select Combobox" },
      { value: "combobox-tabs", label: "Combobox Tabs" },
      { value: "menu-button", label: "Menu Button" },
      { value: "menu-tabs", label: "Menu Tabs" },
      { value: "menu-combobox", label: "Menu Combobox" },
    ],
  }

  const flatPages = Object.entries(pages).flatMap(([category, pages]) => pages.map((page) => ({ ...page, category })))

  function groupBy<T>(items: T[], key: keyof T): any {
    return items.reduce((acc: any, item) => {
      const value = item[key]
      if (!acc[value]) acc[value] = []
      acc[value].push(item)
      return acc
    }, {})
  }

  type SelectedTab = "Page" | "Component" | "All"
  const categories: SelectedTab[] = ["All", "Page", "Component"]
  const { contains } = createFilter({ sensitivity: "base" })

  let selectedTab = $state<SelectedTab>("All")
  let inputValue = $state("")

  const matches = $derived.by(() => {
    const allMatches = flatPages.filter((item) => contains(item.label, inputValue))
    const groups = groupBy(allMatches, "category")
    groups.All = allMatches
    return groups as Record<SelectedTab, typeof flatPages>
  })

  // Non-reactive on purpose, like a ref
  let selectedValueTab: SelectedTab = "Component"

  const items = $derived(matches[selectedTab] || [])
  const collection = $derived(combobox.collection({ items }))

  const id = $props.id()
  const service = useMachine(combobox.machine, () => ({
    collection,
    id: `${id}-combobox`,
    popupType: "dialog" as const,
    openOnClick: true,
    inputBehavior: "autohighlight" as const,
    positioning: {
      sameWidth: false,
    },
    onValueChange() {
      selectedValueTab = selectedTab
    },
    onInputValueChange(details) {
      flushSync(() => {
        inputValue = details.inputValue
      })
    },
    onOpenChange(details) {
      if (details.open) return
      inputValue = ""
      if (selectedValueTab === selectedTab) return
      selectedTab = selectedValueTab
    },
  }))

  const comboboxApi = $derived(combobox.connect(service, normalizeProps))

  const tabService = useMachine(tabs.machine, () => ({
    id: `${id}-tabs`,
    virtualFocus: true,
    value: selectedTab,
    onValueChange(details) {
      selectedTab = details.value as SelectedTab
    },
  }))

  const tabApi = $derived(tabs.connect(tabService, normalizeProps))
</script>

<main>
  <div {...comboboxApi.getRootProps()}>
    <pre>{comboboxApi.value}</pre>
    <!-- svelte-ignore a11y_label_has_associated_control -->
    <label {...comboboxApi.getLabelProps()}>Select country </label>
    <div {...comboboxApi.getControlProps()}>
      <input
        {...mergeProps(comboboxApi.getInputProps(), {
          onkeydown(event: KeyboardEvent) {
            if (!comboboxApi.open) return

            if (event.key === "ArrowRight") {
              tabApi.selectNext()
              event.preventDefault()
            }

            if (event.key === "ArrowLeft") {
              tabApi.selectPrevious()
              event.preventDefault()
            }
          },
        })}
      />
      <button {...comboboxApi.getTriggerProps()}>▼</button>
    </div>
  </div>
  <div {...comboboxApi.getPositionerProps()}>
    <div {...comboboxApi.getContentProps()}>
      <div {...mergeProps(tabApi.getRootProps(), { style: "position: relative" })}>
        <div
          data-stretch=""
          {...mergeProps(tabApi.getListProps(), { style: "position: sticky; top: 0; inset-inline: 0" })}
        >
          {#each categories as category (category)}
            {@const currentItems = matches[category]}
            <button {...tabApi.getTriggerProps({ value: category, disabled: !currentItems?.length })}>
              {category} ({currentItems?.length || 0})
            </button>
          {/each}
        </div>

        {#if !items.length}
          <div class="no-results">
            No item found for &quot;<strong>{inputValue}</strong>
            &quot;
          </div>
        {/if}

        {#each categories as category (category)}
          <div {...tabApi.getContentProps({ value: category })}>
            {#if selectedTab === category}
              <div {...comboboxApi.getListProps()}>
                {#each items as item (item.value)}
                  <div {...comboboxApi.getItemProps({ item, persistFocus: true })}>
                    {item.label}
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  </div>
</main>
