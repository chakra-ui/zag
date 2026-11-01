<script lang="ts">
  import Popover from "#lib/components/dismissable-popover.svelte"
</script>

<div>
  <iframe title="sdfdsfs" src="https://motion.dev/"></iframe>
  <Popover id="1" background="pink" pointerBlocking>
    <p>This is a popover.</p>
    <input placeholder="Initial...." />
    <Popover id="2" background="green">
      <p>This is a nested popover.</p>
      <input placeholder="Nested 1...." />
      <Popover id="3" background="teal" pointerBlocking>
        <p>This is a nested popover.</p>
        <input placeholder="Nested 2...." />
      </Popover>
    </Popover>
  </Popover>
</div>
