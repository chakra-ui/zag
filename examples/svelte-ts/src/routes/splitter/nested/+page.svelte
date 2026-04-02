<script lang="ts">
  import * as splitter from "@zag-js/splitter"
  import Splitter, { getSplitterApi } from "$lib/components/splitter.svelte"

  const registry = splitter.registry({
    hitAreaMargins: { coarse: 15, fine: 8 },
  })
</script>

<main>
  <Splitter
    orientation="horizontal"
    defaultSize={[20, 60, 20]}
    panels={[{ id: "left" }, { id: "center" }, { id: "right" }]}
    {registry}
  >
    {@const api = getSplitterApi()}
    <div {...api().getPanelProps({ id: "left" })}>
      <div style="background: #f0f8ff; padding: 20px; width: 100%; height: 100%">
        <h3>Left Panel</h3>
      </div>
    </div>
    <div {...api().getResizeTriggerProps({ id: "left:center" })}></div>
    <div {...api().getPanelProps({ id: "center" })}>
      <Splitter
        orientation="vertical"
        panels={[{ id: "top" }, { id: "middle" }, { id: "bottom" }]}
        {registry}
      >
        {@const vApi = getSplitterApi()}
        <div {...vApi().getPanelProps({ id: "top" })}>
          <div style="background: #fff0f5; padding: 20px; width: 100%; height: 100%">
            <h3>Top Panel</h3>
          </div>
        </div>
        <div {...vApi().getResizeTriggerProps({ id: "top:middle" })}></div>
        <div {...vApi().getPanelProps({ id: "middle" })}>
          <div style="background: #f0fff0; padding: 20px; width: 100%; height: 100%">
            <h3>Middle Panel</h3>
          </div>
        </div>
        <div {...vApi().getResizeTriggerProps({ id: "middle:bottom" })}></div>
        <div {...vApi().getPanelProps({ id: "bottom" })}>
          <div style="background: #fffacd; padding: 20px; width: 100%; height: 100%">
            <h3>Bottom Panel</h3>
          </div>
        </div>
      </Splitter>
    </div>
    <div {...api().getResizeTriggerProps({ id: "center:right" })}></div>
    <div {...api().getPanelProps({ id: "right" })}>
      <div style="background: #f5f5dc; padding: 20px; width: 100%; height: 100%">
        <h3>Right Panel</h3>
      </div>
    </div>
  </Splitter>

  <p style="margin-top: 20px">
    Drag at the intersection of resize handles to resize both directions simultaneously.
  </p>
</main>
