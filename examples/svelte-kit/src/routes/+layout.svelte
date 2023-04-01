<script>
	import { page } from '$app/stores';
	// The country-list package used in shared prevents us from using the zag-shared package, because it uses require, and sveltekit has issues with that
	import '../../../../shared/src/style.css';
	import { routesData } from '../../../../shared/src/routes';
	import { dataAttr } from '@zag-js/dom-query';

	const routes = routesData.sort((a, b) => a.label.localeCompare(b.label));
</script>

<svelte:head>
	<title>Svelte Machines</title>
</svelte:head>

<div class="page">
	<aside class="nav">
		<header>Zagjs</header>

		{#each routes as route}
			<a data-active={dataAttr($page.url.pathname === route.path)} href={route.path}>
				{route.label}
			</a>
		{/each}
	</aside>
	<slot />
</div>
