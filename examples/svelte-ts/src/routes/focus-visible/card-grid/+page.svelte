<script lang="ts">
  import { trackFocusVisible } from "@zag-js/focus-visible"
  import { onMount } from "svelte"
  import "@styles/focus-visible.css"

  const projects = [
    { name: "Design system", meta: "42 components" },
    { name: "Mobile app", meta: "Updated 2 hours ago" },
    { name: "Marketing site", meta: "3 open reviews" },
    { name: "Billing service", meta: "Deployed yesterday" },
  ]

  let focusVisible = $state(false)
  let focusWithin = $state(false)

  onMount(() => trackFocusVisible({ onChange: (details) => (focusVisible = details.isFocusVisible) }))

  function onfocusout(event: FocusEvent & { currentTarget: HTMLElement }) {
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) return
    focusWithin = false
  }
</script>

<main>
  <div class="focus-visible-card-grid">
    <p class="hint">Tab through the projects to outline the grid. Clicking a project doesn't.</p>
    <div
      class="grid"
      data-testid="card-grid"
      data-focus-visible={focusVisible && focusWithin ? "" : undefined}
      onfocusin={() => (focusWithin = true)}
      {onfocusout}
    >
      {#each projects as project (project.name)}
        <button type="button" class="card">
          <strong>{project.name}</strong>
          <span class="meta">{project.meta}</span>
        </button>
      {/each}
    </div>
  </div>
</main>
