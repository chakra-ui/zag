<script lang="ts" module>
  import * as splitter from "@zag-js/splitter"
  import { getContext } from "svelte"

  const KEY = Symbol("splitter-api")

  export function getSplitterApi(): () => splitter.Api {
    return getContext(KEY)
  }
</script>

<script lang="ts">
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { setContext, type Snippet } from "svelte"

  interface Props extends Omit<splitter.Props, "id"> {
    children: Snippet
  }

  const { children, ...props }: Props = $props()

  const id = $props.id()
  const service = useMachine(splitter.machine, () => ({ ...props, id }))

  const api = $derived(splitter.connect(service, normalizeProps))

  setContext(KEY, () => api)
</script>

<div {...api.getRootProps()}>
  {@render children()}
</div>
