<script lang="ts">
  import Portal from "$lib/components/portal.svelte"
  import * as select from "@zag-js/select"
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte"
  import * as tabs from "@zag-js/tabs"
  import { ChevronsUpDownIcon, GitBranchIcon, TagIcon } from "lucide-svelte"
  import { tick, untrack } from "svelte"
  import "@styles/select.css"
  import "@styles/tabs.css"

  const branchData = [
    { value: "master", label: "master" },
    { value: "feature", label: "feature" },
    { value: "bugfix", label: "bugfix" },
    { value: "hotfix", label: "hotfix" },
    { value: "release", label: "release" },
    { value: "rsc", label: "rsc" },
  ]

  const tagData = [
    { value: "v1.0.0", label: "v1.0.0" },
    { value: "v1.0.1", label: "v1.0.1" },
    { value: "v1.0.2", label: "v1.0.2" },
    { value: "v1.0.3", label: "v1.0.3" },
    { value: "v1.0.4", label: "v1.0.4" },
    { value: "v1.0.5", label: "v1.0.5" },
  ]

  type SelectedTab = "branch" | "tag"

  let selectedTab = $state<SelectedTab>("branch")
  let highlighted = $state<string | null>(null)

  const collection = $derived(select.collection({ items: selectedTab === "branch" ? branchData : tagData }))

  let listRef = $state<HTMLDivElement | null>(null)

  const selectId = $props.id()
  const selectService = useMachine(select.machine, () => ({
    collection,
    id: selectId,
    popupType: "dialog" as const,
    highlightedValue: highlighted,
    initialFocusEl: () => listRef,
    onHighlightChange({ highlightedValue }: select.HighlightChangeDetails) {
      highlighted = highlightedValue
    },
  }))

  const selectApi = $derived(select.connect(selectService, normalizeProps))

  const tabService = useMachine(tabs.machine, () => ({
    id: `${selectId}-tabs`,
    value: selectedTab,
    virtualFocus: true,
    onValueChange(details: tabs.ValueChangeDetails) {
      selectedTab = details.value as SelectedTab
    },
  }))

  const tabApi = $derived(tabs.connect(tabService, normalizeProps))

  $effect(() => {
    const next = collection
    untrack(() => {
      if (!selectApi.open) return
      selectApi.setHighlightValue(next.firstValue!)
      tick().then(() => listRef?.focus())
    })
  })

  const tabListProps = $derived(
    mergeProps(tabApi.getListProps(), {
      onkeydown(event: KeyboardEvent) {
        if (event.key === "Home" || event.key === "End") {
          event.preventDefault()
        }
      },
    }),
  )

  const listProps = $derived(
    mergeProps(selectApi.getListProps(), {
      onkeydown(event: KeyboardEvent) {
        if (event.key === "ArrowLeft") tabApi.selectPrev()
        else if (event.key === "ArrowRight") tabApi.selectNext()
        else return
        event.preventDefault()
      },
    }),
  )
</script>

<main class="select">
  <div {...selectApi.getRootProps()}>
    <div {...selectApi.getControlProps()}>
      <button {...selectApi.getTriggerProps()}>
        {#if selectedTab === "branch"}
          <GitBranchIcon />
        {:else}
          <TagIcon />
        {/if}
        <span>{selectApi.valueAsString || "Select option"}</span>
        <span {...selectApi.getIndicatorProps()}>
          <ChevronsUpDownIcon />
        </span>
      </button>
    </div>

    <Portal>
      <div {...selectApi.getPositionerProps()}>
        <div {...selectApi.getContentProps()}>
          <div {...tabApi.getRootProps()}>
            <div data-stretch="" {...tabListProps}>
              <button {...tabApi.getTriggerProps({ value: "branch" })}>Branch</button>
              <button {...tabApi.getTriggerProps({ value: "tag" })}>Tags</button>
            </div>

            <div {...tabApi.getContentProps({ value: "branch" })}>
              {#if selectedTab === "branch"}
                <div bind:this={listRef} {...listProps}>
                  {#each branchData as item (item.value)}
                    <div {...selectApi.getItemProps({ item, persistFocus: true })}>
                      <span {...selectApi.getItemTextProps({ item })}>{item.label}</span>
                    </div>
                  {/each}
                </div>
              {/if}
            </div>

            <div {...tabApi.getContentProps({ value: "tag" })}>
              {#if selectedTab === "tag"}
                <div bind:this={listRef} {...listProps}>
                  {#each tagData as item (item.value)}
                    <div {...selectApi.getItemProps({ item, persistFocus: true })}>
                      <span {...selectApi.getItemTextProps({ item })}>{item.label}</span>
                    </div>
                  {/each}
                </div>
              {/if}
            </div>
          </div>
        </div>
      </div>
    </Portal>
  </div>
</main>
