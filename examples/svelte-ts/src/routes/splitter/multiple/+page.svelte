<script lang="ts">
  import Panel from "$lib/components/splitter-panel.svelte"
  import PanelGroup from "$lib/components/splitter-panel-group.svelte"
  import ResizeTrigger from "$lib/components/splitter-resize-trigger.svelte"
  import "@styles/splitter.css"
</script>

<main>
  <PanelGroup
    orientation="horizontal"
    defaultSize={[20, 60, 20]}
    panels={[
      { id: "a", order: 0, minSize: 20 },
      { id: "b", order: 1, collapsible: true },
      { id: "c", order: 2, minSize: 20 },
    ]}
  >
    <Panel id="a">Left</Panel>
    <ResizeTrigger id="a:b" />
    <Panel id="b">
      <PanelGroup
        orientation="vertical"
        panels={[
          { id: "b1", order: 0 },
          { id: "b2", order: 1, collapsible: true },
        ]}
      >
        <Panel id="b1">top</Panel>
        <ResizeTrigger id="b1:b2" />
        <Panel id="b2">
          <PanelGroup
            orientation="horizontal"
            panels={[
              { id: "b21", order: 0 },
              { id: "b22", order: 1, collapsible: true },
            ]}
          >
            <Panel id="b21">left</Panel>
            <ResizeTrigger id="b21:b22" />
            <Panel id="b22">right</Panel>
          </PanelGroup>
        </Panel>
      </PanelGroup>
    </Panel>
    <ResizeTrigger id="b:c" />
    <Panel id="c">right</Panel>
  </PanelGroup>
</main>
