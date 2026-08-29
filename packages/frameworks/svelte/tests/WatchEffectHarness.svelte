<script lang="ts">
  import { useMachine } from "../src"

  let { machine, initial, onReady }: { machine: any; initial: any; onReady: (api: any) => void } = $props()

  let machineProps = $state(initial)

  // svelte-ignore state_referenced_locally
  const service = useMachine<any>(machine, () => machineProps)

  // svelte-ignore state_referenced_locally
  onReady({
    service,
    setProps: (next: any) => {
      machineProps = next
    },
  })
</script>
