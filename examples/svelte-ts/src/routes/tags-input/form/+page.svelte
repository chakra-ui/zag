<script lang="ts">
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import { useControls } from "#lib/use-controls.svelte.ts"
  import { tagsInputControls } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import * as tagsInput from "@zag-js/tags-input"
  import { XIcon } from "lucide-svelte"
  import "@styles/tags-input.css"

  function toDashCase(str: string) {
    return str.replace(/\s+/g, "-").toLowerCase()
  }

  const controls = useControls(tagsInputControls)

  let submitCount = $state(0)
  let lastSubmit = $state<string | null>(null)

  const id = $props.id()
  const service = useMachine(
    tagsInput.machine,
    controls.mergeProps<tagsInput.Props>({
      id,
      name: "tags",
      defaultValue: ["React", "Vue"],
    }),
  )

  const api = $derived(tagsInput.connect(service, normalizeProps))
</script>

<main class="tags-input">
  <form
    onsubmit={(e) => {
      e.preventDefault()
      const data = new FormData(e.currentTarget)
      const value = String(data.get("tags") ?? "")
      submitCount++
      lastSubmit = value
    }}
  >
    <div {...api.getRootProps()}>
      <!-- svelte-ignore a11y_label_has_associated_control -->
      <label {...api.getLabelProps()}>Enter frameworks:</label>
      <div {...api.getControlProps()}>
        {#each api.value as value, index (`${toDashCase(value)}-tag-${index}`)}
          <span {...api.getItemProps({ index, value })}>
            <div data-testid={`${toDashCase(value)}-tag`} {...api.getItemPreviewProps({ index, value })}>
              <span data-testid={`${toDashCase(value)}-valuetext`} {...api.getItemTextProps({ index, value })}>
                {value}{" "}
              </span>
              <button
                data-testid={`${toDashCase(value)}-close-button`}
                {...api.getItemDeleteTriggerProps({ index, value })}
              >
                <XIcon />
              </button>
            </div>
            <input data-testid={`${toDashCase(value)}-input`} {...api.getItemInputProps({ index, value })} />
          </span>
        {/each}
        <input data-testid="input" placeholder="add tag" {...api.getInputProps()} />
        <button type="button" {...api.getClearTriggerProps()}>
          <XIcon />
        </button>
      </div>
      <input {...api.getHiddenInputProps()} />
    </div>

    <div style="margin-top: 16px">
      <button type="submit">Submit</button>
    </div>
  </form>

  <section style="margin-top: 16px">
    <strong>submit count:</strong> <span data-testid="submit-count">{submitCount}</span>
    <br />
    <strong>last submitted value:</strong> <span data-testid="last-submit">{lastSubmit ?? "—"}</span>
  </section>
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} />
</Toolbar>
