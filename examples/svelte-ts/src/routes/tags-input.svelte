<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import { tagsInputControls } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import * as tagsInput from "@zag-js/tags-input"

  function toDashCase(str: string) {
    return str.replace(/\s+/g, "-").toLowerCase()
  }

  const controls = useControls(tagsInputControls)

  const id = $props.id()
  const service = useMachine(tagsInput.machine, {
    id,
    defaultValue: ["React", "Vue"],
  })

  const api = $derived(tagsInput.connect(service, normalizeProps))
</script>

<main class="tags-input">
  <div {...api.getRootProps()}>
    <!-- svelte-ignore a11y_label_has_associated_control -->
    <label {...api.getLabelProps()}>Enter frameworks:</label>
    <div {...api.getControlProps()}>
      {#each api.value as value, index}
        <span {...api.getItemProps({ index, value })}>
          <div data-testid={`${toDashCase(value)}-tag`} {...api.getItemPreviewProps({ index, value })}>
            <span data-testid={`${toDashCase(value)}-valuetext`} {...api.getItemTextProps({ index, value })}>
              {value}{" "}
            </span>
            <button
              data-testid={`${toDashCase(value)}-close-button`}
              {...api.getItemDeleteTriggerProps({ index, value })}
            >
              &#x2715;
            </button>
          </div>
          <input data-testid={`${toDashCase(value)}-input`} {...api.getItemInputProps({ index, value })} />
        </span>
      {/each}

      <input data-testid="input" placeholder="add tag" {...api.getInputProps()} />
    </div>
    <input {...api.getHiddenInputProps()} />
  </div>
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} />
</Toolbar>
