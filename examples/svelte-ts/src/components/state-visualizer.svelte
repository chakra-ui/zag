<script lang="ts">
	import { stringifyState } from '../../../../shared/src/stringify-state';

	export let label = 'Visualizer';
	export let omit: string[] = [];
	export let state: Record<string, any>;
</script>

<div class="viz">
	<pre dir="ltr">
      <details open>
        <summary> {label || 'Visualizer'} </summary>
        <div>{@html stringifyState(state, omit)}</div>
      </details>
    </pre>
</div>
