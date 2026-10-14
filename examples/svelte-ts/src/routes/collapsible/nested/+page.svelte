<script lang="ts">
  import Collapsible from "$lib/components/collapsible-nested-item.svelte"
  import "@styles/collapsible.css"
</script>

<main>
  <Collapsible trigger="Collapsible Depth 1" debug>
    <p>
      Lorem dfd dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna
      sfsd. Ut enim ad minimdfd v eniam
    </p>
    <Collapsible trigger="Sibling 1 / Collapsible Depth 2">
      <p>
        Lorem dfd dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
        magna sfsd. Ut enim ad minimdfd v eniam
      </p>
      <Collapsible trigger="Collapsible Depth 3">
        <p>
          Lorem dfd dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
          magna sfsd. Ut enim ad minimdfd v eniam
        </p>
        <Collapsible trigger="Collapsible Depth 4">
          <p>
            Lorem dfd dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
            magna sfsd. Ut enim ad minimdfd.
          </p>
          <Collapsible trigger="Collapsible Depth 5">
            <p>
              Lorem dfd dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
              dolore magna sfsd. Ut enim ad minimdfd v eniam
            </p>
          </Collapsible>
        </Collapsible>
      </Collapsible>
    </Collapsible>

    <Collapsible trigger="Sibling 2">
      <p>
        Lorem dfd dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
        magna sfsd. Ut enim ad minimdfd v eniam
      </p>
    </Collapsible>
  </Collapsible>
</main>
