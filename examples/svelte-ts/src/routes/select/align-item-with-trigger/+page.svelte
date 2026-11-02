<script lang="ts">
  import SelectAligned from "#lib/components/select-aligned.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import "@styles/select.css"

  const items = [
    { label: "Apple", value: "apple" },
    { label: "Banana", value: "banana" },
    { label: "Blueberry", value: "blueberry" },
    { label: "Cherry", value: "cherry" },
    { label: "Date", value: "date" },
    { label: "Elderberry", value: "elderberry" },
    { label: "Fig", value: "fig" },
    { label: "Grape", value: "grape" },
    { label: "Honeydew", value: "honeydew" },
    { label: "Kiwi", value: "kiwi" },
    { label: "Lemon", value: "lemon" },
    { label: "Mango", value: "mango" },
    { label: "Nectarine", value: "nectarine" },
    { label: "Orange", value: "orange" },
    { label: "Papaya", value: "papaya" },
    { label: "Peach", value: "peach" },
    { label: "Pear", value: "pear" },
    { label: "Pineapple", value: "pineapple" },
    { label: "Plum", value: "plum" },
    { label: "Raspberry", value: "raspberry" },
    { label: "Strawberry", value: "strawberry" },
    { label: "Watermelon", value: "watermelon" },
  ]
</script>

<main class="select">
  <!-- Fill the canvas (below the playground top bar), not the viewport -->
  <div
    style="position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: space-between; align-items: center; padding: 16px; pointer-events: none"
  >
    <div style="pointer-events: auto; text-align: center">
      <p style="font-size: 13px; color: #666; margin: 0 0 8px">
        Top edge — fallback (insufficient space above for alignment)
      </p>
      <SelectAligned {items} label="Top" defaultValue="pineapple" />
    </div>

    <div style="pointer-events: auto; text-align: center">
      <p style="font-size: 13px; color: #666; margin: 0 0 8px">
        Middle — aligned: selected item overlaps trigger value
      </p>
      <SelectAligned {items} label="Middle" defaultValue="mango" />
    </div>

    <div style="pointer-events: auto; text-align: center">
      <p style="font-size: 13px; color: #666; margin: 0 0 8px">
        Bottom edge — falls back to standard positioning (opens above)
      </p>
      <SelectAligned {items} label="Bottom" defaultValue="watermelon" />
    </div>
  </div>
</main>

<Toolbar viz>
  <div></div>
</Toolbar>
