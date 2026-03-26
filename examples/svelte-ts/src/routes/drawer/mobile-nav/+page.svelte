<script lang="ts">
  import * as drawer from "@zag-js/drawer"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import Presence from "$lib/components/presence.svelte"
  import styles from "../../../../../shared/styles/drawer-mobile-nav.module.css"

  const id = $props.id()

  const NAV_ITEMS = [
    { href: "#", label: "Overview" },
    { href: "#", label: "Components" },
    { href: "#", label: "Utilities" },
    { href: "#", label: "Releases" },
  ]

  const LONG_LIST = Array.from({ length: 50 }, (_, i) => ({
    href: "#",
    label: `Item ${i + 1}`,
  }))

  const service = useMachine(drawer.machine, { id })

  const api = $derived(drawer.connect(service, normalizeProps))
</script>

<main class={styles.page}>
  <header class={styles.header}>
    <button {...api.getTriggerProps()} class={styles.menuButton}>Open mobile menu</button>
  </header>

  <Presence {...api.getBackdropProps()} class={styles.backdrop}></Presence>
  <div {...api.getPositionerProps()} class={styles.positioner}>
    <Presence {...api.getContentProps({ draggable: false })} class={styles.popup}>
      <nav class={styles.panel}>
        <div class={styles.panelHeader}>
          <div aria-hidden="true" class={styles.headerSpacer}></div>
          <div {...api.getGrabberProps()} class={styles.handle}>
            <div {...api.getGrabberIndicatorProps()} class={styles.handleIndicator}></div>
          </div>
          <button type="button" {...api.getCloseTriggerProps()} class={styles.closeButton} aria-label="Close menu">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M0.75 0.75L6 6M11.25 11.25L6 6M6 6L0.75 11.25M6 6L11.25 0.75"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </div>

        <h2 {...api.getTitleProps()} class={styles.title}>Menu</h2>
        <p {...api.getDescriptionProps()} class={styles.description}>
          Scroll the long list. Flick down from the top to dismiss.
        </p>

        <div class={styles.scrollArea}>
          <ul class={styles.navList}>
            {#each NAV_ITEMS as item (item.label)}
              <li class={styles.navItem}>
                <a class={styles.navLink} href={item.href} onclick={() => api.setOpen(false)}>{item.label}</a>
              </li>
            {/each}
          </ul>

          <ul class={styles.longList} aria-label="Long list">
            {#each LONG_LIST as item (item.label)}
              <li class={styles.navItem}>
                <a class={styles.navLink} href={item.href} onclick={() => api.setOpen(false)}>{item.label}</a>
              </li>
            {/each}
          </ul>
        </div>
      </nav>
    </Presence>
  </div>
</main>
