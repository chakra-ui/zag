<script lang="ts">
  import * as collapsible from "@zag-js/collapsible"
  import { normalizeProps, useMachine } from "@zag-js/svelte"

  interface Props {
    value: number
    open: boolean
  }

  const props: Props = $props()

  // Counts renders; non-reactive on purpose
  let renders = 0
  const countRender = () => ++renders

  const id = $props.id()
  const service = useMachine(collapsible.machine, () => ({ id, open: props.open }))

  const api = $derived(collapsible.connect(service, normalizeProps))
</script>

<div {...api.getRootProps()}>
  <div {...api.getContentProps()}>
    <div
      style="display: flex; justify-content: center; align-items: center; min-width: 400px; height: 64px; background-color: lightgray"
    >
      {props.value}
      {countRender()}
    </div>
  </div>
  <div>{String(service.context.get("initial"))}</div>
</div>
