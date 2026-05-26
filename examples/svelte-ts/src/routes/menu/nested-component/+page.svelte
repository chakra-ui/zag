<script lang="ts">
  import NestedMenu from "$lib/components/nested-menu.svelte"
  import Portal from "$lib/components/portal.svelte"
</script>

<main>
  <div>
    <NestedMenu>
      {#snippet children({ api: root })}
        <button {...root.getTriggerProps()}>File <span {...root.getIndicatorProps()}>▾</span></button>

        <Portal>
          <div {...root.getPositionerProps()}>
            <ul data-testid="menu" {...root.getContentProps()}>
              <li {...root.getItemProps({ value: "new-file" })}>New File</li>
              <li {...root.getItemProps({ value: "open" })}>Open...</li>

              <!-- Submenu: Share -->
              <NestedMenu>
                {#snippet children({ api: share, triggerItemProps })}
                  <li {...triggerItemProps}>Share →</li>
                  <Portal>
                    <div {...share.getPositionerProps()}>
                      <ul data-testid="share-submenu" {...share.getContentProps()}>
                        <li {...share.getItemProps({ value: "email" })}>Email</li>
                        <li {...share.getItemProps({ value: "message" })}>Message</li>
                        <li {...share.getItemProps({ value: "airdrop" })}>AirDrop</li>
                      </ul>
                    </div>
                  </Portal>
                {/snippet}
              </NestedMenu>

              <!-- Submenu: Export -->
              <NestedMenu>
                {#snippet children({ api: exp, triggerItemProps: exportTrigger })}
                  <li {...exportTrigger}>Export →</li>
                  <Portal>
                    <div {...exp.getPositionerProps()}>
                      <ul data-testid="export-submenu" {...exp.getContentProps()}>
                        <li {...exp.getItemProps({ value: "pdf" })}>PDF</li>
                        <li {...exp.getItemProps({ value: "png" })}>PNG</li>
                        <li {...exp.getItemProps({ value: "svg" })}>SVG</li>
                      </ul>
                    </div>
                  </Portal>
                {/snippet}
              </NestedMenu>

              <li {...root.getItemProps({ value: "print" })}>Print...</li>
            </ul>
          </div>
        </Portal>
      {/snippet}
    </NestedMenu>
  </div>
</main>
