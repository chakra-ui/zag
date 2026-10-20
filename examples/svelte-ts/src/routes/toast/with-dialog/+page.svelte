<script lang="ts">
  import Portal from "$lib/components/portal.svelte"
  import ToastItem from "$lib/components/toast-item.svelte"
  import * as dialog from "@zag-js/dialog"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import * as toast from "@zag-js/toast"
  import { XIcon } from "lucide-svelte"
  import "@styles/dialog.css"
  import "@styles/toast.css"

  const toaster = toast.createStore({ placement: "bottom-end", duration: Infinity })

  const uid = $props.id()

  const dialogService = useMachine(dialog.machine, { id: `${uid}-dialog` })
  const dialogApi = $derived(dialog.connect(dialogService, normalizeProps))

  const service = useMachine(toast.group.machine, { id: uid, store: toaster })
  const api = $derived(toast.group.connect(service, normalizeProps))
</script>

<main>
  <button {...dialogApi.getTriggerProps()}>Edit profile</button>
  {#if dialogApi.open}
    <Portal>
      <div {...dialogApi.getBackdropProps()}></div>
      <div {...dialogApi.getPositionerProps()}>
        <div {...dialogApi.getContentProps()}>
          <h2 {...dialogApi.getTitleProps()}>Edit profile</h2>
          <p {...dialogApi.getDescriptionProps()}>Saving shows a toast while the dialog stays open.</p>
          <button onclick={() => toaster.success({ title: "Profile saved" })}>Save</button>
          <button {...dialogApi.getCloseTriggerProps()}>
            <XIcon />
          </button>
        </div>
      </div>
    </Portal>
  {/if}
  <Portal>
    <div {...api.getGroupProps()}>
      {#each api.getToasts() as actor, index (actor.id)}
        <ToastItem {actor} {index} parent={service} />
      {/each}
    </div>
  </Portal>
</main>
