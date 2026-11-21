<script lang="ts">
  import Portal from "#lib/components/portal.svelte"
  import * as menu from "@zag-js/menu"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { getContext } from "svelte"

  interface Action {
    value: string
    label: string
    shortcut?: string
    disabled?: boolean
  }

  interface Props {
    id: string
    label: string
    actions: Action[]
    onRun: (label: string) => void
  }

  const props: Props = $props()

  const getMenubarContext = getContext<(() => menu.MenubarContext) | undefined>("menubar")
  const service = useMachine(menu.machine, (): menu.Props => ({
    id: props.id,
    menubar: getMenubarContext ? getMenubarContext() : undefined,
    onSelect: (details) => {
      const action = props.actions.find((item) => item.value === details.value)
      if (action) props.onRun(action.label)
    },
  }))
  const api = $derived(menu.connect(service, normalizeProps))
</script>

<button {...api.getTriggerProps()}>{props.label}</button>
{#if api.open}
  <Portal>
    <div {...api.getPositionerProps()}>
      <div {...api.getContentProps()}>
        <ul {...api.getListProps()}>
          {#each props.actions as action (action.value)}
            <li {...api.getItemProps({ value: action.value, disabled: action.disabled })}>
              {action.label}
              {#if action.shortcut}
                <kbd class="shortcut">{action.shortcut}</kbd>
              {/if}
            </li>
          {/each}
        </ul>
      </div>
    </div>
  </Portal>
{/if}
