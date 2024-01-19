<script lang="ts">
	import { page } from '$app/stores';
	import { dataAttr } from '@zag-js/dom-query';
	import { routesData } from '@zag-js/shared';
	import '../../../../shared/src/style.css';

	const sortedRoutes = routesData.sort((a, b) => a.label.localeCompare(b.label));
</script>

<div class="page">
	<aside class="nav">
		<header>
			<a href="/">Zagjs</a>
		</header>
		{#each sortedRoutes as route}
			{@const active = $page.url.pathname === route.path}
			<a data-active={dataAttr(active)} href={route.path}>{route.label}</a>
		{/each}
	</aside>
	<slot />
</div>
