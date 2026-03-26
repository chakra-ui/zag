<script lang="ts">
  import { useMachine } from "../src"

  interface MachineHarnessProps {
    machine: any
    machineProps?: any
    onReady: (service: any) => void
  }

  let { machine, machineProps, onReady }: MachineHarnessProps = $props()

  // svelte-ignore state_referenced_locally
  const service = useMachine<any>(machine, () => machineProps ?? {})

  // svelte-ignore state_referenced_locally
  onReady(service)
</script>
