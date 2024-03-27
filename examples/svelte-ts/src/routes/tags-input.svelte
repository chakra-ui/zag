<script lang="ts">
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import { tagsInputControls } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import * as tagsInput from "@zag-js/tags-input"

  function toDashCase(str: string) {
    return str.replace(/\s+/g, "-").toLowerCase()
  }

  const controls = useControls(tagsInputControls)

  const [_state, send] = useMachine(
    tagsInput.machine({
      id: "1",
      value: ["React", "Vue"],
    }),
    {
      context: controls.context,
    },
  )

  const api = $derived(tagsInput.connect(_state, send, normalizeProps))
</script>

<main class="tags-input">
  <div {...api.rootProps}>
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label {...api.labelProps}>Enter frameworks:</label>
    <div {...api.controlProps}>
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

      <input data-testid="input" placeholder="add tag" {...api.inputProps} />
    </div>
    <input {...api.hiddenInputProps} />
  </div>
</main>

<Toolbar {controls} state={_state} />
