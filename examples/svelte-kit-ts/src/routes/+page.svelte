<script lang="ts">
	import { routesData } from '@zag-js/shared';
</script>

<div class="index-nav">
	<h2>Svelte UI Machines</h2>
	<ul>
		{#each routesData as route}
			<li>
				<a href={route.path}>{route.label}</a>
			</li>
		{/each}
	</ul>
</div>
