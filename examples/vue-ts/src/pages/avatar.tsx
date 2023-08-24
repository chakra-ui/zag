import * as avatar from "@zag-js/avatar"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { computed, defineComponent, h, Fragment, ref } from "vue"
import { avatarData } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

const images = avatarData.full
const getRandomImage = () => images[Math.floor(Math.random() * images.length)]

export default defineComponent({
  name: "avatar",
  setup() {
    const [state, send] = useMachine(avatar.machine({ id: "1" }))
    const srcRef = ref(images[0])
    const showImageRef = ref(true)

    const apiRef = computed(() => avatar.connect(state.value, send, normalizeProps))

    return () => {
      const api = apiRef.value

      return (
        <>
          <main class="avatar">
            <div {...api.rootProps}>
              <span {...api.fallbackProps}>PA</span>
              {showImageRef.value && <img alt="" referrerpolicy="no-referrer" src={srcRef.value} {...api.imageProps} />}
            </div>

            <div class="controls">
              <button onClick={() => (srcRef.value = getRandomImage())}>Change Image</button>
              <button onClick={() => (srcRef.value = avatarData.broken)}>Broken Image</button>
              <button onClick={() => (showImageRef.value = !showImageRef.value)}>Toggle Image</button>
            </div>
          </main>

          <Toolbar>
            <StateVisualizer state={state} />
          </Toolbar>
        </>
      )
    }
  },
})
