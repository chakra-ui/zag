import { ArrowDownLeft, Maximize2, Minus, X } from "lucide-static"
import { defineHandler } from "nitro/h3"
import { Head } from "../../components/head"
import { Nav } from "../../components/nav"

function AutoSizingContent() {
  return (
    <div
      x-ref="autoSizing"
      x-data="{size: { width: 0, height: 0 }}"
      x-init="() => {
        const observer = new ResizeObserver(([entry]) => {
          const { width, height } = entry.contentRect
          size = {
            width: Math.round(width),
            height: Math.round(height),
          }
        });
        observer.observe($refs.autoSizing)
        return () => observer.disconnect()
      }"
      x-text="'ResizeObserver box: ' + size.width + 'x' + size.height"
      style={{
        resize: "horizontal",
        overflow: "auto",
        minWidth: "180px",
        maxWidth: "100%",
        padding: "0.5rem",
        border: "1px solid #d4d4d8",
        borderRadius: "0.5rem",
      }}
    />
  )
}

export default defineHandler((event) => {
  return (
    <html>
      <Head>
        <script type="module" src="/scripts/floating-panel.ts"></script>
      </Head>

      <body>
        <div
          class="page"
          x-data="{open: false, size: { width: 360, height: 260 }, position: { x: 120, y: 120 }}"
          x-floating="{
            id: $id('floating'),
            open,
            defaultOpen: true,
            size,
            position,
            onOpenChange(details) {open = details.open},
            onSizeChange(details) {size = details.size},
            onPositionChange(details) {position = details.position},
          }"
        >
          <Nav currentComponent={event.context.currentComponent as string} />

          <main class="floating-panel">
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
              <button x-on:click="open = !open" x-text="(open ? 'Close' : 'Open') + ' panel'" />
              <button x-on:click="size = { width: 420, height: 320 }">Set size: 420x320</button>
              <button x-on:click="position = { x: 32, y: 32 }">Set position: (32, 32)</button>
              <button x-on:click="$floating().setSize({ width: 440, height: 300 })">API set size: 440x300</button>
              <button x-on:click="$floating().setPosition({ x: 48, y: 48 })">API set position: (48, 48)</button>
              <button x-on:click="size = { width: 360, height: 260 }; position = { x: 120, y: 120 }">Reset rect</button>
            </div>

            <div
              style={{ marginBottom: "1rem" }}
              x-text="`size: ${Math.round($floating().size.width)}x${Math.round($floating().size.height)} | position: (${Math.round($floating().position.x)}, ${Math.round($floating().position.y)})`"
            />

            <div>
              <button x-floating:trigger>Toggle Panel</button>
              <div x-floating:positioner>
                <div x-floating:content>
                  <div x-floating:drag-trigger>
                    <div x-floating:header>
                      <p x-floating:title>Floating Panel</p>
                      <div x-floating:control>
                        <button x-floating:stage-trigger="{stage: 'minimized'}">{html(Minus)}</button>
                        <button x-floating:stage-trigger="{stage: 'maximized'}">{html(Maximize2)}</button>
                        <button x-floating:stage-trigger="{stage: 'default'}">{html(ArrowDownLeft)}</button>
                        <button x-floating:close-trigger>{html(X)}</button>
                      </div>
                    </div>
                  </div>
                  <div x-floating:body>
                    <p>Drag and resize to update external state.</p>
                    <p>Use the buttons above for externally controlled size and position.</p>
                    <AutoSizingContent />
                  </div>

                  <template x-for="axis in $axes" x-bind:key="axis">
                    <div x-floating:resize-trigger="{ axis }" />
                  </template>
                </div>
              </div>
            </div>
          </main>
        </div>
      </body>
    </html>
  )
})
