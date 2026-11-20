<script lang="ts">
  import Portal from "#lib/components/portal.svelte"
  import * as menu from "@zag-js/menu"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { getContext } from "svelte"

  interface ViewSettings {
    lineNumbers: boolean
    wordWrap: boolean
    theme: string
  }

  interface Props {
    settings: ViewSettings
    onChange: (settings: ViewSettings) => void
  }

  const props: Props = $props()

  const themes = ["Light", "Dark", "System"]
  const checkboxes = [
    { value: "line-numbers", label: "Show line numbers", key: "lineNumbers" as const },
    { value: "word-wrap", label: "Word wrap", key: "wordWrap" as const },
  ]

  const getMenubarContext = getContext<(() => menu.MenubarContext) | undefined>("menubar")
  const service = useMachine(menu.machine, () => ({
    id: "view",
    menubar: getMenubarContext ? getMenubarContext() : undefined,
  }))
  const api = $derived(menu.connect(service, normalizeProps))

  const checkboxItem = (option: (typeof checkboxes)[number]) => ({
    type: "checkbox" as const,
    value: option.value,
    checked: props.settings[option.key],
    onCheckedChange: (checked: boolean) => props.onChange({ ...props.settings, [option.key]: checked }),
  })

  const themeItem = (theme: string) => ({
    type: "radio" as const,
    value: theme,
    checked: props.settings.theme === theme,
    onCheckedChange: () => props.onChange({ ...props.settings, theme }),
  })
</script>

<button {...api.getTriggerProps()}>View</button>
{#if api.open}
  <Portal>
    <div {...api.getPositionerProps()}>
      <div {...api.getContentProps()}>
        {#each checkboxes as option (option.value)}
          <div {...api.getOptionItemProps(checkboxItem(option))}>
            <span class="check"><span {...api.getItemIndicatorProps(checkboxItem(option))}>✓</span></span>
            <span {...api.getItemTextProps(checkboxItem(option))}>{option.label}</span>
          </div>
        {/each}
        <hr {...api.getSeparatorProps()} />
        <div {...api.getItemGroupProps({ id: "theme" })}>
          <span {...api.getItemGroupLabelProps({ htmlFor: "theme" })}>Theme</span>
          {#each themes as theme (theme)}
            <div {...api.getOptionItemProps(themeItem(theme))}>
              <span class="check"><span {...api.getItemIndicatorProps(themeItem(theme))}>✓</span></span>
              <span {...api.getItemTextProps(themeItem(theme))}>{theme}</span>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </Portal>
{/if}
