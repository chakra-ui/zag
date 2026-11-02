<script lang="ts">
  import ListBox from "#lib/components/listbox-transfer-list.svelte"
  import * as listbox from "@zag-js/listbox"
  import "@styles/listbox.css"

  interface Item {
    label: string
    value: string
  }

  let source = $state.raw(
    listbox.collection<Item>({
      items: [
        { label: "Naruto", value: "naruto" },
        { label: "Sasuke", value: "sasuke" },
        { label: "Sakura", value: "sakura" },
        { label: "Kakashi", value: "kakashi" },
        { label: "Shisui", value: "shisui" },
      ],
    }),
  )

  let target = $state.raw(
    listbox.collection<Item>({
      items: [],
    }),
  )

  let selectedSource = $state.raw<Item[]>([])
  let selectedTarget = $state.raw<Item[]>([])
</script>

<main class="listbox">
  <div style="display: flex; gap: 1rem; width: 100%">
    <ListBox
      collection={source}
      label="Source"
      value={selectedSource.map((item) => item.value)}
      onValueChange={(e) => (selectedSource = e.items)}
    />
    <div style="display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem">
      <button
        onclick={() => {
          source = source.remove(...selectedSource)
          target = target.append(...selectedSource)
          selectedSource = []
        }}
      >
        Move Right
      </button>
      <button
        onclick={() => {
          source = source.append(...selectedTarget)
          target = target.remove(...selectedTarget)
          selectedTarget = []
        }}
      >
        Move Left
      </button>
    </div>
    <ListBox
      collection={target}
      label="Target"
      value={selectedTarget.map((item) => item.value)}
      onValueChange={(e) => (selectedTarget = e.items)}
    />
  </div>
</main>
