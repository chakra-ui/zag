<script lang="ts">
  import MachineHarness from "./MachineHarness.svelte"

  let { machine, valueOnMount }: { machine: any; valueOnMount: boolean } = $props()

  let value = $state(false)
</script>

<!-- Runs before the machine's watch effect, like an earlier sibling's effect -->
<div {@attach () => void (value = valueOnMount)}></div>
<MachineHarness {machine} machineProps={{ value }} onReady={() => {}} />
