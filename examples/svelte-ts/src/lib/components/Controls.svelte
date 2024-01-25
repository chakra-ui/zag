<script lang="ts">
	import type { UseControlsReturn } from '$lib/use-controls.svelte';
	import { deepGet } from '@zag-js/shared';

	const { controls } = $props<{
		controls: UseControlsReturn;
	}>();
</script>

<div class="controls-container">
	{#each Object.keys(controls.config) as key}
		{@const { type, label = key, options, placeholder, min, max } = (controls.config[key] ?? {}) as any}
		{@const value = deepGet(controls.state, key)}
		{#if type === 'boolean'}
			<div class="checkbox">
				<input
					data-testid={key}
					id={label}
					type="checkbox"
					checked={value}
					oninput={(e) => {
          controls.setState(key, (e.target as HTMLInputElement).checked)
        }}
				/>
				<label for={label}>{label}</label>
			</div>
		{:else if type === 'string'}
			<div class="text">
				<label for={label} style="margin-right: 10px;">{label}</label>
				<input
					data-testid={key}
					id={label}
					type="text"
					{placeholder}
					{value}
					onkeydown={(event) => {
          if (event.key === "Enter") {
            controls.setState(key, (event.target as HTMLInputElement).value)
          }
        }}
				/>
			</div>
		{:else if type === 'select'}
			<div class="text">
				<label for={label} style="margin-right: 10px;">
					{label}
				</label>
				<select
					data-testid={key}
					id={label}
					{value}
					onchange={(e) => {
            controls.setState(key, (e.target as HTMLInputElement).value)
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
		{:else if type === 'number'}
			<div class="text">
				<label for={label} style="margin-right: 10px;">
					{label}
				</label>
				<input
					data-testid={key}
					id={label}
					type="number"
					{min}
					{max}
					{value}
					onkeydown={(e) => {
          if (e.key === "Enter") {
            const val = parseFloat((e.target as HTMLInputElement).value)
            controls.setState(key, isNaN(val) ? 0 : val)
          }
        }}
				/>
			</div>
		{:else if type === 'number'}{/if}
	{/each}
</div>
