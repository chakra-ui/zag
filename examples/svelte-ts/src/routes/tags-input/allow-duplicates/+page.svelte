<script lang="ts">
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import * as tagsInput from "@zag-js/tags-input"
  import { XIcon } from "lucide-svelte"
  import "@styles/tags-input.css"

  function toDashCase(str: string) {
    return str.replace(/\s+/g, "-").toLowerCase()
  }

  const id = $props.id()
  const service = useMachine(tagsInput.machine, {
    id,
    defaultValue: ["React", "Vue"],
    allowDuplicates: true,
  })

  const api = $derived(tagsInput.connect(service, normalizeProps))
</script>

<main class="tags-input">
  <div {...api.getRootProps()}>
    <!-- svelte-ignore a11y_label_has_associated_control -->
    <label {...api.getLabelProps()}>Add tags (duplicates allowed):</label>
    <div {...api.getControlProps()}>
      {#each api.value as value, index (`${toDashCase(value)}-tag-${index}`)}
        <span {...api.getItemProps({ index, value })}>
          <div {...api.getItemPreviewProps({ index, value })}>
            <span {...api.getItemTextProps({ index, value })}>{value} </span>
            <button {...api.getItemDeleteTriggerProps({ index, value })}>
              <XIcon />
            </button>
          </div>
          <input {...api.getItemInputProps({ index, value })} />
        </span>
      {/each}
      <input placeholder="Try adding React or Vue again..." {...api.getInputProps()} />
      <button {...api.getClearTriggerProps()}>
        <XIcon />
      </button>
    </div>
    <input {...api.getHiddenInputProps()} />
  </div>
</main>

<Toolbar controls={null}>
  <StateVisualizer state={service} />
</Toolbar>
