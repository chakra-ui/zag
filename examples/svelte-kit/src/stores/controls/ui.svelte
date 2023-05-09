<script lang="ts">
  import { useControls } from "."

  export let controls: Record<string, any>
  export let ctx: ReturnType<typeof useControls>
</script>

<div class="controls-container">
  {#each Object.keys(controls) as key}
    {@const { type, label = key, options, placeholder, min, max } = controls[key] ?? {}}
    {#if type === "boolean"}
      <div class="checkbox">
        <input
          data-testid={key}
          id={label}
          type="checkbox"
          on:change={(e) => ctx.update((s) => ({ ...s, [key]: e.currentTarget?.checked }))}
          checked={$ctx[key]}
        />
        <label for={label}>{label}</label>
      </div>
    {:else if type === "string"}
      <div class="text">
        <label style="margin-right:10px">{label}</label>
        <input
          data-testid={key}
          type="text"
          {placeholder}
          value={$ctx[key]}
          on:keydown={(e) => {
            if (e.key === "Enter") {
              ctx.update((s) => ({ ...s, [key]: e.currentTarget.value }))
            }
          }}
        />
      </div>
    {:else if type === "select"}
      <div class="text">
        <label for={label} style="margin-right:10px">
          {label}
        </label>
        <select
          data-testid={key}
          id={label}
          value={$ctx[key]}
          on:change={(e) => {
            ctx.update((s) => ({ ...s, [key]: e.currentTarget.value }))
          }}
        >
          <option>-----</option>
          {#each options as option}
            <option value={option}>
              {option}
            </option>
          {/each}
        </select>
      </div>
    {:else if type === "number"}
      <div class="text">
        <label for={label} style="margin-right:10px">
          {label}
        </label>
        <input
          data-testid={key}
          id={label}
          type="number"
          {min}
          {max}
          value={$ctx[key]}
          on:keydown={(e) => {
            if (e.key === "Enter") {
              const val = parseFloat(e.currentTarget.value)
              ctx.update((s) => ({ ...s, [key]: isNaN(val) ? 0 : val }))
            }
          }}
        />
      </div>
    {/if}
  {/each}
</div>
