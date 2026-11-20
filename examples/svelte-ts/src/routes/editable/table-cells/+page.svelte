<script lang="ts">
  import EditableNameCell from "#lib/components/editable-name-cell.svelte"
  import "@styles/editable.css"

  const people = [
    { name: "Ada Lovelace", role: "Engineering" },
    { name: "Grace Hopper", role: "Platform" },
    { name: "Alan Turing", role: "Research" },
  ]

  let activity = $state<string[]>([])
  const log = (entry: string) => (activity = [entry, ...activity])
</script>

<main>
  <div class="editable-table-cells">
    <p class="hint">Double-click a name to rename it</p>
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Team</th>
        </tr>
      </thead>
      <tbody>
        {#each people as person, index (person.name)}
          <tr>
            <td><EditableNameCell row={index + 1} defaultName={person.name} onLog={log} /></td>
            <td>{person.role}</td>
          </tr>
        {/each}
      </tbody>
    </table>
    <ol class="activity" aria-label="Activity" reversed>
      {#each activity as entry, index (activity.length - index)}
        <li>{entry}</li>
      {/each}
    </ol>
  </div>
</main>
