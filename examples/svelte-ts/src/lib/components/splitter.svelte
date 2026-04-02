<script lang="ts" module>
  import * as splitter from "@zag-js/splitter"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { getContext, setContext } from "svelte"

  const SPLITTER_API_KEY = "splitter-api"

  export function getSplitterApi(): () => splitter.Api {
    return getContext(SPLITTER_API_KEY)
  }

  export type { splitter }
</script>

<script lang="ts">
  import type { Snippet } from "svelte"

  interface Props extends Omit<splitter.Props, "id"> {
    children: Snippet
  }

  let { children, ...props }: Props = $props()

  const id = $props.id()
  const service = useMachine(splitter.machine, () => ({ ...props, id }))

  const api = $derived(splitter.connect(service, normalizeProps))

  setContext(SPLITTER_API_KEY, () => api)
</script>

<div {...api.getRootProps()}>
  {@render children()}
</div>
