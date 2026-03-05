<script lang="ts">
  import { componentRoutesData } from "@zag-js/shared"
</script>

<div class="index-nav">
  <h2>Svelte UI Machines</h2>
  <ul>
    {#each componentRoutesData as component}
      <li>
        <a href={`/${component.slug}`}>{component.label}</a>
      </li>
    {/each}
  </ul>
</div>
