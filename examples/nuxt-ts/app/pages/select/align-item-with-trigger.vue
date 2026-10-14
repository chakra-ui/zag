<script setup lang="ts">
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

<template>
  <main class="select">
    <!-- Fill the canvas (below the playground top bar), not the viewport -->
    <div
      style="
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        padding: 16px;
        pointer-events: none;
      "
    >
      <div style="pointer-events: auto; text-align: center">
        <p style="font-size: 13px; color: #666; margin: 0 0 8px">
          Top edge — fallback (insufficient space above for alignment)
        </p>
        <SelectAlignedSelect label="Top" :items="items" default-value="pineapple" />
      </div>

      <div style="pointer-events: auto; text-align: center">
        <p style="font-size: 13px; color: #666; margin: 0 0 8px">
          Middle — aligned: selected item overlaps trigger value
        </p>
        <SelectAlignedSelect label="Middle" :items="items" default-value="mango" />
      </div>

      <div style="pointer-events: auto; text-align: center">
        <p style="font-size: 13px; color: #666; margin: 0 0 8px">
          Bottom edge — falls back to standard positioning (opens above)
        </p>
        <SelectAlignedSelect label="Bottom" :items="items" default-value="watermelon" />
      </div>
    </div>
  </main>

  <Toolbar viz>
    <div />
  </Toolbar>
</template>
