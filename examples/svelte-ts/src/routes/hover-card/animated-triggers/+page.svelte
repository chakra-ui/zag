<script lang="ts">
  import Portal from "#lib/components/portal.svelte"
  import Presence from "#lib/components/presence.svelte"
  import * as hoverCard from "@zag-js/hover-card"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/hover-card-viewport.css"

  const people = [
    { value: "ada", name: "Ada Lovelace", bio: "Wrote the first published program." },
    {
      value: "grace",
      name: "Grace Hopper",
      bio: "Built the first compiler, and popularized the word bug in computing.",
    },
    { value: "alan", name: "Alan Turing", bio: "Defined computation." },
  ]

  const getPerson = (value: string) => people.find((person) => person.value === value)!

  const id = $props.id()
  const service = useMachine(hoverCard.machine, {
    id,
    positioning: { placement: "bottom" },
  })

  const api = $derived(hoverCard.connect(service, normalizeProps))
</script>

<main class="hover-card animated-triggers">
  <p>
    Early computing owes a lot to
    {#each people as person, index (person.value)}
      <span
        ><a href="#" {...api.getTriggerProps({ value: person.value })}>{person.name}</a>{index < people.length - 1
          ? ", "
          : "."}</span
      >
    {/each}
  </p>

  <Portal>
    <div {...api.getPositionerProps()}>
      <Presence {...api.getArrowProps()}>
        <div {...api.getArrowTipProps()}></div>
      </Presence>
      <Presence {...api.getViewportProps()}>
        {#each api.getContentValues() as value (value)}
          <Presence {...api.getContentProps({ value })}>
            <strong>{getPerson(value).name}</strong>
            <p>{getPerson(value).bio}</p>
          </Presence>
        {/each}
      </Presence>
    </div>
  </Portal>
</main>
