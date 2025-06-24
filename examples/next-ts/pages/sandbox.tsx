import { useScrollView } from "../hooks/use-scroll-view"

export default function Page() {
  const ref = useScrollView({
    offset: { bottom: 40 },
    onScrollStart: () => console.log("scroll start"),
    onScrollEnd: () => console.log("scroll end"),
    onScrollChange: (scrolling) => console.log("scroll change", scrolling),
    onSideReached(sides) {
      console.log("side reached", sides)
    },
  })
  return (
    <main>
      <div ref={ref} style={{ width: "400px", height: "400px", overflow: "scroll" }}>
        <div style={{ width: "600px", height: "600px", background: "gray" }} />
      </div>
    </main>
  )
}
