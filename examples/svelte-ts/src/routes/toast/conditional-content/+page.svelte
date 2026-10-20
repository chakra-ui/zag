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
  <fieldset class="hstack gap-4" disabled={!ready}>
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
