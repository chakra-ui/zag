<script lang="ts">
  import Portal from "$lib/components/portal.svelte"
  import ConditionalContentToast from "$lib/components/conditional-content-toast.svelte"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import * as toast from "@zag-js/toast"
  import "@styles/toast.css"
  import { onMount } from "svelte"

  const store = toast.createStore<string>({ duration: Infinity })
  let ready = $state(false)
  let showTitle = $state(false)
  let showDescription = $state(false)
  const id = $props.id()
  const service = useMachine(toast.group.machine, { id, store })
  const api = $derived(toast.group.connect(service, normalizeProps))

  onMount(() => {
    ready = true
  })
</script>

<main>
  <h1>Conditional title and description</h1>
  <p>Toggle the optional title and description before or after creating a toast.</p>

  <fieldset disabled={!ready} style="display: flex; align-items: center; gap: 16px; border: 0; padding: 0">
    <label><input type="checkbox" bind:checked={showTitle} /> Show title</label>
    <label><input type="checkbox" bind:checked={showDescription} /> Show description</label>
    <button
      onclick={() => store.create({ id: "draft", title: "Draft saved", description: "All changes are up to date." })}
    >
      Create toast
    </button>
  </fieldset>

  <Portal>
    <div {...api.getGroupProps()}>
      {#each api.getToasts() as actor, index (actor.id)}
        <ConditionalContentToast {actor} parent={service} {index} {showTitle} {showDescription} />
      {/each}
    </div>
  </Portal>
</main>
