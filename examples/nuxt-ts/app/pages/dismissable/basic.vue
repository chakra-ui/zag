<template>
  <main>
    <DismissablePopover id="1" background="pink" pointer-blocking>
      <p>This is a popover.</p>
      <input placeholder="Initial...." />
      <DismissablePopover id="2" background="green">
        <p>This is a nested popover.</p>
        <input placeholder="Nested 1...." />
        <DismissablePopover id="3" background="teal" pointer-blocking>
          <p>This is a nested popover.</p>
          <input placeholder="Nested 2...." />
        </DismissablePopover>
      </DismissablePopover>
    </DismissablePopover>
  </main>
</template>
