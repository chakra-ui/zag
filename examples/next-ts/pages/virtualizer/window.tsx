import { ClientOnly } from "../../components/client-only"
import { useWindowVirtualizer } from "../../hooks/use-virtualizer"

const generateItems = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: i,
    name: `Item ${i + 1}`,
    description: `This is the description for item ${i + 1}`,
  }))

const items = generateItems(10000)

function WindowDemo() {
  const { virtualizer, ref: setScrollRootRef } = useWindowVirtualizer({
    count: items.length,
    estimatedSize: () => 142,
    overscan: 8,
    gap: 0,
    paddingStart: 0,
    paddingEnd: 0,
    initialSize: typeof window !== "undefined" ? window.innerHeight : 800,
  })

  const virtualItems = virtualizer.getVirtualItems()
  const totalSize = virtualizer.getTotalSize()

  return (
    <>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
        <button type="button" onClick={() => virtualizer.scrollToIndex(0, { smooth: true })}>
          Scroll to top
        </button>
        <button
          type="button"
          onClick={() => virtualizer.scrollToIndex(Math.floor(items.length / 2), { align: "center", smooth: true })}
        >
          Scroll to middle
        </button>
        <button type="button" onClick={() => virtualizer.scrollToIndex(items.length - 1, { smooth: true })}>
          Scroll to bottom
        </button>
      </div>

      <div
        ref={setScrollRootRef}
        {...virtualizer.getContainerAriaAttrs()}
        style={{
          ...virtualizer.getContainerStyle(),
          width: "100%",
          marginTop: 20,
          border: "1px solid #d1d5db",
          borderRadius: 8,
        }}
      >
        <div
          style={{
            height: `${totalSize}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {virtualItems.map((virtualItem) => {
            const item = items[virtualItem.index]
            const style = virtualizer.getItemStyle(virtualItem)

            return (
              <div
                key={virtualItem.index}
                data-index={virtualItem.index}
                {...virtualizer.getItemAriaAttrs(virtualItem.index)}
                style={{
                  ...style,
                  padding: "16px",
                  backgroundColor: virtualItem.index % 2 === 0 ? "#f8f9fa" : "#ffffff",
                  borderBottom: "1px solid #e1e5e9",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontWeight: "600",
                    fontSize: "16px",
                    color: "#1a1a1a",
                  }}
                >
                  {item.name}
                </div>
                <p style={{ margin: 0 }}>{item.description}</p>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#9ca3af",
                    fontFamily: "monospace",
                  }}
                >
                  Virtual index: {virtualItem.index} | Start: {virtualItem.start}px | Size: {virtualItem.size}px
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ marginTop: 16, fontSize: "14px", color: "#6b7280" }}>
        <div>Total items: {items.length.toLocaleString()}</div>
        <div>Rendered rows: {virtualItems.length}</div>
        <div>Total height: {totalSize}px</div>
        <div>
          Visible range: {virtualItems[0]?.index ?? 0} — {virtualItems[virtualItems.length - 1]?.index ?? 0}
        </div>
      </div>
    </>
  )
}

export default function Page() {
  return (
    <main className="window-list-virtualizer" style={{ maxWidth: 960, margin: "0 auto", padding: "20px 20px 80px" }}>
      <h1>Window virtualizer</h1>
      <p style={{ color: "#4b5563", lineHeight: 1.6 }}>
        <code>WindowVirtualizer</code> delegates scrolling to the nearest scrollable ancestor (or <code>window</code>).
        No <code>onScroll</code> handler is needed on the virtualizer root. Smooth <code>scrollToIndex</code> uses
        native <code>behavior: &quot;smooth&quot;</code> on the real scroll target.
      </p>

      <ClientOnly
        fallback={
          <div style={{ marginTop: 16, color: "#6b7280" }} aria-busy="true">
            Loading virtualizer…
          </div>
        }
      >
        <WindowDemo />
      </ClientOnly>
    </main>
  )
}
