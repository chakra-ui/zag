<script lang="ts">
  import DialogWrapper from "#lib/components/dialog-nesting-dialog.svelte"
  import PopoverWrapper from "#lib/components/dialog-nesting-popover.svelte"
  import "@styles/dialog.css"
  import "@styles/popover.css"
</script>

<main style="padding: 20px">
  <div style="display: flex; flex-direction: column; gap: 24px">
    <!-- Bug Case: Dialog -> Popover -> Dialog -->
    <section>
      <h3 style="font-weight: bold">Dialog 1 → Popover 1 → Dialog 2</h3>
      <div>
        <DialogWrapper trigger="Open Dialog 1">
          <PopoverWrapper trigger="Open Popover 1">
            <DialogWrapper trigger="Open Dialog 2">Dialog 2 Content</DialogWrapper>
          </PopoverWrapper>
        </DialogWrapper>
      </div>
      <p style="color: red; margin-top: 8px">BUG: Closing Dialog 2 closes Popover 1 and Dialog 1</p>
    </section>

    <!-- OK Case: Dialog -> Dialog -->
    <section>
      <h3 style="font-weight: bold">Dialog 1 → Dialog 2</h3>
      <div>
        <DialogWrapper trigger="Open Dialog 1">
          <DialogWrapper trigger="Open Dialog 2">Dialog 2 Content</DialogWrapper>
        </DialogWrapper>
      </div>
      <p style="color: green; margin-top: 8px">OK: Closing Dialog 2 keeps Dialog 1 open</p>
    </section>

    <!-- OK Case: Popover -> Dialog -->
    <section>
      <h3 style="font-weight: bold">Popover 1 → Dialog 1</h3>
      <div>
        <PopoverWrapper trigger="Open Popover 1">
          <DialogWrapper trigger="Open Dialog 1">Dialog 1 Content</DialogWrapper>
        </PopoverWrapper>
      </div>
      <p style="color: green; margin-top: 8px">OK: Closing Dialog 1 keeps Popover 1 open</p>
    </section>

    <!-- Additional Case: Dialog -> Popover -->
    <section>
      <h3 style="font-weight: bold">Dialog 1 → Popover 1</h3>
      <div>
        <DialogWrapper trigger="Open Dialog 1">
          <PopoverWrapper trigger="Open Popover 1">Popover 1 Content</PopoverWrapper>
        </DialogWrapper>
      </div>
      <p style="color: gray; margin-top: 8px">Test: Closing Popover 1 should keep Dialog 1 open</p>
    </section>

    <!-- Additional Case: Popover -> Popover -> Dialog -->
    <section>
      <h3 style="font-weight: bold">Popover 1 → Popover 2 → Dialog 1</h3>
      <div>
        <PopoverWrapper trigger="Open Popover 1">
          <PopoverWrapper trigger="Open Popover 2">
            <DialogWrapper trigger="Open Dialog 1">Dialog 1 Content</DialogWrapper>
          </PopoverWrapper>
        </PopoverWrapper>
      </div>
      <p style="color: gray; margin-top: 8px">Test: Closing Dialog 1 should keep both Popovers open</p>
    </section>

    <hr style="margin: 24px 0; border: 1px solid #ccc" />
    <h2 style="font-weight: bold; margin-bottom: 16px">Edge Cases</h2>

    <!-- Edge Case 1: Deep nesting (4 levels) -->
    <section>
      <h3 style="font-weight: bold">Deep: Dialog → Popover → Dialog → Popover</h3>
      <div>
        <DialogWrapper trigger="Open Dialog 1">
          <PopoverWrapper trigger="Open Popover 1">
            <DialogWrapper trigger="Open Dialog 2">
              <PopoverWrapper trigger="Open Popover 2">Deep nested content</PopoverWrapper>
            </DialogWrapper>
          </PopoverWrapper>
        </DialogWrapper>
      </div>
      <p style="color: gray; margin-top: 8px">Test: Each Escape should close only the topmost layer</p>
    </section>

    <!-- Edge Case 2: Click outside with focusable element -->
    <section>
      <h3 style="font-weight: bold">Click Outside Test</h3>
      <div style="display: flex; gap: 8px; align-items: center">
        <DialogWrapper trigger="Open Dialog 1">
          <PopoverWrapper trigger="Open Popover 1">
            <DialogWrapper trigger="Open Dialog 2">Dialog 2 Content</DialogWrapper>
          </PopoverWrapper>
        </DialogWrapper>
        <button data-testid="outside-button">Outside Button</button>
        <input data-testid="outside-input" placeholder="Outside Input" />
      </div>
      <p style="color: gray; margin-top: 8px">Test: Click outside button/input should close layers appropriately</p>
    </section>

    <!-- Edge Case 3: Three dialogs in sequence -->
    <section>
      <h3 style="font-weight: bold">Dialog → Dialog → Dialog</h3>
      <div>
        <DialogWrapper trigger="Open Dialog 1">
          <DialogWrapper trigger="Open Dialog 2">
            <DialogWrapper trigger="Open Dialog 3">Dialog 3 Content</DialogWrapper>
          </DialogWrapper>
        </DialogWrapper>
      </div>
      <p style="color: gray; margin-top: 8px">Test: Each Escape closes only topmost dialog</p>
    </section>

    <!-- Edge Case 4: Three popovers in sequence -->
    <section>
      <h3 style="font-weight: bold">Popover → Popover → Popover</h3>
      <div>
        <PopoverWrapper trigger="Open Popover 1">
          <PopoverWrapper trigger="Open Popover 2">
            <PopoverWrapper trigger="Open Popover 3">Popover 3 Content</PopoverWrapper>
          </PopoverWrapper>
        </PopoverWrapper>
      </div>
      <p style="color: gray; margin-top: 8px">Test: Each Escape closes only topmost popover</p>
    </section>

    <!-- Edge Case 5: Alternating pattern -->
    <section>
      <h3 style="font-weight: bold">Popover → Dialog → Popover → Dialog</h3>
      <div>
        <PopoverWrapper trigger="Open Popover 1">
          <DialogWrapper trigger="Open Dialog 1">
            <PopoverWrapper trigger="Open Popover 2">
              <DialogWrapper trigger="Open Dialog 2">Dialog 2 Content</DialogWrapper>
            </PopoverWrapper>
          </DialogWrapper>
        </PopoverWrapper>
      </div>
      <p style="color: gray; margin-top: 8px">Test: Alternating layers should each close individually</p>
    </section>

    <!-- Edge Case 6: Dialog with sibling triggers -->
    <section>
      <h3 style="font-weight: bold">Dialog with Multiple Popover Triggers</h3>
      <div>
        <DialogWrapper trigger="Open Dialog 1">
          <div style="display: flex; gap: 8px">
            <PopoverWrapper trigger="Popover A">
              <DialogWrapper trigger="Open Dialog A">Dialog A Content</DialogWrapper>
            </PopoverWrapper>
            <PopoverWrapper trigger="Popover B">
              <DialogWrapper trigger="Open Dialog B">Dialog B Content</DialogWrapper>
            </PopoverWrapper>
          </div>
        </DialogWrapper>
      </div>
      <p style="color: gray; margin-top: 8px">Test: Opening one popover then another, closing should work correctly</p>
    </section>
  </div>
</main>
