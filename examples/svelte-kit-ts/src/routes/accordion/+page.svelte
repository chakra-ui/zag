<script lang="ts">
	import Toolbar from '$lib/components/Toolbar.svelte';
	import { useControls } from '$lib/use-controls.svelte';
	import * as accordion from '@zag-js/accordion';
	import { accordionControls, accordionData } from '@zag-js/shared';
	import { normalizeProps, useMachine } from '@zag-js/svelte';
	import { unstate } from 'svelte';

	const controls = useControls(accordionControls);

	const machine = useMachine(accordion.machine({ id: '1' }), {
		context: controls.state
	});

	const api = $derived(accordion.connect(unstate(machine.state), machine.send, normalizeProps));
</script>

<main class="accordion">
	<div {...api.rootProps}>
		{#each accordionData as item}
			<div {...api.getItemProps({ value: item.id })}>
				<h3>
					<button
						data-testid={`${item.id}:trigger`}
						{...api.getItemTriggerProps({ value: item.id })}
					>
						{item.label}
						<div {...api.getItemIndicatorProps({ value: item.id })}>{'>'}</div>
					</button>
				</h3>
				<div data-testid={`${item.id}:content`} {...api.getItemContentProps({ value: item.id })}>
					Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
					ut labore et dolore magna aliqua.
				</div>
			</div>
		{/each}
	</div>
</main>

<Toolbar {controls} {machine} />
