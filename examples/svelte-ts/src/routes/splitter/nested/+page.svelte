<script lang="ts">
  import Panel from "$lib/components/splitter-panel.svelte"
  import PanelGroup from "$lib/components/splitter-panel-group.svelte"
  import ResizeTrigger from "$lib/components/splitter-resize-trigger.svelte"
  import * as splitter from "@zag-js/splitter"
  import "@styles/splitter.css"

  const registry = splitter.registry({
    // Touch-friendly margins
    hitAreaMargins: { coarse: 15, fine: 8 },
  })
</script>

<main>
  <div style="margin-bottom: 20px">
    <h2>Nested Splitters with Multi-Drag</h2>
    <p>
      Try dragging at the intersection of the horizontal and vertical resize handles. When your cursor is at the
      intersection, both splitters will resize simultaneously!
    </p>
  </div>

  <PanelGroup
    orientation="horizontal"
    defaultSize={[20, 60, 20]}
    panels={[{ id: "left" }, { id: "center" }, { id: "right" }]}
    {registry}
  >
    <Panel id="left">
      <div style="background: #f0f8ff; padding: 20px; width: 100%; height: 100%">
        <h3>Left Panel</h3>
        <p>This is a fixed horizontal panel.</p>
      </div>
    </Panel>
    <ResizeTrigger id="left:center" />
    <Panel id="center">
      <PanelGroup orientation="vertical" panels={[{ id: "top" }, { id: "middle" }, { id: "bottom" }]} {registry}>
        <Panel id="top">
          <div style="background: #fff0f5; padding: 20px; width: 100%; height: 100%">
            <h3>Top Panel</h3>
            <p>This is the top section of the vertical splitter.</p>
          </div>
        </Panel>
        <ResizeTrigger id="top:middle" />
        <Panel id="middle">
          <div style="background: #f0fff0; padding: 20px; width: 100%; height: 100%">
            <h3>Middle Panel</h3>
            <p>
              <strong>Multi-drag intersection zone:</strong> Move your cursor to the left edge of this panel where it meets
              the horizontal resize handle. You'll see the cursor change to a "move" cursor, allowing you to resize both dimensions
              at once!
            </p>
          </div>
        </Panel>
        <ResizeTrigger id="middle:bottom" />
        <Panel id="bottom">
          <div style="background: #fffacd; padding: 20px; width: 100%; height: 100%">
            <h3>Bottom Panel</h3>
            <p>This is the bottom section.</p>
          </div>
        </Panel>
      </PanelGroup>
    </Panel>
    <ResizeTrigger id="center:right" />
    <Panel id="right">
      <div style="background: #f5f5dc; padding: 20px; width: 100%; height: 100%">
        <h3>Right Panel</h3>
        <p>This is a fixed horizontal panel.</p>
      </div>
    </Panel>
  </PanelGroup>

  <p style="margin-top: 20px">Drag at the intersection of resize handles to resize both directions simultaneously.</p>
</main>
