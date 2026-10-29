<script lang="ts">
  import NumberFlow from "#lib/components/number-flow.svelte"
  import { HeartIcon } from "lucide-svelte"
  import "@styles/number-flow.css"

  const compact = { notation: "compact", maximumFractionDigits: 1 } as const

  let views = $state(12_480)
  let likes = $state(1_249)
  let liked = $state(false)

  // Views keep climbing; compact notation keeps the figure short
  $effect(() => {
    const id = setInterval(() => (views += Math.round(Math.random() * 600)), 1200)
    return () => clearInterval(id)
  })
</script>

<main class="number-flow">
  <div class="nf-card">
    <span class="nf-card-title">Launch video</span>
    <div class="nf-stats">
      <div>
        <NumberFlow value={views} formatOptions={compact} />
        <span class="nf-caption">Views</span>
      </div>
      <div>
        <NumberFlow value={likes} formatOptions={compact} />
        <span class="nf-caption">Likes</span>
      </div>
    </div>
    <button
      class="nf-like"
      aria-pressed={liked}
      onclick={() => {
        likes += liked ? -1 : 1
        liked = !liked
      }}
    >
      <HeartIcon />
      {liked ? "Liked" : "Like"}
    </button>
  </div>
</main>
