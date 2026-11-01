import { HeartIcon } from "lucide-solid"
import { createSignal, onCleanup, onMount } from "solid-js"
import { NumberFlow } from "~/components/number-flow"
import "@styles/number-flow.css"

const compact = { notation: "compact", maximumFractionDigits: 1 } as const

export default function Page() {
  const [views, setViews] = createSignal(12_480)
  const [likes, setLikes] = createSignal(1_249)
  const [liked, setLiked] = createSignal(false)

  // Views keep climbing; compact notation keeps the figure short
  onMount(() => {
    const id = setInterval(() => setViews((v) => v + Math.round(Math.random() * 600)), 1200)
    onCleanup(() => clearInterval(id))
  })

  return (
    <main class="number-flow">
      <div class="nf-card">
        <span class="nf-card-title">Launch video</span>
        <div class="nf-stats">
          <div>
            <NumberFlow value={views()} formatOptions={compact} />
            <span class="nf-caption">Views</span>
          </div>
          <div>
            <NumberFlow value={likes()} formatOptions={compact} />
            <span class="nf-caption">Likes</span>
          </div>
        </div>
        <button
          class="nf-like"
          aria-pressed={liked()}
          onClick={() => {
            setLikes((l) => l + (liked() ? -1 : 1))
            setLiked(!liked())
          }}
        >
          <HeartIcon /> {liked() ? "Liked" : "Like"}
        </button>
      </div>
    </main>
  )
}
