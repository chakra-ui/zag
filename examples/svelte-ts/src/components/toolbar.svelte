<script>
	import { dataAttr } from '@zag-js/dom-query';
</script>

<div class="toolbar">
	<nav>
		<button> Visualizer </button>
	</nav>
	<div>
		<div data-content data-active={dataAttr(true)}>
			<slot />
		</div>
	</div>
</div>
