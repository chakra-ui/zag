<script setup lang="ts">
import "@styles/collapsible.css"
</script>

<template>
  <main>
    <CollapsibleNestedItem trigger="Collapsible Depth 1" debug>
      <p>
        Lorem dfd dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
        magna sfsd. Ut enim ad minimdfd v eniam
      </p>
      <CollapsibleNestedItem trigger="Sibling 1 / Collapsible Depth 2">
        <p>
          Lorem dfd dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
          magna sfsd. Ut enim ad minimdfd v eniam
        </p>
        <CollapsibleNestedItem trigger="Collapsible Depth 3">
          <p>
            Lorem dfd dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
            magna sfsd. Ut enim ad minimdfd v eniam
          </p>
          <CollapsibleNestedItem trigger="Collapsible Depth 4">
            <p>
              Lorem dfd dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
              dolore magna sfsd. Ut enim ad minimdfd.
            </p>
            <CollapsibleNestedItem trigger="Collapsible Depth 5">
              <p>
                Lorem dfd dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
                dolore magna sfsd. Ut enim ad minimdfd v eniam
              </p>
            </CollapsibleNestedItem>
          </CollapsibleNestedItem>
        </CollapsibleNestedItem>
      </CollapsibleNestedItem>

      <CollapsibleNestedItem trigger="Sibling 2">
        <p>
          Lorem dfd dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
          magna sfsd. Ut enim ad minimdfd v eniam
        </p>
      </CollapsibleNestedItem>
    </CollapsibleNestedItem>
  </main>
</template>
