<script lang="ts">
  import MachineHarness from "./MachineHarness.svelte"
  import SetOnMount from "./SetOnMount.svelte"

  let { machine, next }: { machine: any; next: boolean } = $props()

  let value = $state(false)
</script>

<!-- An earlier sibling's effect writes the prop before the machine's watch first runs. -->
<SetOnMount set={() => (value = next)} />
<MachineHarness {machine} machineProps={{ value }} onReady={() => {}} />
