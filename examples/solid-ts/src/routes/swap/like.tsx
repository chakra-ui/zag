import { createSignal } from "solid-js"
import { Swap } from "~/components/swap"
import "@styles/swap.css"

export default function Page() {
  const [liked, setLiked] = createSignal(false)

  return (
    <main>
      <div class="swap-like">
        <button
          type="button"
          class="swap-trigger"
          aria-label={`Like, ${liked() ? 129 : 128}`}
          aria-pressed={liked() ? "true" : "false"}
          onClick={() => setLiked((v) => !v)}
        >
          <Swap
            open={liked()}
            fallback={
              <svg class="swap-icon" viewBox="0 0 24 24" aria-hidden="true" data-testid="icon-unliked">
                <path d="M12 20.5s-8-4.9-8-11A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 8 2.5c0 6.1-8 11-8 11z" />
              </svg>
            }
          >
            <svg class="swap-icon" data-filled="" viewBox="0 0 24 24" aria-hidden="true" data-testid="icon-liked">
              <path d="M12 20.5s-8-4.9-8-11A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 8 2.5c0 6.1-8 11-8 11z" />
            </svg>
          </Swap>
        </button>
        <span class="swap-count" data-testid="like-count">
          {liked() ? 129 : 128}
        </span>
        <p class="swap-hint">Click the heart to like or unlike the post.</p>
      </div>
    </main>
  )
}
