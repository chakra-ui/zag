<script lang="ts">
  import Portal from "$lib/components/portal.svelte"
  import * as avatar from "@zag-js/avatar"
  import * as menu from "@zag-js/menu"
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte"
  import { avatarData } from "@zag-js/shared"
  import "@styles/avatar.css"
  import "@styles/menu.css"

  const triggerStyle = "border: none; background: none; padding: 0; border-radius: 9999px; cursor: pointer"

  const id = $props.id()
  const avatarService = useMachine(avatar.machine, { id: `${id}-avatar` })
  const avatarApi = $derived(avatar.connect(avatarService, normalizeProps))

  const menuService = useMachine(menu.machine, { id: `${id}-menu`, onSelect: console.log })
  const menuApi = $derived(menu.connect(menuService, normalizeProps))
</script>

<main class="avatar">
  <!-- The button is both the menu trigger and the avatar root -->
  <button {...mergeProps(menuApi.getTriggerProps(), avatarApi.getRootProps(), { style: triggerStyle })} data-size="sm">
    <span {...avatarApi.getFallbackProps()}>PA</span>
    <img alt="" referrerpolicy="no-referrer" src={avatarData.full[0]} {...avatarApi.getImageProps()} />
  </button>

  {#if menuApi.open}
    <Portal>
      <div {...menuApi.getPositionerProps()}>
        <ul {...menuApi.getContentProps()}>
          <li {...menuApi.getItemProps({ value: "profile" })}>Profile</li>
          <li {...menuApi.getItemProps({ value: "settings" })}>Settings</li>
          <li {...menuApi.getItemProps({ value: "signout" })}>Sign out</li>
        </ul>
      </div>
    </Portal>
  {/if}
</main>
